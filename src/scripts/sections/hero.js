import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, lerp, clamp, canHover, reduced, rand } from '../utils.js';

/*
 * Hero: the name is made of variable-weight letters that swell (and turn blue)
 * as the cursor gets close. Without a cursor, a slow wave runs through them.
 * Scrolling away pulls the two lines apart while About slides over the top.
 */
export function initHero() {
  const hero = $('.hero');
  const lines = $$('[data-hero-line]', hero);
  const chars = lines.flatMap((l) => splitChars(l));
  const dot = $('.hero__dot', hero);
  const meta = $$('[data-hero-meta]', hero);
  const tagline = $$('.hero__tagline-line, .hero__probably', hero);
  const scroll = $('.hero__scroll', hero);

  const MIN = 360;
  const MAX = 900;
  const state = chars.map(() => ({ w: 500, t: 0 }));
  const pointer = { x: -9999, y: -9999, last: 0 };
  let visible = true;
  let live = false;

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.last = performance.now();
  });

  ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (visible = self.isActive),
  });

  const radius = () => Math.max(220, window.innerWidth * 0.22);

  function update(time) {
    if (!visible || !live || reduced) return;
    const idle = !canHover || performance.now() - pointer.last > 2600;
    const r = radius();
    // Read everything first, then write, to keep layout work to one pass.
    const rects = idle ? null : chars.map((c) => c.getBoundingClientRect());
    chars.forEach((c, i) => {
      let t;
      if (idle) {
        t = Math.pow(0.5 + 0.5 * Math.sin(time * 1.6 - i * 0.55), 3);
      } else {
        const b = rects[i];
        const d = Math.hypot(b.left + b.width / 2 - pointer.x, b.top + b.height / 2 - pointer.y);
        t = Math.pow(clamp(1 - d / r), 2);
      }
      const s = state[i];
      s.w = lerp(s.w, MIN + (MAX - MIN) * t, 0.12);
      s.t = lerp(s.t, t, 0.12);
      c.style.fontWeight = s.w.toFixed(0);
      c.style.color = s.t > 0.02 ? `color-mix(in srgb, var(--blue) ${Math.round(s.t * 100)}%, var(--ink))` : '';
    });
  }
  gsap.ticker.add(update);

  // Blue dot drifts toward the cursor a little, like it's curious.
  if (canHover && !reduced) {
    const dx = gsap.quickTo(dot, 'x', { duration: 0.8, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.8, ease: 'power3' });
    hero.addEventListener('pointermove', (e) => {
      const b = dot.getBoundingClientRect();
      const cx = b.left + b.width / 2 - gsap.getProperty(dot, 'x');
      const cy = b.top + b.height / 2 - gsap.getProperty(dot, 'y');
      dx(clamp((e.clientX - cx) * 0.06, -40, 40));
      dy(clamp((e.clientY - cy) * 0.06, -40, 40));
    });
    hero.addEventListener('pointerleave', () => {
      dx(0);
      dy(0);
    });
  }

  // "Based somewhere on Earth": the coordinates never settle on one place.
  const coords = $('[data-coords]', hero);
  const randomCoords = () => {
    const lat = rand(0, 80).toFixed(4);
    const lon = rand(0, 179).toFixed(4);
    return `(${lat}° ${Math.random() > 0.5 ? 'N' : 'S'}, ${lon}° ${Math.random() > 0.5 ? 'E' : 'W'})`;
  };
  coords.textContent = randomCoords();
  if (!reduced) {
    setInterval(() => {
      if (!visible) return;
      gsap.to(coords, { duration: 1.2, scrambleText: { text: randomCoords(), chars: '0123456789', speed: 0.6 } });
    }, 3800);
  }

  // Scroll spins the "scroll down" badge.
  if (!reduced) {
    gsap.to($('svg', scroll), {
      rotation: 360,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });
    gsap.to($('svg', scroll), { rotation: '+=360', duration: 20, repeat: -1, ease: 'none' });
  }

  // Leaving the hero: About slides over it like a sheet, while the letters drift apart.
  if (!reduced) {
    const out = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, pin: true, pinSpacing: false },
      defaults: { ease: 'none' },
    });
    out
      .to(lines[0], { xPercent: -18 }, 0)
      .to(lines[1], { xPercent: 14 }, 0)
      .to(chars, { y: () => rand(-0.5, 0.3) * window.innerHeight * 0.35, rotation: () => rand(-14, 14), stagger: { each: 0.01, from: 'center' } }, 0)
      .to([$('.hero__meta', hero), $('.hero__bottom', hero)], { opacity: 0, y: -40, stagger: 0.02 }, 0)
      .to($('.hero__inner', hero), { scale: 0.94, transformOrigin: '50% 0%' }, 0);
  }

  // Entrance, played once the loader gets out of the way.
  gsap.set(chars, { yPercent: 115 });
  gsap.set(lines, { overflow: 'hidden' });
  gsap.set([...meta, ...tagline, scroll], { opacity: 0, y: 24 });
  gsap.set(dot, { scale: 0 });

  return {
    intro() {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(lines, { overflow: 'visible' });
          live = true;
        },
      });
      tl.to(chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.045 }, 0.1)
        .to(dot, { scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)' }, 0.8)
        .to([...meta, ...tagline, scroll], { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.5);
      return tl;
    },
  };
}
