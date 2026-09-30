import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reduced } from '../utils.js';

/*
 * Recognition: a stack of (very) fake award certificates. The title's tracking
 * collapses as it arrives, then the scroll deals the certificates off the pile
 * one by one; each new top card gets its jury scores and its "not real" stamp.
 * A side ribbon, in the tradition of award sites, slides in while you're here.
 */
export function initRecognition() {
  const section = $('#recognition');
  const pin = $('[data-awards-pin]', section);
  const cards = $$('[data-award]', section);
  const dots = $$('[data-award-dot]', section);
  let current = -1;

  const activate = (i) => {
    if (i === current) return;
    current = i;
    dots.forEach((d, j) => d.classList.toggle('is-on', j === i));
    cards.forEach((card, j) => {
      const on = j === i;
      card.classList.toggle('is-on', on);
      const fills = $$('[data-score]', card);
      const values = $$('[data-score-value]', card);
      if (on) {
        fills.forEach((f) => gsap.to(f, { scaleX: +f.dataset.score / 10, duration: 1.2, ease: 'expo.out', delay: 0.15 }));
        values.forEach((v) => {
          const target = +v.dataset.scoreValue;
          const o = { n: 0 };
          gsap.to(o, { n: target, duration: 1.2, ease: 'expo.out', delay: 0.15, onUpdate: () => (v.textContent = o.n.toFixed(1)) });
        });
        if (!reduced) {
          gsap.fromTo($('.award__stamp', card), { scale: 2.6, rotation: -10 }, { scale: 1, rotation: 10, duration: 0.5, ease: 'power4.in', delay: 0.6 });
        }
      }
    });
  };

  // Title: tracking collapses from very wide to tight.
  if (!reduced) {
    gsap.from($$('[data-fake-line]', section), {
      letterSpacing: '0.45em',
      opacity: 0,
      ease: 'none',
      stagger: 0.15,
      scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 15%', scrub: true },
    });
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    toggleClass: { targets: document.body, className: 'show-ribbon' },
  });

  const mm = gsap.matchMedia();
  mm.add({ wide: '(min-width: 1000px)', narrow: '(max-width: 999px)' }, (ctx) => {
    if (ctx.conditions.wide && !reduced) {
      section.classList.add('recognition--pinned');
      cards.forEach((c, i) => gsap.set(c, { y: i * 18, rotation: i % 2 ? 2.5 : -2, scale: 1 - i * 0.04 }));
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${window.innerHeight * cards.length * 0.9}`,
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => activate(Math.min(cards.length - 1, Math.floor(self.progress * tl.duration() + 0.4))),
          onEnter: () => activate(0),
        },
      });
      cards.slice(0, -1).forEach((card, i) => {
        tl.to(card, { yPercent: -150, xPercent: i % 2 ? 60 : -60, rotation: i % 2 ? 28 : -32, duration: 1, ease: 'power2.in' }, i)
          .to(card, { opacity: 0, duration: 0.25, ease: 'none' }, i + 0.75);
        cards.slice(i + 1).forEach((rest, k) => {
          tl.to(rest, { y: k * 18, rotation: k === 0 ? 0 : k % 2 ? 2.5 : -2, scale: 1 - k * 0.04, duration: 0.8, ease: 'power2.out' }, i + 0.2);
        });
      });
      tl.to({}, { duration: 0.6 });
      return () => {
        section.classList.remove('recognition--pinned');
        gsap.set(cards, { clearProps: 'all' });
      };
    }

    cards.forEach((card, i) => {
      ScrollTrigger.create({ trigger: card, start: 'top 70%', onEnter: () => activate(i), onEnterBack: () => activate(i) });
    });
    return undefined;
  });
}
