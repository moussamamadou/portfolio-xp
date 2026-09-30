import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Matter from 'matter-js';
import { $, $$, reduced, clamp } from './lib.js';

const { Engine, Bodies, Body, Composite, Constraint } = Matter;

// The tools drop into a box when it scrolls into view. Pick one up and its
// note shows behind the pile. Without motion, they are a plain row of pills.
export function initToolkit(lenis) {
  const pit = $('[data-pit]');
  const pills = $$('[data-pill]', pit);
  const note = $('[data-pit-note]', pit);

  const say = (pill) => {
    note.replaceChildren();
    const name = document.createElement('span');
    name.className = 'mono';
    name.textContent = pill.textContent.trim();
    note.append(name, pill.dataset.note);
  };
  pills.forEach((p) => {
    p.addEventListener('focus', () => say(p));
    p.addEventListener('pointerenter', () => say(p));
  });

  if (reduced) return;

  pit.classList.add('is-physics');
  const engine = Engine.create();
  engine.gravity.y = 1.1;
  let walls = [];
  let W = 0;
  let H = 0;

  const build = () => {
    W = pit.clientWidth;
    H = pit.clientHeight;
    Composite.remove(engine.world, walls);
    const t = 200;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, H / 2, t, H * 6, { isStatic: true }),
      Bodies.rectangle(W + t / 2, H / 2, t, H * 6, { isStatic: true }),
      Bodies.rectangle(W / 2, -H * 2 - t / 2, W * 3, t, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);
  };
  build();

  const items = pills.map((el, i) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const body = Bodies.rectangle(W * (0.15 + 0.7 * Math.random()), -h - i * h * 1.3, w, h, {
      chamfer: { radius: h / 2 - 1 },
      restitution: 0.35,
      friction: 0.3,
      frictionAir: 0.012,
      angle: (Math.random() - 0.5) * 0.8,
    });
    return { el, body, w, h };
  });
  const sync = () =>
    items.forEach(({ el, body, w, h }) => {
      el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
    });
  sync();

  let live = false;
  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(pit);
  ScrollTrigger.create({
    trigger: pit,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      live = true;
      Composite.add(engine.world, items.map((i) => i.body));
    },
  });

  gsap.ticker.add((_, dt) => {
    if (!live || !visible) return;
    Engine.update(engine, Math.min(dt, 32));
    sync();
  });

  // A fast scroll jolts the pile a little.
  lenis?.on('scroll', ({ velocity }) => {
    if (!live || !visible || Math.abs(velocity) < 8) return;
    items.forEach(({ body }) => {
      if (body.position.y > H - 200) Body.setVelocity(body, { x: body.velocity.x + (Math.random() - 0.5) * 2, y: -clamp(Math.abs(velocity) * 0.25, 0, 7) });
    });
  });

  // Drag: a spring from the pointer to where the pill was grabbed.
  let drag = null;
  const local = (e) => {
    const r = pit.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  items.forEach(({ el, body }) => {
    el.addEventListener('pointerdown', (e) => {
      if (!live) return;
      el.setPointerCapture(e.pointerId);
      const p = local(e);
      const dx = p.x - body.position.x;
      const dy = p.y - body.position.y;
      const c = Math.cos(-body.angle);
      const s = Math.sin(-body.angle);
      drag = Constraint.create({ pointA: p, bodyB: body, pointB: { x: dx * c - dy * s, y: dx * s + dy * c }, stiffness: 0.12, damping: 0.1, length: 0 });
      Composite.add(engine.world, drag);
      say(el);
    });
    el.addEventListener('pointermove', (e) => {
      if (drag?.bodyB === body) drag.pointA = local(e);
    });
    const drop = () => {
      if (drag?.bodyB !== body) return;
      Composite.remove(engine.world, drag);
      drag = null;
    };
    el.addEventListener('pointerup', drop);
    el.addEventListener('pointercancel', drop);
    // Keyboard or a plain click: toss it.
    el.addEventListener('click', () => {
      if (live) Body.setVelocity(body, { x: (Math.random() - 0.5) * 8, y: -14 });
    });
  });

  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    build();
    items.forEach(({ body }) => Body.setPosition(body, { x: clamp(body.position.x, 40, W - 40), y: Math.min(body.position.y, H - 60) }));
  });
}
