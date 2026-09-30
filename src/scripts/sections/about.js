import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { $, $$, fitText, splitChars, revealChars, reduced } from '../utils.js';

/*
 * About, kept calm: one motion language for the whole section. Big lines are
 * split into letters that rise out of their masks, the intro fills word by word
 * from grey to ink with the scroll, and the story rows draw their rule before
 * their letters rise.
 */
export function initAbout() {
  const section = $('#about');

  const lines = $$('[data-reveal-line]', section);
  const formula = $$('[data-formula-line]', section);

  // Big lines: letters rise out of each line's mask, once.
  revealChars(lines.slice(0, 2), { trigger: $('.about__title', section) });
  revealChars(lines.slice(2), { trigger: $('.about__yes', section), stagger: 0.018 });
  formula.forEach((line) => revealChars(line, { start: 'top 90%', stagger: 0.02 }));
  revealChars($('.story__title', section), { masked: true, stagger: 0.015 });
  fitText([...lines, ...formula]);

  if (reduced) return;

  // Intro: words fill from grey to ink as you read down.
  const lead = $('[data-fill]', section);
  const words = new SplitType(lead, { types: 'words' }).words;
  gsap.fromTo(
    words,
    { color: '#aeaea9' },
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
    const name = $('.story__name [data-rise]', row);
    const small = texts.filter((t) => t !== name);
    name.classList.add('is-masked');
    const chars = splitChars(name).filter((c) => !c.classList.contains('space'));
    gsap.set(rule, { scaleX: 0 });
    gsap.set([...small, ...chars], { yPercent: 110 });
    ScrollTrigger.create({
      trigger: row,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(rule, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' });
        gsap.to(small, { yPercent: 0, duration: 1, ease: 'expo.out', delay: 0.25 });
        gsap.to(chars, { yPercent: 0, duration: 1, ease: 'expo.out', delay: 0.25, stagger: 0.012 });
      },
    });
  });
}
