import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { $, $$, lerp, clamp, splitChars, fitText, canHover, reduced } from '../utils.js';

/*
 * Labs: the one place with WebGL. A field of tiny square dots that swell and turn
 * darker around the cursor, a title that scans in, and spec sheets that print out
 * and can be thrown around the table.
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
    float r = cell * (0.04 + 0.05 * n * n + infl * 0.22);

    vec2 dd = abs(p - cc);
    float dist = max(dd.x, dd.y);
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
      uBlue: { value: hex(styles.getPropertyValue('--ink').trim() || '#0b0b0b') },
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

  // "Labs" is set edge to edge and its letters wipe up one after the other.
  const big = $('[data-labs-big]', section);
  const chars = splitChars(big);
  fitText([big]);
  if (!reduced) {
    gsap.fromTo(
      chars,
      { clipPath: 'inset(100% -30% -10% -30%)' },
      {
        clipPath: 'inset(-10% -30% -10% -30%)',
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: big, start: 'top 95%', end: 'top 45%', scrub: 0.6 },
      },
    );
  }

  // The subtitle scrambles into place, and again whenever you poke it.
  const sub = $('[data-scramble]', section);
  const text = sub.textContent;
  const scramble = () =>
    gsap.to(sub, { duration: 1.4, scrambleText: { text, chars: 'ABCDEFGHKMNOPRSTUXZ/_+', revealDelay: 0.2, speed: 0.5 } });
  if (!reduced) {
    ScrollTrigger.create({ trigger: sub, start: 'top 85%', onEnter: scramble });
    sub.addEventListener('pointerenter', scramble);
  }

  // Sheets print out: each one feeds down out of an invisible slot.
  const sheets = $$('[data-sheet]', section);
  const table = $('[data-labs-table]', section);
  if (!reduced) {
    sheets.forEach((sheet, i) => {
      gsap.fromTo(
        $('[data-sheet-paper]', sheet),
        { clipPath: 'inset(0% 0% 100% 0%)', yPercent: -12 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: table, start: `top ${92 - i * 8}%`, end: `top ${45 - i * 8}%`, scrub: 0.6 },
        },
      );
    });
  }

  // On desktop they're loose on the table: drag them, throw them, they tilt as they go.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    section.classList.add('labs--scatter');
    const papers = $$('[data-sheet]', section);
    const drags = Draggable.create(papers, {
      type: 'x,y',
      bounds: section,
      inertia: true,
      zIndexBoost: true,
      dragClickables: false,
      onPress() {
        $('[data-sheet-paper]', this.target).classList.add('is-dragging');
      },
      onDrag() {
        gsap.to($('[data-sheet-paper]', this.target), { rotation: clamp(this.deltaX * 0.6, -12, 12), duration: 0.4, overwrite: 'auto' });
      },
      onRelease() {
        const paper = $('[data-sheet-paper]', this.target);
        paper.classList.remove('is-dragging');
        gsap.to(paper, { rotation: 0, duration: 1, ease: 'elastic.out(1, 0.4)' });
      },
    });
    return () => {
      drags.forEach((d) => d.kill());
      gsap.set(papers, { clearProps: 'transform' });
      section.classList.remove('labs--scatter');
    };
  });
}
