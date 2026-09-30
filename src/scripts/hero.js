import gsap from 'gsap';
import { $, $$, reduced, clippedChars } from './lib.js';

// The headline is set as one block: its widest line fills the page width and
// every line shares that size. Chars rise out of their masks, the screenshot
// windows open like words being typed in, then keep cycling through projects.
export function initHero() {
  const title = $('.hero__title');
  const lines = $$('.hero__line', title);
  const wins = $$('[data-hero-win]', title);

  // Phones wrap the lines at a fixed size instead (see CSS).
  const fitTitle = () => {
    if (window.innerWidth < 900) {
      title.style.fontSize = '';
      return;
    }
    title.style.fontSize = '100px';
    lines.forEach((l) => (l.style.width = 'max-content'));
    const widest = Math.max(...lines.map((l) => l.getBoundingClientRect().width));
    lines.forEach((l) => (l.style.width = ''));
    title.style.fontSize = `${Math.floor(((100 * title.clientWidth) / widest) * 10) / 10}px`;
  };
  fitTitle();
  title.setAttribute('data-refit', '');
  title.refit = fitTitle;

  const cs = $$('[data-hero-split]', title).flatMap((el) => clippedChars(el));
  const meta = $$('[data-hero-meta]');

  // Cycle the windows: each new screenshot wipes up over the last one.
  const cycle = () => {
    wins.forEach((win) => {
      const imgs = $$('img', win);
      let i = 0;
      let z = 1;
      gsap.delayedCall(2, function step() {
        i = (i + 1) % imgs.length;
        const img = imgs[i];
        img.style.zIndex = ++z;
        gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9, ease: 'expo.inOut' });
        gsap.delayedCall(1.8, step);
      });
    });
  };

  const intro = () => {
    if (reduced) {
      gsap.set(meta, { opacity: 1 });
      cycle();
      return Promise.resolve();
    }
    const winW = wins.map((w) => w.getBoundingClientRect().width);
    const tl = gsap.timeline({ onComplete: () => gsap.set(wins, { clearProps: 'width' }) });
    tl.from(cs, { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.022 }, 0.15)
      .fromTo(wins, { width: 0 }, { width: (i) => winW[i], duration: 1.3, ease: 'expo.inOut', stagger: 0.15 }, 0.5)
      .fromTo(
        meta,
        { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out', stagger: 0.08 },
        0.9,
      );
    tl.add(cycle, 1.4);

    // On the way out, the lines slide apart sideways, alternating.
    gsap.to(lines, {
      xPercent: (i) => (i % 2 ? 6 : -6),
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    return new Promise((r) => gsap.delayedCall(0.9, r));
  };

  return { intro };
}
