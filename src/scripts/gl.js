import { Renderer, Program, Mesh, Plane, Texture } from 'ogl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, finePointer } from './lib.js';

// One fixed canvas draws every project screenshot at its DOM position.
// Each image dissolves in through noise with a thin ink edge as it enters,
// bends a little with scroll speed, and swells under the cursor like a lens.
// The DOM <img> stays in place for layout and accessibility.

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform vec4 uRect;      // x, y, w, h in CSS px
  uniform vec2 uViewport;  // CSS px
  uniform float uVelocity; // px per frame, signed
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec2 p = position.xy + 0.5;
    float x = uRect.x + p.x * uRect.z;
    float y = uRect.y + (1.0 - p.y) * uRect.w;
    // Bow the image along its width: the middle lags behind the edges.
    y += sin(p.x * 3.14159) * uVelocity;
    vec2 clip = vec2(x / uViewport.x * 2.0 - 1.0, 1.0 - y / uViewport.y * 2.0);
    gl_Position = vec4(clip, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uReveal;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uSeed;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Lens: pull the texture towards the cursor inside a soft circle.
    vec2 d = (uv - uMouse) * vec2(uAspect, 1.0);
    float r = length(d);
    float lens = smoothstep(0.32, 0.0, r) * uHover;
    uv = mix(uv, uMouse, lens * 0.22);

    vec4 img = texture2D(tMap, uv);

    // Dissolve: a noise field sweeps bottom to top as uReveal goes 0 -> 1.
    float n = fbm(vUv * vec2(uAspect, 1.0) * 3.0 + uSeed) * 0.55 + (1.0 - vUv.y) * 0.45;
    float t = uReveal * 1.12 - 0.06;
    float shown = smoothstep(t, t - 0.01, n);
    float edge = smoothstep(t - 0.035, t - 0.012, n) * (1.0 - smoothstep(t - 0.012, t, n));

    vec3 ink = vec3(0.055);
    vec3 col = mix(img.rgb, ink, edge * step(0.001, uReveal) * step(uReveal, 0.999));
    float alpha = max(shown, edge * step(uReveal, 0.999));
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

export function initGL(canvas, lenis) {
  const medias = [...document.querySelectorAll('[data-tile-media]')];
  if (!medias.length) return null;

  let renderer;
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2), alpha: true, premultipliedAlpha: true });
  } catch (e) {
    return null;
  }
  const gl = renderer.gl;
  if (!gl) return null;
  gl.clearColor(0, 0, 0, 0);

  const geometry = new Plane(gl, { widthSegments: 24, heightSegments: 1 });
  const viewport = [window.innerWidth, window.innerHeight];
  const resize = () => {
    viewport[0] = window.innerWidth;
    viewport[1] = window.innerHeight;
    renderer.setSize(viewport[0], viewport[1]);
  };
  resize();
  window.addEventListener('resize', resize);

  const items = medias.map((el, i) => {
    const img = el.querySelector('img');
    const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
    const source = new Image();
    source.decoding = 'async';
    source.onload = () => (texture.image = source);
    source.src = img.currentSrc || img.src;
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        tMap: { value: texture },
        uRect: { value: [0, 0, 1, 1] },
        uViewport: { value: viewport },
        uVelocity: { value: 0 },
        uReveal: { value: 0 },
        uHover: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
        uAspect: { value: 1 },
        uSeed: { value: i * 7.31 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const u = program.uniforms;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(u.uReveal, { value: 1, duration: 1.8, ease: 'power2.inOut' }),
    });

    if (finePointer) {
      const host = el.closest('a, div');
      host.addEventListener('pointerenter', () => gsap.to(u.uHover, { value: 1, duration: 0.6, ease: 'power3.out' }));
      host.addEventListener('pointerleave', () => gsap.to(u.uHover, { value: 0, duration: 0.8, ease: 'power3.out' }));
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(u.uMouse.value, { 0: (e.clientX - r.left) / r.width, 1: 1 - (e.clientY - r.top) / r.height, duration: 0.5, ease: 'power3.out' });
      });
    }
    return { el, mesh, u, texture };
  });

  document.documentElement.classList.add('gl-on');

  let vel = 0;
  gsap.ticker.add(() => {
    const target = clamp((lenis?.velocity ?? 0) * 1.2, -40, 40);
    vel += (target - vel) * 0.12;
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const it of items) {
      if (!it.texture.image) continue;
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -60 || r.top > viewport[1] + 60) continue;
      it.u.uRect.value = [r.left, r.top, r.width, r.height];
      it.u.uAspect.value = r.width / r.height;
      it.u.uVelocity.value = vel;
      renderer.render({ scene: it.mesh, clear: false });
    }
  });

  return items;
}
