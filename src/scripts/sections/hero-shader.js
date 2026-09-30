import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { $$, canHover } from '../utils.js';

/*
 * The hero name as a shader. The fitted DOM letters are redrawn into a texture
 * and the shader runs a soft horizontal lens along them: letters under the
 * cursor widen on a bell curve and ease back as it leaves. Scrolling away
 * stretches the whole name downward as it fades.
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
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uRadius;
  uniform float uAmount;
  uniform float uScroll;
  uniform vec3 uInk;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * uRes;
    float dx = (p.x - uMouse.x) / uRadius;
    float bump = exp(-dx * dx) * uAmount;

    // Wider under the cursor: a one-dimensional lens that slides along the
    // line, so the lines never run into each other.
    float mx = uMouse.x / uRes.x;
    float x = mx + (vUv.x - mx) / (1.0 + bump * 0.4);
    float y = vUv.y;

    // Leaving: the name stretches down from its top edge.
    y = 1.0 - (1.0 - y) / (1.0 + uScroll * 2.4);

    float a = texture2D(tMap, vec2(x, y)).a;
    a *= 1.0 - smoothstep(0.35, 0.85, uScroll);
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

  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    uniforms: {
      tMap: { value: texture },
      uRes: { value: [1, 1] },
      uMouse: { value: [0, 0] },
      uRadius: { value: 200 },
      uAmount: { value: 0 },
      uScroll: { value: 0 },
      uInk: { value: [11 / 255, 11 / 255, 11 / 255] },
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
    program.uniforms.uRadius.value = W * 0.09 * dpr;
  };

  // Pointer, eased: position in stage pixels (y up).
  const target = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  let inside = false;
  const move = (clientX, clientY) => {
    const box = stage.getBoundingClientRect();
    target.x = clientX - box.left;
    target.y = box.height - (clientY - box.top);
  };
  hero.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
  stage.addEventListener('pointerenter', (e) => {
    inside = true;
    move(e.clientX, e.clientY);
    Object.assign(pos, target);
  });
  stage.addEventListener('pointerleave', () => (inside = false));
  // Touch: the name stretches only while a finger is on it.
  if (!canHover) {
    stage.addEventListener('pointerdown', (e) => {
      inside = true;
      move(e.clientX, e.clientY);
      Object.assign(pos, target);
    });
    window.addEventListener('pointerup', () => (inside = false));
    window.addEventListener('pointercancel', () => (inside = false));
  }
  let amount = 0;

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
    const u = program.uniforms;
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    amount += ((inside ? 1 : 0) - amount) * 0.07;
    u.uMouse.value = [pos.x * renderer.dpr, pos.y * renderer.dpr];
    u.uAmount.value = amount;
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
