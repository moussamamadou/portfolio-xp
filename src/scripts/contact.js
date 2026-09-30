import gsap from 'gsap';
import { $, $$, reduced, fitW } from './lib.js';

// The closing words open from narrow to full width as they arrive, and the
// name rises and widens at the very bottom.
export function initContact() {
  const section = $('.contact');
  const words = $$('[data-contact-word]');
  const mark = $('[data-mark]');
  const mail = $('.contact__mail');
  const fitAll = () => {
    const avail = section.clientWidth - parseFloat(getComputedStyle(section).paddingLeft) * 2;
    words.forEach((w) => fitW(w, avail, 125));
    fitW(mark, avail, 125);
    fitW(mail, avail, 72, 120);
  };
  fitAll();
  section.setAttribute('data-refit', '');
  section.refit = fitAll;

  if (reduced) return;
  gsap.fromTo(words, { '--w': 62 }, {
    '--w': 125,
    ease: 'none',
    stagger: 0.15,
    scrollTrigger: { trigger: '.contact__title', start: 'top bottom', end: 'bottom 40%', scrub: 0.5 },
  });
  gsap.fromTo(mark, { yPercent: 50, '--w': 62 }, {
    yPercent: 0,
    '--w': 125,
    ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: () => `+=${window.innerHeight * 0.6}`, scrub: 0.5 },
  });
}
