import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reduced } from '../utils.js';

/*
 * Recognition: a pile of (very) fake certificates. The section pins, and the
 * scroll tears each certificate off the top of the pile like a page from a pad:
 * it wipes upward and lifts away. Whichever one is on top gets its jury scores
 * counted in and its "not a real award" stamp slapped on.
 */
export function initRecognition() {
  const section = $('#recognition');
  const pin = $('[data-awards-pin]', section);
  const cards = $$('[data-award]', section);
  const dots = $$('[data-award-dot]', section);
  const lines = $$('[data-fake-line]', section);
  let current = -1;

  const activate = (i) => {
    if (i === current) return;
    current = i;
    dots.forEach((d, j) => d.classList.toggle('is-on', j === i));
    const card = cards[i];
    $$('[data-score]', card).forEach((f) => gsap.fromTo(f, { scaleX: 0 }, { scaleX: +f.dataset.score / 10, duration: 1.2, ease: 'expo.out', delay: 0.1 }));
    $$('[data-score-value]', card).forEach((v) => {
      const o = { n: 0 };
      gsap.to(o, { n: +v.dataset.scoreValue, duration: 1.2, ease: 'expo.out', delay: 0.1, onUpdate: () => (v.textContent = o.n.toFixed(1)) });
    });
    if (!reduced) {
      gsap.fromTo($('.cert__stamp', card), { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power4.in', delay: 0.45 });
    }
  };

  if (!reduced) {
    gsap.set(lines, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      once: true,
      onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }),
    });
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    if (reduced) {
      activate(0);
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${window.innerHeight * cards.length * 0.8}`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => activate(Math.min(cards.length - 1, Math.floor(self.progress * cards.length * 0.999 + 0.15))),
        onEnter: () => activate(0),
      },
    });
    cards.slice(0, -1).forEach((card, i) => {
      tl.to(card, { clipPath: 'inset(0% 0% 100% 0%)', y: -40, rotation: i % 2 ? 3 : -3, duration: 1 }, i + 0.4);
    });
    tl.to({}, { duration: 0.6 });
    return () => gsap.set(cards, { clearProps: 'all' });
  });

  mm.add('(max-width: 900px)', () => {
    if (!reduced) gsap.set(cards, { clipPath: 'inset(0% 0% 100% 0%)' });
    cards.forEach((card) => {
      ScrollTrigger.create({ trigger: card, start: 'top 70%', once: true, onEnter: () => activateSingle(card) });
    });
    const activateSingle = (card) => {
      $$('[data-score]', card).forEach((f) => gsap.to(f, { scaleX: +f.dataset.score / 10, duration: 1.2, ease: 'expo.out' }));
      if (!reduced) {
        gsap.fromTo(card, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.out' });
        gsap.fromTo($('.cert__stamp', card), { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power4.in', delay: 0.5 });
      }
    };
  });
}
