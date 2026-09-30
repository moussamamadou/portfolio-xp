import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import Lenis from 'lenis';

import { reduced } from './utils.js';
import { readVisit, runLoader } from './sections/loader.js';
import { initRolls, initMagnetic, initCursor, initAnchors, initNav } from './sections/ui.js';
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

  initRolls();
  initMagnetic();
  initCursor();
  const nav = initNav(lenis);
  initAnchors(lenis, () => nav.closeMenu());
  const hero = initHero();
  initAbout();
  initWork();
  initLabs();
  initExpertise();
  initRecognition();
  initContact(visit, lenis);
  ScrollTrigger.refresh();

  await runLoader(visit);
  lenis?.start();
  hero.intro();
  nav.intro();

  // Fonts or late layout shifts: re-measure once everything has settled.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

boot();

console.log(
  '%cHey, you opened the console. 👋\n%cThat is exactly the kind of curiosity I like. Say hi: moussa.mamadou@outlook.com',
  'font: 600 16px sans-serif; color: #2340ff',
  'font: 12px monospace; color: #0e0e0e',
);
