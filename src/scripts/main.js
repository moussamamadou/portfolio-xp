import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import Lenis from 'lenis';

import { reduced, refit } from './utils.js';
import { readVisit, runLoader } from './sections/loader.js';
import { initShuffles, initSectionHeads, initCursor, initAnchors, initNav, initGridToggle } from './sections/ui.js';
import { initHero } from './sections/hero.js';
import { initAbout } from './sections/about.js';
import { initWork } from './sections/work.js';
import { initLabs } from './sections/labs.js';
import { initExpertise } from './sections/expertise.js';
import { initRecognition } from './sections/recognition.js';
import { initContact } from './sections/contact.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, Draggable, InertiaPlugin);

async function boot() {
  const visit = readVisit();
  window.scrollTo(0, 0);

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // SplitType and the route path measure text, so wait for the fonts first.
  await document.fonts.ready;

  initShuffles();
  initCursor();
  initGridToggle();
  const hero = initHero();
  initAbout();
  initWork();
  initLabs();
  initExpertise();
  initRecognition();
  initContact(visit, lenis);
  // The nav watches every section, so it goes last, after the pins exist.
  const nav = initNav(lenis);
  initAnchors(lenis, () => nav.closeMenu());
  initSectionHeads();
  ScrollTrigger.refresh();

  // Fitted type depends on the viewport width, so re-fit before ScrollTrigger re-measures.
  let lastW = window.innerWidth;
  ScrollTrigger.addEventListener('refreshInit', () => {
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      refit();
    }
  });

  await runLoader(visit);
  lenis?.start();
  hero.intro();
  nav.intro();

  // Fonts or late layout shifts: re-measure once everything has settled.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

boot();

console.log(
  '%cHey, you opened the console.\n%cThat is exactly the kind of curiosity I like. Say hi: moussa.mamadou@outlook.com\n(Psst: press G on the page to see the grid.)',
  'font: 700 16px sans-serif; color: #1d3bff',
  'font: 12px sans-serif; color: #0b0b0b',
);
