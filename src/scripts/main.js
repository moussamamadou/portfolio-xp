import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

import { $, $$, reduced, initRolls } from './lib.js';
import { initHero } from './hero.js';
import { initSections } from './sections.js';
import { initChrome } from './chrome.js';
import { initGL } from './gl.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

async function boot() {
  window.scrollTo(0, 0);

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // Everything below measures text, so the fonts have to be in first.
  await document.fonts.ready;

  initRolls();
  const hero = initHero();
  initSections();
  initChrome(lenis);
  if (!reduced) initGL($('[data-gl]'), lenis);
  ScrollTrigger.refresh();

  // Fitted type depends on the viewport width: re-fit, then let ScrollTrigger re-measure.
  let lastW = window.innerWidth;
  ScrollTrigger.addEventListener('refreshInit', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    $$('[data-refit]').forEach((el) => el.refit?.());
  });

  await hero.intro();
  lenis?.start();

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

boot();

console.log(
  '%cHey, you opened the console.\n%cThat is exactly the kind of curiosity I like. Say hi: moussa.mamadou@outlook.com',
  'font: 700 16px sans-serif',
  'font: 12px sans-serif',
);
