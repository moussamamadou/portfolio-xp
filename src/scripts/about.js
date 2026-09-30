import gsap from 'gsap';
import SplitType from 'split-type';
import { $, $$, reduced } from './lib.js';

// The statement lights up word by word, then the route fills stop by stop.
export function initAbout() {
  if (reduced) return;
  const text = $('[data-words]');
  const route = $('[data-route]');
  const stops = $$('[data-stop]', route);
  const formula = $('[data-formula]');
  const words = new SplitType(text, { types: 'words', tagName: 'span' }).words;

  route.setAttribute('data-live', '');
  gsap.set(route, { '--p': 0 });
  gsap.set(words, { opacity: 0.12 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.about', start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    onUpdate: () => {
      const p = +gsap.getProperty(route, '--p');
      stops.forEach((s, i) => s.classList.toggle('is-on', p >= i / (stops.length - 1) - 0.001 && p > 0));
    },
  });
  tl.to(words, { opacity: 1, duration: 0.08, stagger: 0.42 / words.length }, 0)
    .to(route, { '--p': 1, duration: 0.36 }, 0.52)
    .fromTo(formula, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.1 }, 0.88);

  // The statement drifts up into place as the section arrives.
  gsap.from(text, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: true } });
}
