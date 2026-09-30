import gsap from 'gsap';
import { $, $$, reduced, clippedChars, fitW } from './lib.js';
import { projects } from '../data/content.js';

// The name is set full width at the widest cut of the font. Scrolling grows
// the project reel over it while the name narrows out of the way, and the
// reel steps through every project on the way.
export function initHero() {
  const pin = $('.hero__pin');
  const words = $$('[data-hero-word]');
  const reel = $('[data-reel]');
  const imgs = $$('[data-reel-img]');
  const num = $('[data-reel-num]');
  const title = $('[data-reel-title]');
  const meta = $$('[data-hero-meta]');

  // Phones start a cut narrower, so the name stays large.
  const startW = () => (window.innerWidth < 900 ? 100 : 125);
  const fitAll = () => {
    const avail = pin.clientWidth - parseFloat(getComputedStyle(pin).paddingLeft) * 2;
    words.forEach((w) => fitW(w, avail, startW()));
  };
  words.forEach((w) => w.style.setProperty('--w', startW()));
  fitAll();
  pin.classList.add('is-fit');
  pin.setAttribute('data-refit', '');
  pin.refit = fitAll;

  const names = words.map((w) => w.textContent);
  const cs = words.flatMap((w) => clippedChars(w));
  // Once the chars have risen, put the plain words back: the width animation
  // then moves one box per line instead of every letter.
  const unsplit = () => words.forEach((w, i) => (w.textContent = names[i]));
  const total = String(projects.length).padStart(2, '0');
  let shown = 0;
  const show = (i) => {
    if (i === shown) return;
    shown = i;
    num.textContent = `${String(i + 1).padStart(2, '0')}/${total}`;
    title.textContent = projects[i].title;
  };

  if (reduced) {
    unsplit();
    return { intro: () => Promise.resolve() };
  }

  // Scroll: one timeline, scrubbed across the hero's scroll length.
  const mm = gsap.matchMedia();
  mm.add({ small: '(max-width: 899px)', large: '(min-width: 900px)' }, (ctx) => {
    gsap.set(imgs.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => show(Math.min(imgs.length - 1, Math.floor(self.progress * imgs.length * 0.999))),
      },
    });
    tl.fromTo(reel, { scale: ctx.conditions.small ? 0.8 : 0.3 }, { scale: 1, duration: 0.7, ease: 'power1.inOut' }, 0)
      .fromTo(words, { '--w': startW() }, { '--w': 62, duration: 0.7, ease: 'power1.inOut' }, 0)
      .to(meta, { opacity: 0, duration: 0.2 }, 0.5);
    imgs.slice(1).forEach((img, i) => {
      const at = (i + 1) / imgs.length;
      tl.to(img, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 / imgs.length }, at - 0.6 / imgs.length);
    });
    tl.set({}, {}, 1);
  });

  const intro = () => {
    const tl = gsap.timeline();
    tl.from(cs, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.03, onComplete: unsplit }, 0.1)
      .from(reel.firstElementChild, { clipPath: 'inset(50% 50% 50% 50%)', duration: 1.2, ease: 'expo.inOut' }, 0.3)
      .from(meta, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.7);
    return new Promise((r) => gsap.delayedCall(0.9, r));
  };

  return { intro };
}
