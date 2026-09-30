import gsap from 'gsap';
import { $, $$, reduced, clippedChars, cssPx, fitW } from './lib.js';

// Project cards stack: each sticks one row lower than the last. Triggers use
// the flow anchors in front of each card, since sticky boxes move.
export function initWork(lenis) {
  const cards = $$('[data-proj]');
  const anchors = $$('[data-anchor]');
  const tail = $('.stack__tail');
  const top = (i) => cssPx('--hh') + i * cssPx('--row');

  // "Selected" and "Work" each fill the width at the widest cut.
  const title = $('.work__title');
  const fitTitle = () => $$('[data-work-a], [data-work-b]').forEach((w) => fitW(w, title.clientWidth, 125));
  fitTitle();
  title.setAttribute('data-refit', '');
  title.refit = fitTitle;

  // Rows jump to their card.
  $$('[data-proj-row]').forEach((row) => {
    const i = +row.dataset.projRow;
    row.addEventListener('click', () => {
      const y = anchors[i].getBoundingClientRect().top + window.scrollY - top(i);
      if (lenis) lenis.scrollTo(y, { duration: 1.2 });
      else window.scrollTo(0, y);
    });
  });

  // Which card is open: its row turns black.
  cards.forEach((card, i) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: anchors[i],
        start: () => `top ${top(i) + 2}px`,
        endTrigger: anchors[i + 1] ?? tail,
        end: () => (anchors[i + 1] ? `top ${top(i + 1) + 2}px` : 'top bottom'),
        onToggle: (self) => card.classList.toggle('is-current', self.isActive),
      },
    });
  });

  if (reduced) return;

  // Title: the two words widen from opposite edges until they meet the margins.
  gsap.fromTo(['[data-work-a]', '[data-work-b]'], { '--w': 62 }, {
    '--w': 125,
    ease: 'none',
    scrollTrigger: { trigger: '.work__head', start: 'top bottom', end: 'bottom 45%', scrub: 0.5 },
  });

  cards.forEach((card, i) => {
    const media = $('[data-proj-media]', card);
    const img = $('img', media);
    const title = clippedChars($('[data-proj-title]', card));
    const rest = $$('.proj__desc, .proj__meta, .proj__link', card);
    const body = $('.proj__body', card);

    // In: the shot opens from the bottom, the title rises, details follow.
    const inTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: anchors[i], start: 'top 92%', end: () => `top ${top(i)}px`, scrub: 0.5 },
    });
    inTl.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 }, 0)
      .fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1 }, 0)
      .fromTo(title, { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.25 / title.length }, 0.25)
      .fromTo(rest, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 }, 0.6);

    // Out: as the next card slides over, this one sinks back.
    if (anchors[i + 1]) {
      gsap.fromTo(
        body,
        { scale: 1, opacity: 1 },
        {
          scale: 0.94,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: anchors[i + 1], start: 'top bottom', end: () => `top ${top(i + 1)}px`, scrub: 0.5 },
        },
      );
    }
  });
}
