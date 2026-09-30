import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { $, $$, lerp, canHover, reduced } from '../utils.js';

/*
 * Labs: the one place with WebGL. A halftone dot field that bulges and turns blue
 * around the cursor (a "petri dish" for the experiments), a title that scrambles
 * itself, and specimen cards that fly in from three directions and can be
 * dragged around the table.
 */

const vertex = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uHover;
  uniform float uDpr;
  uniform vec3 uInk;
  uniform vec3 uBlue;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    float cell = 24.0 * uDpr;
    vec2 id = floor(p / cell);
    vec2 c = (id + 0.5) * cell;

    float d = distance(c, uMouse);
    float infl = smoothstep(280.0 * uDpr, 0.0, d) * uHover;
    float n = noise(id * 0.09 + vec2(uTime * 0.12, -uTime * 0.08));

    vec2 dir = normalize(c - uMouse + 0.0001);
    vec2 cc = c + dir * infl * cell * 0.16;
    float r = cell * (0.05 + 0.07 * n * n + infl * 0.26);

    float dist = distance(p, cc);
    float a = 1.0 - smoothstep(r - 1.0 * uDpr, r, dist);
    vec3 col = mix(uInk, uBlue, smoothstep(0.05, 0.6, infl));
    float alpha = a * mix(0.16 + 0.12 * n, 1.0, smoothstep(0.0, 0.5, infl));
    gl_FragColor = vec4(col, alpha);
  }
`;

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function initField(section) {
  const canvas = $('[data-labs-field]', section);
  let renderer;
  try {
    renderer = new Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio, 2), antialias: false });
  } catch {
    canvas.remove();
    return;
  }
  const gl = renderer.gl;
  if (!gl) return;
  const styles = getComputedStyle(document.documentElement);
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    uniforms: {
      uRes: { value: [1, 1] },
      uMouse: { value: [-9999, -9999] },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uDpr: { value: renderer.dpr },
      uInk: { value: hex(styles.getPropertyValue('--ink').trim() || '#0e0e0e') },
      uBlue: { value: hex(styles.getPropertyValue('--blue').trim() || '#2340ff') },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const { width, height } = section.getBoundingClientRect();
    renderer.setSize(width, height);
    program.uniforms.uRes.value = [width * renderer.dpr, height * renderer.dpr];
  };
  resize();
  ScrollTrigger.addEventListener('refresh', resize);

  const target = { x: -9999, y: -9999, hover: 0 };
  const current = { x: -9999, y: -9999 };
  const toLocal = (cx, cy) => {
    const b = section.getBoundingClientRect();
    return { x: (cx - b.left) * renderer.dpr, y: (b.height - (cy - b.top)) * renderer.dpr };
  };
  let lastClient = null;
  section.addEventListener('pointermove', (e) => {
    lastClient = { x: e.clientX, y: e.clientY };
    target.hover = 1;
  });
  section.addEventListener('pointerleave', () => {
    lastClient = null;
    target.hover = 0;
  });

  let visible = false;
  ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });

  gsap.ticker.add((time) => {
    if (!visible) return;
    if (!canHover || !lastClient) {
      // No cursor: a slow wandering "probe" keeps the dish alive.
      const b = section.getBoundingClientRect();
      const wx = b.width * (0.5 + 0.35 * Math.sin(time * 0.35));
      const wy = b.height * (0.5 + 0.3 * Math.sin(time * 0.52 + 1.2));
      Object.assign(target, { x: wx * renderer.dpr, y: (b.height - wy) * renderer.dpr, hover: canHover ? 0 : 0.8 });
    } else {
      Object.assign(target, toLocal(lastClient.x, lastClient.y));
    }
    if (current.x < -9000) Object.assign(current, target);
    current.x = lerp(current.x, target.x, 0.12);
    current.y = lerp(current.y, target.y, 0.12);
    const u = program.uniforms;
    u.uMouse.value = [current.x, current.y];
    u.uHover.value = lerp(u.uHover.value, target.hover, 0.06);
    u.uTime.value = reduced ? 0 : time;
    renderer.render({ scene: mesh });
  });
}

export function initLabs() {
  const section = $('#labs');
  initField(section);

  // Title scrambles into place, and again whenever you poke it.
  const sub = $('[data-scramble]', section);
  const text = sub.textContent;
  const scramble = () =>
    gsap.to(sub, { duration: 1.6, scrambleText: { text, chars: '!<>-_\\/[]{}=+*^?#01', revealDelay: 0.2, speed: 0.5 } });
  if (!reduced) {
    ScrollTrigger.create({ trigger: sub, start: 'top 85%', onEnter: scramble });
    sub.addEventListener('pointerenter', scramble);
    gsap.from($('.labs__title-big', section), {
      letterSpacing: '0.2em',
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 90%', end: 'top 30%', scrub: true },
    });
  }

  // Specimens: fly in from the left, the top and the right, then they're yours to drag.
  const specimens = $$('[data-specimen]', section);
  const table = $('[data-labs-table]', section);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    section.classList.add('labs--scatter');
    if (!reduced) {
      specimens.forEach((s) => {
        const from = s.dataset.from;
        const vars = {
          left: { x: -window.innerWidth * 0.6, rotation: -35 },
          top: { y: -window.innerHeight * 0.7, rotation: 25 },
          right: { x: window.innerWidth * 0.6, rotation: 40 },
        }[from];
        gsap.from(s, {
          ...vars,
          ease: 'power2.out',
          scrollTrigger: { trigger: table, start: 'top 95%', end: 'top 35%', scrub: 1 },
        });
      });
    }
    const drags = Draggable.create($$('[data-specimen-card]', section), {
      type: 'x,y',
      bounds: section,
      inertia: true,
      zIndexBoost: true,
      dragClickables: false,
      onPress() {
        gsap.to(this.target, { scale: 1.04, duration: 0.3 });
      },
      onDragStart() {
        this.target.classList.add('is-dragging');
      },
      onRelease() {
        this.target.classList.remove('is-dragging');
        gsap.to(this.target, { scale: 1, rotationX: 0, rotationY: 0, duration: 0.5 });
      },
    });
    return () => {
      drags.forEach((d) => d.kill());
      gsap.set($$('[data-specimen-card]', section), { clearProps: 'transform' });
      section.classList.remove('labs--scatter');
    };
  });

  // Cards tilt toward the cursor, like they're being inspected.
  if (canHover && !reduced) {
    $$('[data-specimen-card]', section).forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', (e) => {
        if (card.classList.contains('is-dragging')) return;
        const b = card.getBoundingClientRect();
        rx(((e.clientY - b.top) / b.height - 0.5) * -14);
        ry(((e.clientX - b.left) / b.width - 0.5) * 14);
      });
      card.addEventListener('pointerleave', () => {
        rx(0);
        ry(0);
      });
    });
  }
}
