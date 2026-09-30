import gsap from 'gsap';
import { $, $$, maskWords, reduced } from '../utils.js';

// The more you visit, the less the loading screen has to say.
const KEY = 'mm-portfolio:visits';

export function readVisit() {
  let count = 1;
  try {
    count = (parseInt(localStorage.getItem(KEY) || '0', 10) || 0) + 1;
    localStorage.setItem(KEY, String(count));
  } catch {
    /* storage blocked: everyone is a first-time visitor */
  }
  // ?visit=3 previews a given loader without touching the stored count.
  const forced = parseInt(new URLSearchParams(location.search).get('visit') || '', 10);
  return { count, shown: forced > 0 ? forced : count };
}

export function resetVisits() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to reset */
  }
}

const pageLoaded = new Promise((resolve) => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve, { once: true });
});

/*
 * One quiet layout for every visit: a name, one line of copy, a hairline and an
 * odometer counting to 100. What changes is how long it takes and what it says.
 * 1: a short show. 2: it knows you're back. 3: it just loads. 4+: it barely bothers.
 */
const scripts = {
  1: {
    steps: [0, 18, 46, 73, 100],
    lines: ['Loading a portfolio.', 'Aligning twelve columns.', 'Kerning the name, twice.', 'Please act impressed.'],
    visit: 'First visit. Enjoy the (short) show.',
  },
  2: {
    steps: [0, 52, 100],
    lines: ["Oh, you're back.", 'Shorter version then.'],
    visit: 'Visit 02. The loader noticed.',
  },
  3: {
    steps: [0, 100],
    lines: ['Loading. For real this time.'],
    visit: 'Visit 03. No more jokes.',
  },
  4: {
    steps: [0, 100],
    lines: ['You come here often.'],
    visit: null,
  },
};

function buildCounter(el) {
  el.innerHTML = [2, 10, 10]
    .map((n) => `<span class="loader__digit"><span>${Array.from({ length: n }, (_, i) => `<span>${i}</span>`).join('')}</span></span>`)
    .join('') + '<span class="loader__pct">%</span>';
  const cols = $$('.loader__digit > span', el);
  return (v) => {
    const n = Math.round(v);
    const digits = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
    cols.forEach((c, i) => gsap.set(c, { yPercent: -(digits[i] * 100) / (i ? 10 : 2) }));
  };
}

function swapLine(el, text) {
  const tl = gsap.timeline();
  const old = $$('.w > span', el);
  if (old.length) tl.to(old, { yPercent: -105, duration: 0.35, stagger: 0.01, ease: 'power3.in' });
  tl.add(() => {
    const words = maskWords(el, text);
    gsap.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 0.6, stagger: 0.02, ease: 'expo.out' });
  });
  return tl;
}

/**
 * Plays the loader that matches the visit count.
 * Resolves the moment the site should start revealing itself.
 */
export function runLoader(visit) {
  const loader = $('#loader');
  const level = reduced ? 3 : Math.min(visit.shown, 4);
  const script = scripts[level];
  const line = $('[data-loader-line]', loader);
  const bar = $('[data-loader-bar]', loader);
  const setCount = buildCounter($('[data-loader-count]', loader));
  $('[data-loader-visit]', loader).textContent = script.visit ?? `Visit ${String(visit.shown).padStart(2, '0')}. Welcome back, regular.`;

  return new Promise((resolve) => {
    let leaving = false;
    const state = { p: 0 };
    const render = () => {
      setCount(state.p);
      gsap.set(bar, { scaleX: state.p / 100 });
    };
    render();

    const leave = () => {
      if (leaving) return;
      leaving = true;
      tl.kill();
      state.p = 100;
      render();
      window.removeEventListener('keydown', onKey);
      gsap
        .timeline({ onComplete: () => loader.remove() })
        .to($$('.loader__digit > span, .loader__pct, .loader__top > *, .loader__visit', loader), {
          yPercent: '-=100',
          opacity: 0,
          duration: 0.35,
          stagger: 0.015,
          ease: 'power3.in',
        })
        .to(bar, { scaleX: 0, transformOrigin: 'right', duration: 0.4, ease: 'expo.in' }, 0)
        .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.2)
        .add(resolve, 0.4);
    };

    const onKey = (e) => e.key === 'Escape' && leave();
    window.addEventListener('keydown', onKey);
    $('.loader__skip', loader).addEventListener('click', leave);

    // Count up in a few uneven jumps; each jump brings the next line of copy.
    const tl = gsap.timeline({ delay: 0.15 });
    const perStep = level === 1 ? 0.45 : level === 2 ? 0.5 : level === 3 ? 0.6 : 0.35;
    script.steps.slice(1).forEach((to, i) => {
      if (script.lines[i]) tl.add(swapLine(line, script.lines[i]), i === 0 ? 0 : '>-0.1');
      tl.to(state, { p: to, duration: perStep, ease: 'expo.inOut', onUpdate: render }, i === 0 ? 0.1 : '<0.05');
    });
    const tail = script.lines.slice(script.steps.length - 1);
    tail.forEach((l) => tl.add(swapLine(line, l)).to({}, { duration: 0.45 }));
    tl.add(() => pageLoaded.then(() => gsap.delayedCall(level === 1 ? 0.3 : 0.05, leave)));
  });
}
