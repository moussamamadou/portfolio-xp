import gsap from 'gsap';
import { $, $$, reduced, fit, lines, clippedChars } from './lib.js';

// Each section gets its own entrance, all driven by scroll:
//   About    statement lines slide up out of masks as you read down
//   Work     giant title chars rise centre-out; tiles dissolve in via WebGL
//   Labs     rules draw across, then titles rise
//   Toolkit  tool names drop in from above, one column after the other
//   Contact  headline builds char by char; the wordmark rises with the last scroll

const fitted = (el) => {
  el.style.display = 'inline-block';
  fit(el);
  el.setAttribute('data-refit', '');
  el.refit = () => fit(el);
};

export function initSections() {
  // Fitted headlines first, so the splits measure final sizes.
  $$('[data-work-split], [data-contact-split], [data-mark]').forEach(fitted);

  if (reduced) {
    gsap.set('[data-rise]', { opacity: 1 });
    return;
  }

  // Scrubbed line reveals (About statement, Labs title).
  $$('[data-lines]').forEach((el) => {
    lines(el).forEach((line) => {
      gsap.from(line, {
        yPercent: 105,
        ease: 'none',
        scrollTrigger: { trigger: line.parentElement, start: 'top 92%', end: 'top 62%', scrub: 0.6 },
      });
    });
  });

  // Small blocks unfold from the top edge.
  $$('[data-rise]').forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        ease: 'expo.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });

  // Work title: chars rise from the centre outward, tied to scroll.
  $$('[data-work-split]').forEach((el) => {
    const cs = clippedChars(el);
    gsap.from(cs, {
      yPercent: 110,
      ease: 'none',
      stagger: { each: 0.06, from: 'center' },
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.8 },
    });
  });

  // Work captions: title chars rise once the tile shows up.
  $$('[data-tile]').forEach((tile) => {
    const title = $('.roll__in', tile);
    const meta = $$('.tile__num, .tile__kind, .tile__stack, .tile__go', tile);
    const tl = gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 80%', once: true } });
    tl.from(title, { yPercent: 110, duration: 1, ease: 'expo.out' }, 0.5).fromTo(
      meta,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.out', stagger: 0.06 },
      0.6,
    );
    // Without WebGL the image opens like a shutter instead.
    if (!document.documentElement.classList.contains('gl-on')) {
      tl.fromTo($('img', tile), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0);
    }
  });

  // Labs: rule draws, then the row's text rises.
  $$('[data-lab]').forEach((lab) => {
    const rule = $('.lab__rule', lab);
    const title = $('.lab__link > .lab__title', lab);
    const rest = $$('.lab__link > .mono', lab);
    const tl = gsap.timeline({ scrollTrigger: { trigger: lab, start: 'top 88%', once: true } });
    tl.from(rule, { scaleX: 0, duration: 1.2, ease: 'expo.inOut' })
      .fromTo(title, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 30 }, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1, ease: 'expo.out' }, 0.5)
      .fromTo(rest, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.08 }, 0.8);
  });

  // Toolkit: names drop in from above inside their masks, column by column.
  $$('[data-group]').forEach((group, gi) => {
    const names = $$('[data-tool-name]', group);
    gsap.from(names, {
      yPercent: -105,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.07,
      delay: gi * 0.15,
      scrollTrigger: { trigger: group, start: 'top 80%', once: true },
    });
  });

  // Contact headline: chars build left to right as it scrolls in.
  $$('[data-contact-split]').forEach((el) => {
    const cs = clippedChars(el);
    gsap.from(cs, {
      yPercent: 110,
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: 0.8 },
    });
  });

  // Wordmark: rises from the bottom edge over the last stretch of the page.
  const mark = $('[data-mark]');
  if (mark) {
    const cs = clippedChars(mark);
    gsap.from(cs, {
      yPercent: 100,
      ease: 'none',
      stagger: 0.04,
      scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    });
  }
}
