import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { reduced } from './lib.js';
import { initSections } from './sections.js';
import { initChrome } from './chrome.js';

gsap.registerPlugin(ScrollTrigger);

async function boot() {
  window.scrollTo(0, 0);

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Line splitting measures text, so the font has to be in first.
  await document.fonts.ready;
  initSections();
  initChrome(lenis);
  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

boot();

console.log(
  '%cHey, you opened the console.\n%cThat is exactly the kind of curiosity I like. Say hi: moussa.mamadou@outlook.com',
  'font: 700 16px sans-serif',
  'font: 12px sans-serif',
);
