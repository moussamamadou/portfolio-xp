import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Matter from 'matter-js';
import { $, $$, splitChars, rand, reduced } from '../utils.js';

const { Engine, Bodies, Body, Composite, Constraint } = Matter;

/*
 * Expertise: a physics playground on graph paper. Every skill is a tag that drops
 * into the box when you arrive; grab them, throw them, shake the box. Hovering
 * the legend makes the matching tag jump. The title's weight ripples with the scroll.
 */
export function initExpertise() {
  const section = $('#expertise');

  // Title: a wave of font-weight travels through the letters as you scroll.
  const title = $('[data-weight-wave]', section);
  const chars = splitChars(title);
  if (!reduced) {
    ScrollTrigger.create({
      trigger: title,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const p = self.progress * 14;
        chars.forEach((c, i) => {
          c.style.fontWeight = (330 + 520 * (0.5 + 0.5 * Math.sin(p - i * 0.28))).toFixed(0);
        });
      },
    });
  }

  initPlayground(section);
}

function initPlayground(section) {
  const box = $('[data-playground]', section);
  const pills = $$('[data-tag]', box);
  const engine = Engine.create({ gravity: { y: 1.1 } });
  const world = engine.world;
  const items = [];
  let walls = [];
  let started = false;
  let visible = false;
  let size = { w: 0, h: 0 };

  const buildWalls = (withCeiling) => {
    Composite.remove(world, walls);
    const { width: w, height: h } = box.getBoundingClientRect();
    const top = $('.playground__bar', box).offsetHeight;
    size = { w, h };
    const t = 400;
    walls = [
      Bodies.rectangle(w / 2, h + t / 2, w * 3, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, h / 2 - 1000, t, h * 2 + 2000, { isStatic: true }),
      Bodies.rectangle(w + t / 2, h / 2 - 1000, t, h * 2 + 2000, { isStatic: true }),
    ];
    if (withCeiling) walls.push(Bodies.rectangle(w / 2, top - t / 2, w * 3, t, { isStatic: true }));
    Composite.add(world, walls);
  };

  const makeBodies = () => {
    const { width: w } = box.getBoundingClientRect();
    pills.forEach((el, i) => {
      const pw = el.offsetWidth;
      const ph = el.offsetHeight;
      const body = Bodies.rectangle(rand(pw / 2 + 10, w - pw / 2 - 10), -ph - i * 36 - rand(0, 40), pw, ph, {
        restitution: 0.45,
        friction: 0.08,
        frictionAir: 0.012,
        density: 0.002,
        angle: rand(-0.6, 0.6),
      });
      items.push({ el, body, w: pw, h: ph });
    });
    Composite.add(world, items.map((it) => it.body));
  };

  const sync = () => {
    items.forEach(({ el, body, w, h }) => {
      const { x, y } = body.position;
      el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${body.angle}rad)`;
    });
  };

  const start = () => {
    if (started) return;
    started = true;
    buildWalls(false);
    makeBodies();
    pills.forEach((p) => p.classList.add('is-live'));
    // Close the lid once everything has fallen in, so nothing gets thrown into orbit.
    gsap.delayedCall(3.2, () => buildWalls(true));
  };

  ScrollTrigger.create({
    trigger: box,
    start: 'top 85%',
    end: 'bottom top',
    onEnter: start,
    onEnterBack: start,
  });
  ScrollTrigger.create({
    trigger: box,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (s) => (visible = s.isActive),
  });

  gsap.ticker.add((_, delta) => {
    if (!started || !visible) return;
    // Fixed small steps keep the simulation stable on slow frames.
    const step = 1000 / 60;
    const steps = Math.min(3, Math.ceil(delta / step));
    for (let i = 0; i < steps; i++) Engine.update(engine, Math.min(delta / steps, step));
    sync();
  });

  // Keep the box honest when the window changes size.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!started) return;
      const { width: w, height: h } = box.getBoundingClientRect();
      if (Math.abs(w - size.w) < 2 && Math.abs(h - size.h) < 2) return;
      buildWalls(true);
      items.forEach(({ body }) => {
        Body.setPosition(body, { x: Math.min(Math.max(body.position.x, 60), w - 60), y: Math.min(body.position.y, h - 60) });
      });
    }, 150);
  });

  // Grab & throw, written against pointer events so the page still scrolls on touch
  // anywhere except on the pills themselves.
  let grab = null;
  const local = (e) => {
    const b = box.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };
  box.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('[data-tag]');
    if (!el || !started) return;
    const item = items.find((it) => it.el === el);
    if (!item) return;
    const p = local(e);
    const body = item.body;
    grab = {
      item,
      constraint: Constraint.create({
        pointA: p,
        bodyB: body,
        pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
        angleB: body.angle,
        stiffness: 0.2,
        damping: 0.1,
        length: 0,
      }),
    };
    Composite.add(world, grab.constraint);
    el.classList.add('is-grabbed');
    box.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  box.addEventListener('pointermove', (e) => {
    if (!grab) return;
    grab.constraint.pointA = local(e);
  });
  const release = () => {
    if (!grab) return;
    Composite.remove(world, grab.constraint);
    grab.item.el.classList.remove('is-grabbed');
    grab = null;
  };
  box.addEventListener('pointerup', release);
  box.addEventListener('pointercancel', release);

  // Hovering a tag shows its note in the cursor label.
  pills.forEach((el) => {
    el.dataset.cursor = el.dataset.note;
  });

  const kick = (item, strength = 1) => {
    Body.setVelocity(item.body, { x: rand(-4, 4) * strength, y: -rand(12, 18) * strength });
    Body.setAngularVelocity(item.body, rand(-0.2, 0.2));
  };

  $('[data-shake]', box).addEventListener('click', () => {
    items.forEach((it) => kick(it, 1.2));
  });

  // Legend ↔ pills: hovering a name makes its pill jump and light up.
  $$('[data-legend-item]', section).forEach((li) => {
    const name = li.dataset.legendItem;
    li.addEventListener('pointerenter', () => {
      const it = items.find((i) => i.el.dataset.name === name);
      if (!it) return;
      it.el.classList.add('is-lit');
      kick(it, 0.8);
    });
    li.addEventListener('pointerleave', () => {
      pills.forEach((p) => p.dataset.name === name && p.classList.remove('is-lit'));
    });
  });
  $$('[data-legend-group]', section).forEach((g) => {
    const id = g.dataset.legendGroup;
    g.addEventListener('pointerenter', () => pills.forEach((p) => p.classList.toggle('is-lit', p.dataset.group === id)));
    g.addEventListener('pointerleave', () => pills.forEach((p) => p.classList.remove('is-lit')));
  });
}
