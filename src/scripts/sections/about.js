import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { $, $$, fitText, reduced } from '../utils.js';

/*
 * About, kept calm: one motion language for the whole section. Big lines rise
 * out of their masks as they come into view, the intro fills from grey to ink
 * with the scroll, and the story rows draw their rule before their text rises.
 */
export function initAbout() {
  const section = $('#about');

  const lines = $$('[data-reveal-line]', section);
  const formula = $$('[data-formula-line]', section);
  fitText([...lines, ...formula]);

  if (reduced) return;

  // Every big line: up from its mask, once.
  const rise = (els, trigger, stagger = 0.08) => {
    gsap.set(els, { yPercent: 105 });
    ScrollTrigger.create({
      trigger,
      start: 'top 82%',
      once: true,
      onEnter: () => gsap.to(els, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger }),
    });
  };
  rise(lines.slice(0, 2), $('.about__title', section));
  rise(lines.slice(2), $('.about__yes', section));
  rise(formula, $('[data-formula]', section), 0.1);

  // Intro: words fill from grey to ink as you read down.
  const lead = $('[data-fill]', section);
  const words = new SplitType(lead, { types: 'words' }).words;
  gsap.fromTo(
    words,
    { color: '#c9c9c5' },
    {
      color: '#0b0b0b',
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: lead, start: 'top 80%', end: 'bottom 50%', scrub: true },
    },
  );

  // Story rows: the rule draws, then the row's text rises.
  $$('[data-story-row]', section).forEach((row) => {
    const rule = $('.story__rule', row);
    const texts = $$('[data-rise]', row);
    gsap.set(rule, { scaleX: 0 });
    gsap.set(texts, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: row,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(rule, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' });
        gsap.to(texts, { yPercent: 0, duration: 1, ease: 'expo.out', delay: 0.25 });
      },
    });
  });
}
