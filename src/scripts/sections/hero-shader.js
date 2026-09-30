import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { Renderer, Program, Mesh, Triangle, Texture, Flowmap, Vec2 } from 'ogl';
import { $$, canHover } from '../utils.js';

/*
 * The hero name as a shader. The fitted DOM letters are redrawn into a texture;
 * a flowmap (a fading trail of the pointer's movement) snaps the letters to a
 * pixel grid along the trail, and a pixel lens (rings of halving block size)
 * sits under the pointer. The
 * grid only takes power-of-two sizes so neighbouring blocks line up cleanly.
 * Scrolling away grows the pixels until the name dissolves.
 */

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform sampler2D tFlow;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform float uScroll;
  uniform vec3 uInk;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uRadius;
  varying vec2 vUv;

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;
    // A pixel lens around the pointer (rings of halving block size), plus the
    // fading trail it leaves behind.
    float d = distance(gl_FragCoord.xy, uMouse);
    float lens = (1.0 - smoothstep(0.0, uRadius, d)) * uHover;
    float s = max(lens, smoothstep(0.05, 0.6, flow.b) * 0.7);

    vec2 uv = vUv;
    float px = (1.0 + s * 40.0 + uScroll * 90.0) * uDpr;
    float level = exp2(floor(log2(max(px, 1.0))));
    float a;
    if (level > 1.5 * uDpr) {
      vec2 cell = level / uRes;
      a = step(0.5, texture2D(tMap, (floor(uv / cell) + 0.5) * cell).a);
    } else {
      a = texture2D(tMap, uv).a;
    }
    a *= 1.0 - smoothstep(0.3, 0.75, uScroll);
    gl_FragColor = vec4(uInk, a);
  }
`;

export function initNameShader(stage, hero) {
  const name = stage.querySelector('[data-hero-name]');
  let renderer;
  try {
    renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true, premultipliedAlpha: false });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!gl) return null;
  gl.clearColor(0, 0, 0, 0);
  const canvas = gl.canvas;
  canvas.className = 'hero__gl';
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  const paper = document.createElement('canvas');
  const ctx = paper.getContext('2d');

  let flowmap;
  try {
    flowmap = new Flowmap(gl, { size: 64, falloff: 0.2, dissipation: 0.93 });
  } catch {
    canvas.remove();
    return null;
  }

  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    uniforms: {
      tMap: { value: texture },
      tFlow: flowmap.uniform,
      uRes: { value: [1, 1] },
      uDpr: { value: renderer.dpr },
      uScroll: { value: 0 },
      uInk: { value: [11 / 255, 11 / 255, 11 / 255] },
      uMouse: { value: [-9999, -9999] },
      uHover: { value: 0 },
      uRadius: { value: 200 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  let W = 1;
  let H = 1;
  // Redraw the DOM letters, glyph by glyph, where they sit on screen.
  const paint = () => {
    const box = stage.getBoundingClientRect();
    W = box.width;
    H = box.height;
    renderer.setSize(W, H);
    const dpr = renderer.dpr;
    paper.width = Math.round(W * dpr);
    paper.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'alphabetic';
    $$('.char', name).forEach((c) => {
      const cs = getComputedStyle(c);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText(c.textContent);
      const r = c.getBoundingClientRect();
      const asc = m.fontBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent;
      const y = r.top - box.top + (r.height - (asc + desc)) / 2 + asc;
      ctx.fillText(c.textContent.toUpperCase(), r.left - box.left, y);
    });
    texture.image = paper;
    texture.needsUpdate = true;
    program.uniforms.uRes.value = [W * dpr, H * dpr];
    program.uniforms.uRadius.value = Math.min(W * 0.16, H * 0.5) * dpr;
    flowmap.aspect = W / H;
  };

  // Pointer: position in 0..1, velocity in px per ms, as the flowmap expects.
  const last = new Vec2(-1, -1);
  const velocity = new Vec2();
  let lastTime = 0;
  let moved = false;
  const move = (clientX, clientY) => {
    const box = stage.getBoundingClientRect();
    const x = (clientX - box.left) / box.width;
    const y = 1 - (clientY - box.top) / box.height;
    flowmap.mouse.set(x, y);
    program.uniforms.uMouse.value = [x * box.width * renderer.dpr, y * box.height * renderer.dpr];
    const now = performance.now();
    if (last.x < 0) {
      last.set(clientX, clientY);
      lastTime = now;
    }
    const dt = Math.max(14, now - lastTime);
    velocity.set((clientX - last.x) / dt, (clientY - last.y) / dt);
    last.set(clientX, clientY);
    lastTime = now;
    moved = true;
  };
  let hover = 0;
  let inside = false;
  hero.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
  // Touch: the lens only shows while a finger is on the name.
  stage.addEventListener('pointerenter', () => (inside = true));
  stage.addEventListener('pointerleave', () => (inside = false));
  if (!canHover) {
    stage.addEventListener('pointerdown', (e) => ((inside = true), move(e.clientX, e.clientY)));
    window.addEventListener('pointerup', () => (inside = false));
    window.addEventListener('pointercancel', () => (inside = false));
  }

  let started = false;
  let visible = true;
  ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (s) => (program.uniforms.uScroll.value = s.progress),
  });
  ScrollTrigger.addEventListener('refresh', () => started && paint());

  gsap.ticker.add(() => {
    if (!started || !visible) return;
    if (!moved) velocity.set(0, 0);
    moved = false;
    hover += ((inside ? 1 : 0) - hover) * 0.08;
    program.uniforms.uHover.value = hover;
    flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
    flowmap.update();
    renderer.render({ scene: mesh });
  });

  return {
    start() {
      if (started) return;
      paint();
      started = true;
      renderer.render({ scene: mesh });
      name.classList.add('is-gl');
      canvas.classList.add('is-on');
    },
  };
}
