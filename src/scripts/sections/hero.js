import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, fitText, lerp, canHover, reduced } from '../utils.js';

/*
 * Hero: the name is set edge to edge, one fitted line per word. A square black
 * lens follows the cursor and magnifies what's under it, in negative
 * (a take on Codrops' mouse-following lens). Without a mouse the lens drifts
 * on its own. Scrolling away slides the two lines up into their masks.
 */

export function initHero() {
  const hero = $('.hero');
  const stage = $('[data-hero-stage]', hero);
  const words = $$('[data-fit]', stage);
  const main = $$('[data-hero-word]', stage);
  const mainChars = main.flatMap((w) => splitChars(w));
  const lensWords = words.filter((w) => !main.includes(w));
  const lensChars = lensWords.flatMap((w) => splitChars(w));
  words.forEach((w) => (w.dataset.fitMax = '0.5'));
  fitText(words);

  const meta = $$('[data-hero-meta]', hero);
  const tag = $('[data-hero-tag]', hero);

  initLens(stage);
  initCoords($('[data-coords]', hero));

  if (!reduced) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 },
      defaults: { ease: 'none' },
    });
    // Each line of the name slides up into its mask, the second a touch slower.
    const lineOf = (chars) => (i, c) => (c.closest('.hero__line') === c.closest('.hero__name').firstElementChild ? -100 : -70);
    tl.to(mainChars, { yPercent: lineOf(mainChars) }, 0)
      .to(lensChars, { yPercent: lineOf(lensChars) }, 0)
      .to(tag, { y: () => -window.innerHeight * 0.18 }, 0)
      .to(meta, { y: () => -window.innerHeight * 0.1 }, 0);

    gsap.set([...mainChars, ...lensChars], { yPercent: 105 });
    gsap.set(meta, { yPercent: 110 });
    gsap.set(tag, { clipPath: 'inset(0% 0% 100% 0%)', y: 20 });
  }

  return {
    intro() {
      if (reduced) return;
      gsap
        .timeline()
        .to([mainChars, lensChars], { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: (i) => (i % mainChars.length) * 0.035 }, 0)
        .to(meta, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, 0.3)
        .to(tag, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out' }, 0.45);
    },
  };
}

function initLens(stage) {
  const lens = $('[data-lens]', stage);
  const inner = $('[data-lens-inner]', stage);
  const label = $('[data-lens-label]', stage);
  if (reduced) return lens.remove();
  const greetings = ['Hi.', "Yes, it's me.", '(Probably)', 'Hello, human.', 'Hire me?'];
  let g = 0;

  const pos = { x: 0, y: 0, s: 0 };
  const target = { x: 0, y: 0, s: 0 };
  let inside = false;
  let visible = true;
  let bounds = stage.getBoundingClientRect();
  const measure = () => (bounds = stage.getBoundingClientRect());
  ScrollTrigger.addEventListener('refresh', measure);
  ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });

  const size = () => Math.min(bounds.height * 0.62, window.innerWidth * (canHover ? 0.22 : 0.4));

  if (canHover) {
    stage.addEventListener('pointerenter', () => {
      inside = true;
      label.textContent = greetings[g++ % greetings.length];
    });
    stage.addEventListener('pointerleave', () => (inside = false));
    stage.addEventListener('pointermove', (e) => {
      measure();
      target.x = e.clientX - bounds.left;
      target.y = e.clientY - bounds.top;
      if (pos.s < 1) Object.assign(pos, { x: target.x, y: target.y });
    });
  } else {
    label.textContent = greetings[0];
  }

  gsap.ticker.add((time) => {
    if (!visible) return;
    if (!canHover) {
      // No mouse: the lens wanders slowly across the name.
      measure();
      target.x = bounds.width * (0.5 + 0.38 * Math.sin(time * 0.45));
      target.y = bounds.height * (0.5 + 0.22 * Math.sin(time * 0.7 + 1));
      target.s = size();
    } else {
      target.s = inside ? size() : 0;
    }
    const vx = target.x - pos.x;
    pos.x = lerp(pos.x, target.x, 0.14);
    pos.y = lerp(pos.y, target.y, 0.14);
    pos.s = lerp(pos.s, target.s, 0.12);

    // The square stretches a little in the direction you move.
    const stretch = Math.min(Math.abs(vx) * 0.25, 60);
    const w = pos.s + stretch;
    const h = Math.max(pos.s - stretch * 0.4, 0);
    const l = pos.x - w / 2;
    const t = pos.y - h / 2;
    lens.style.clipPath = `inset(${t}px ${bounds.width - l - w}px ${bounds.height - t - h}px ${l}px)`;
    inner.style.transformOrigin = `${pos.x}px ${pos.y}px`;
    inner.style.transform = 'scale(1.14)';
    label.style.transform = `translate(${l}px, ${t}px)`;
  });
}

// "Based somewhere on Earth": the coordinates keep changing their mind.
function initCoords(el) {
  if (reduced) return;
  const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(4).padStart(7, '0')}° ${v >= 0 ? pos : neg}`;
  const next = () => {
    const text = `${fmt(Math.random() * 160 - 80, 'N', 'S')}, ${fmt(Math.random() * 340 - 170, 'E', 'W')}`;
    gsap.to(el, { duration: 1, scrambleText: { text, chars: '0123456789', speed: 0.6 } });
  };
  next();
  setInterval(next, 3200);
}
