import gsap from 'gsap';
import { $, $$, reduced, clippedChars, cycleWindows } from './lib.js';

// The headline is set as one block: its widest line fills the page width and
// every line shares that size. Chars rise out of their masks, the screenshot
// windows open from their centre line, then keep cycling through projects.
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
  title.classList.add('is-fit');
  title.setAttribute('data-refit', '');
  title.refit = fitTitle;

  const cs = $$('[data-hero-split]', title).flatMap((el) => clippedChars(el));
  const meta = $$('[data-hero-meta]');

  const cycle = () => cycleWindows(wins);

  const intro = () => {
    if (reduced) {
      gsap.set(meta, { opacity: 1 });
      cycle();
      return Promise.resolve();
    }
    // Windows open from their centre line. Clip, not width, so no text moves under the reader.
    const tl = gsap.timeline();
    tl.from(cs, { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.022 }, 0.15)
      .fromTo(wins, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', stagger: 0.15 }, 0.5)
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
