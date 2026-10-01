import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reduced, lines } from './lib.js';

// One quiet vocabulary, like turning slides: big lines rise out of a mask,
// rules draw from the left, captions fade in last. Textures drift slower
// than the page.
export function initSections() {
  // Rules draw as their row arrives.
  $$('[data-rule]').forEach((el) =>
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => el.classList.add('is-in') }),
  );

  // Project rows open and close in place.
  $$('[data-row]').forEach((row) => {
    const head = $('[data-row-head]', row);
    const panel = $('[data-row-panel]', row);
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      if (open) {
        gsap.fromTo(panel, { height: panel.offsetHeight }, { height: 0, duration: reduced ? 0 : 0.7, ease: 'expo.inOut', onComplete: () => { panel.removeAttribute('data-open'); ScrollTrigger.refresh(); } });
      } else {
        panel.setAttribute('data-open', '');
        gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: reduced ? 0 : 0.8, ease: 'expo.inOut', onComplete: () => ScrollTrigger.refresh() });
        if (!reduced) gsap.fromTo($('img', panel), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut', delay: 0.1 });
      }
    });
  });

  if (reduced) return;

  // Multi-line headings rise line by line.
  $$('[data-lines]').forEach((el) => {
    const ls = lines(el);
    gsap.from(ls, {
      yPercent: 105,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: el.closest('.cover') ? undefined : { trigger: el, start: 'top 88%', once: true },
      delay: el.closest('.cover') ? 0.2 : 0,
    });
  });

  // Single row labels rise with their row.
  $$('[data-rise]').forEach((el) => {
    gsap.from(el, { yPercent: 105, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el.parentElement, start: 'top 92%', once: true } });
  });

  $$('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      delay: el.closest('.cover') ? 0.9 : 0.3,
      scrollTrigger: el.closest('.cover') ? undefined : { trigger: el, start: 'top 90%', once: true },
    });
  });

  // Textures drift.
  $$('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
