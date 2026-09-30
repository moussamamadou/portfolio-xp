import gsap from 'gsap';
import { $, $$, reduced, clamp } from './lib.js';

// Lab cards slide in from the right and stack like an accordion, leaving
// their spines behind. Each card carries a small live demo of its idea.
export function initLabs(lenis) {
  const deck = $('[data-deck]');
  const labs = $$('[data-lab]', deck);
  if (reduced) return;

  const spine = () => parseFloat(getComputedStyle($('.labs')).getPropertyValue('--spine'));
  // Every waiting card starts parked at the right edge, spines side by side.
  const parked = () => deck.clientWidth - labs.length * spine();

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.labs', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
  });
  tl.fromTo('[data-labs-title]', { '--w': 62 }, { '--w': 125, duration: 0.25 }, 0);
  labs.slice(1).forEach((lab, i) => {
    tl.fromTo(lab, { x: parked }, { x: 0, duration: 1, ease: 'power2.inOut' }, 0.3 + i * 1.2);
  });
  tl.set({}, {}, '+=0.3');

  // L01: rows of type lag behind the scroll by different amounts.
  const rows = $$('.demo-scroll span');
  const xs = rows.map((r) => gsap.quickTo(r, 'x', { duration: 0.4 + 0.25 * rows.indexOf(r), ease: 'power3.out' }));
  lenis?.on('scroll', ({ velocity }) => {
    rows.forEach((_, i) => xs[i](clamp(velocity * (i % 2 ? -1 : 1) * (4 + i * 3), -260, 260)));
  });

  // L02: a dot rides a path as the deck scrolls.
  const path = $('[data-path]');
  const dot = $('[data-path-dot]');
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  const drawPath = (p) => {
    const pt = path.getPointAtLength(len * p);
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    path.style.strokeDashoffset = `${len * (1 - p)}`;
  };
  drawPath(0);
  gsap.timeline({
    scrollTrigger: {
      trigger: '.labs',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => drawPath(clamp((self.progress - 0.25) / 0.6)),
    },
  });

  // L03: a dot field that parts around the pointer and breathes on its own.
  initGrid($('[data-grid]'));
}

function initGrid(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let w = 0;
  let h = 0;
  let dots = [];
  const mouse = { x: -999, y: -999 };
  const size = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    dots = [];
    const gap = 22;
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ x, y, ox: 0, oy: 0 });
  };
  new ResizeObserver(size).observe(canvas);

  const host = canvas.closest('[data-lab]');
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  host.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -999;
  });

  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  gsap.ticker.add((t) => {
    if (!visible || !w) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#eeede8';
    for (const d of dots) {
      const dx = d.x - mouse.x;
      const dy = d.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      const push = dist < 110 ? (1 - dist / 110) * 26 : 0;
      const wave = Math.sin(t * 1.6 + d.x * 0.03 + d.y * 0.02) * 2.5;
      d.ox += ((dist ? (dx / dist) * push : 0) - d.ox) * 0.15;
      d.oy += ((dist ? (dy / dist) * push : 0) + wave - d.oy) * 0.15;
      const r = 1.3 + push * 0.08;
      ctx.beginPath();
      ctx.arc(d.x + d.ox, d.y + d.oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
