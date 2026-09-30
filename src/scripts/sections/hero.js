import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, fitText, reduced } from '../utils.js';
import { initNameShader } from './hero-shader.js';

/*
 * Hero: the name is set edge to edge, one fitted line per word. Its letters
 * rise in, then the name is handed to a WebGL shader: moving the cursor breaks
 * the letters into pixels along its trail. Scrolling away dissolves the name into bigger and bigger pixels.
 */

export function initHero() {
  const hero = $('.hero');
  const stage = $('[data-hero-stage]', hero);
  const words = $$('[data-fit]', stage);
  const main = $$('[data-hero-word]', stage);
  const mainChars = main.flatMap((w) => splitChars(w));
  words.forEach((w) => (w.dataset.fitMax = '0.5'));
  fitText(words);

  const meta = $$('[data-hero-meta]', hero);
  const tag = $('[data-hero-tag]', hero);
  const shader = reduced ? null : initNameShader(stage, hero);
  initCoords($('[data-coords]', hero));

  if (!reduced) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 },
      defaults: { ease: 'none' },
    });
    tl.to(tag, { y: () => -window.innerHeight * 0.18 }, 0)
      .to(meta, { y: () => -window.innerHeight * 0.1 }, 0);

    gsap.set(mainChars, { yPercent: 105 });
    gsap.set(meta, { yPercent: 110 });
    gsap.set(tag, { clipPath: 'inset(0% 0% 100% 0%)', y: 20 });
  }

  return {
    intro() {
      if (reduced) return;
      gsap
        .timeline()
        .to(mainChars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.035, onComplete: () => shader?.start() }, 0)
        .to(meta, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, 0.3)
        .to(tag, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out' }, 0.45);
    },
  };
}

// "Based somewhere on Earth": the coordinates keep changing their mind.
function initCoords(el) {
  if (reduced) return;
  const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(4).padStart(7, '0')}° ${v >= 0 ? pos : neg}`;
  const next = () => {
    const text = `${fmt(Math.random() * 160 - 80, 'N', 'S')}, ${fmt(Math.random() * 340 - 170, 'E', 'W')}`;
    gsap.to(el, { duration: 1, scrambleText: { text, chars: '0123456789', speed: 0.6 } });
  };
  next();
  setInterval(next, 3200);
}
