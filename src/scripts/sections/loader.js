import gsap from 'gsap';
import { $, $$, maskWords, reduced } from '../utils.js';

// The more you visit, the less seriously the loading screen takes itself.
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

function swap(el, text, { out = 0.45, inn = 0.8 } = {}) {
  const tl = gsap.timeline();
  const old = $$('.w > span', el);
  if (old.length) tl.to(old, { yPercent: -110, duration: out, stagger: 0.015, ease: 'power3.in' });
  tl.add(() => {
    const words = maskWords(el, text);
    gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: inn, stagger: 0.03, ease: 'expo.out' });
  });
  return tl;
}

/**
 * Plays the loader that matches the visit count.
 * Resolves the moment the site should start revealing itself.
 */
export function runLoader(visit) {
  const loader = $('#loader');
  const stage = $('.loader__stage', loader);
  const skip = $('.loader__skip', loader);
  const level = reduced ? 3 : Math.min(visit.shown, 4);
  loader.classList.add(`loader--v${level}`);

  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    const ctx = { loader, stage, skip, visit, done };
    const variant = [dramatic, selfAware, real, regular][level - 1](ctx);

    const onSkip = () => variant.skip();
    skip.addEventListener('click', onSkip, { once: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', onKey);
        onSkip();
      }
    };
    window.addEventListener('keydown', onKey);
  });
}

/** Shared "get out of the way" exit: the whole loader lifts off like a sheet. */
function liftOff({ loader, done }, { delay = 0 } = {}) {
  gsap
    .timeline({ delay, onComplete: () => loader.classList.add('is-done') })
    .add(done, 0.25)
    .to(loader, {
      yPercent: -100,
      borderBottomLeftRadius: '50% 14vh',
      borderBottomRightRadius: '50% 14vh',
      duration: 1.1,
      ease: 'expo.inOut',
    }, 0);
}

/* --------------------------------------------------------------------------
   VISIT 01: THE DRAMATIC
   -------------------------------------------------------------------------- */
function dramatic(ctx) {
  const { stage, loader, done } = ctx;
  stage.innerHTML = `
    <div class="ld-top mono">
      <span>MM—OS v4.0.4 / Boot sequence</span>
      <span>[ Do not close your browser ]</span>
      <span>T+<span data-ld-time>00:00.00</span></span>
    </div>
    <div class="ld-orbit" aria-hidden="true">
      <div class="ld-orbit__ring"></div>
      <div class="ld-orbit__ring ld-orbit__ring--2"></div>
      <div class="ld-orbit__arm"></div>
      <div class="ld-orbit__arm ld-orbit__arm--2"></div>
      <div class="ld-orbit__core">✺</div>
    </div>
    <p class="ld-headline"></p>
    <div class="ld-log" aria-hidden="true"></div>
    <p class="ld-percent" aria-hidden="true"><span data-pct>0</span><sup>%</sup></p>
    <div class="ld-bar"></div>
    <div class="ld-curtain" aria-hidden="true">${'<span></span>'.repeat(6)}</div>`;

  const headline = $('.ld-headline', stage);
  const logEl = $('.ld-log', stage);
  const pctEl = $('[data-pct]', stage);
  const timeEl = $('[data-ld-time]', stage);
  const bar = $('.ld-bar', stage);
  const curtain = $$('.ld-curtain span', stage);

  const log = [
    ['Mounting ego.js', 'ok'],
    ['Inflating typography to 2000%', 'ok'],
    ['Calibrating blue (#2340FF)', 'ok'],
    ['Teaching buttons to be magnetic', 'ok'],
    ['Hiring a full orchestra', 'declined (budget)'],
    ['Rendering suspense', '38%… still 38%'],
    ['Polishing easing curves', 'expo.inOut'],
    ['Adding a loading screen to the loading screen', 'ok'],
    ['Checking if anyone is still here', '1 human detected'],
    ['Rehearsing the grand entrance', 'ready'],
  ];

  const pct = { v: 0 };
  const renderPct = () => {
    pctEl.textContent = Math.round(pct.v);
    bar.style.transform = `scaleX(${pct.v / 100})`;
  };

  const start = performance.now();
  const tick = () => {
    const t = (performance.now() - start) / 1000;
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = (t % 60).toFixed(2).padStart(5, '0');
    timeEl.textContent = `${m}:${s}`;
  };
  gsap.ticker.add(tick);

  const loops = [
    gsap.to($('.ld-orbit__arm', stage), { rotation: 360, duration: 2.4, repeat: -1, ease: 'none' }),
    gsap.to($('.ld-orbit__arm--2', stage), { rotation: -360, duration: 1.4, repeat: -1, ease: 'none' }),
    gsap.to($('.ld-orbit__ring', stage), { rotation: 360, duration: 24, repeat: -1, ease: 'none' }),
    gsap.to($('.ld-orbit__core', stage), { rotation: 360, duration: 5, repeat: -1, ease: 'none' }),
  ];

  const tl = gsap.timeline();
  tl.from($$('.ld-top > span', stage), { yPercent: 120, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'expo.out' }, 0)
    .from($('.ld-orbit', stage), { scale: 0, rotation: -180, duration: 1.6, ease: 'expo.out' }, 0.1)
    .from($('.ld-percent', stage), { yPercent: 50, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
    .add(swap(headline, 'Welcome to my portfolio loading experience...'), 0.3)
    .to(pct, { v: 37, duration: 1.9, ease: 'power2.inOut', onUpdate: renderPct }, 0.5)
    .to(pct, { v: 38, duration: 1, ease: 'none', onUpdate: renderPct })
    .add(swap(headline, 'Preparing something unnecessarily dramatic...'), 3)
    .to($('.ld-orbit', stage), { scale: 1.25, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, 3.2)
    .to(pct, { v: 86, duration: 1.4, ease: 'expo.out', onUpdate: renderPct }, 3.4)
    .to(pct, { v: 99, duration: 1.2, ease: 'power1.inOut', onUpdate: renderPct })
    .add(swap(headline, 'Almost done with the show. Thanks for waiting.'), 5.6)
    .to({}, { duration: 1 })
    .addPause('+=0', () => pageLoaded.then(() => tl.play()))
    .to(pct, { v: 100, duration: 0.35, ease: 'power2.in', onUpdate: renderPct })
    .to($('.ld-orbit', stage), { scale: 0, rotation: 180, duration: 0.8, ease: 'expo.in' }, '<')
    .add(showEnter);

  log.forEach((line, i) => {
    tl.call(() => {
      const p = document.createElement('p');
      p.innerHTML = `&gt; <b>${line[0]}</b> … <i>${line[1]}</i>`;
      logEl.appendChild(p);
      gsap.from(p, { opacity: 0, x: -12, duration: 0.4, ease: 'power2.out' });
    }, null, 0.4 + i * 0.62);
  });

  let enterBtn;
  function showEnter() {
    enterBtn = document.createElement('button');
    enterBtn.type = 'button';
    enterBtn.className = 'ld-enter';
    enterBtn.innerHTML = '<span class="ld-enter__label">Enter</span>';
    // Take the orbit's place, so the button lands where all the spinning was.
    const orbit = $('.ld-orbit', stage);
    enterBtn.style.left = `${orbit.offsetLeft + orbit.offsetWidth / 2}px`;
    enterBtn.style.top = `${orbit.offsetTop + orbit.offsetHeight / 2}px`;
    stage.insertBefore(enterBtn, $('.ld-curtain', stage));
    gsap.from(enterBtn, { scale: 0, duration: 1.2, ease: 'elastic.out(1, 0.45)' });
    enterBtn.focus({ preventScroll: true });
    enterBtn.addEventListener('click', enter, { once: true });
    ctx.skip.textContent = 'Or just press Enter';
  }

  let exiting = false;
  function cleanup() {
    tl.kill();
    loops.forEach((l) => l.kill());
    gsap.ticker.remove(tick);
  }

  // The payoff: the button swallows the screen, then the blue drains away upward.
  function enter() {
    if (exiting) return;
    exiting = true;
    cleanup();
    const r = enterBtn.getBoundingClientRect();
    const cover = (Math.hypot(window.innerWidth, window.innerHeight) / r.width) * 2.2;
    gsap
      .timeline({ onComplete: () => loader.classList.add('is-done') })
      .to($('.ld-enter__label', enterBtn), { opacity: 0, duration: 0.2 })
      .to(enterBtn, { scale: cover, duration: 0.9, ease: 'expo.inOut' }, 0)
      .set(curtain, { scaleY: 1 })
      .set([...stage.children].filter((c) => !c.classList.contains('ld-curtain')), { autoAlpha: 0 })
      .set([loader], { backgroundColor: 'transparent' })
      .set(ctx.skip, { autoAlpha: 0 })
      .add(done)
      .to(curtain, { scaleY: 0, transformOrigin: 'top', duration: 1.1, ease: 'expo.inOut', stagger: 0.06 });
  }

  return {
    skip() {
      if (exiting) return;
      if (enterBtn) return enter();
      exiting = true;
      cleanup();
      gsap.set(ctx.skip, { autoAlpha: 0 });
      liftOff(ctx);
    },
  };
}

/* --------------------------------------------------------------------------
   VISIT 02: THE SELF-AWARE
   -------------------------------------------------------------------------- */
function selfAware(ctx) {
  const { stage } = ctx;
  stage.innerHTML = `
    <div class="ld-simple">
      <p class="ld-simple__line"></p>
      <div class="ld-simple__bar"><span></span></div>
      <p class="mono ld-simple__small"><span class="ld-simple__pct">0%</span> · visit #${ctx.visit.shown}, we've met</p>
    </div>`;
  const line = $('.ld-simple__line', stage);
  const bar = $('.ld-simple__bar span', stage);
  const pctEl = $('.ld-simple__pct', stage);
  const pct = { v: 0 };
  const render = () => {
    pctEl.textContent = `${Math.round(pct.v)}%`;
    bar.style.transform = `scaleX(${pct.v / 100})`;
  };
  let exiting = false;
  const exit = () => {
    if (exiting) return;
    exiting = true;
    tl.kill();
    gsap.set(ctx.skip, { autoAlpha: 0 });
    liftOff(ctx);
  };
  const tl = gsap
    .timeline()
    .add(swap(line, "Back so soon? Let's pretend we're loading again..."), 0)
    .to(pct, { v: 45, duration: 1.2, ease: 'power2.out', onUpdate: render }, 0.2)
    .add(swap(line, 'Still keeping up appearances. Bear with me...'), 1.6)
    .to(pct, { v: 80, duration: 1, ease: 'power2.out', onUpdate: render }, 1.8)
    .add(swap(line, 'Last time with the drama, I promise.'), 3.1)
    .addPause('+=0.2', () => pageLoaded.then(() => tl.play()))
    .to(pct, { v: 100, duration: 0.6, ease: 'power2.inOut', onUpdate: render })
    .add(exit, '+=0.5');
  return { skip: exit };
}

/* --------------------------------------------------------------------------
   VISIT 03: THE REAL
   -------------------------------------------------------------------------- */
function real(ctx) {
  const { stage, loader, done } = ctx;
  stage.innerHTML = `
    <div class="ld-simple">
      <p class="ld-simple__line">Loading...</p>
      <div class="ld-simple__bar"><span></span></div>
      <p class="mono ld-simple__small">(no more pretending)</p>
    </div>`;
  const bar = $('.ld-simple__bar span', stage);
  let exiting = false;
  const exit = () => {
    if (exiting) return;
    exiting = true;
    tl.kill();
    gsap.timeline({ onComplete: () => loader.classList.add('is-done') }).add(done, 0.1).to(loader, { autoAlpha: 0, duration: 0.5 }, 0);
  };
  const tl = gsap
    .timeline()
    .to(bar, { scaleX: 0.7, duration: 0.8, ease: 'power1.out' })
    .addPause('+=0', () => pageLoaded.then(() => tl.play()))
    .to(bar, { scaleX: 1, duration: 0.3 })
    .add(exit, '+=0.15');
  return { skip: exit };
}

/* --------------------------------------------------------------------------
   VISIT 04+: THE REGULAR
   -------------------------------------------------------------------------- */
function regular(ctx) {
  const { stage, loader, done } = ctx;
  stage.innerHTML = `
    <div class="ld-simple">
      <p class="ld-simple__line"></p>
      <p class="mono ld-simple__small" style="opacity:0">We should probably stop pretending this is loading. (Visit #${ctx.visit.shown})</p>
    </div>`;
  const line = $('.ld-simple__line', stage);
  const small = $('.ld-simple__small', stage);
  let exiting = false;
  const exit = () => {
    if (exiting) return;
    exiting = true;
    tl.kill();
    gsap.timeline({ onComplete: () => loader.classList.add('is-done') }).add(done, 0.1).to(loader, { autoAlpha: 0, duration: 0.5 }, 0);
  };
  const tl = gsap
    .timeline()
    .add(swap(line, 'Loading...', { inn: 0.5 }), 0)
    .add(swap(line, 'You come here often.'), 0.8)
    .to(small, { opacity: 1, duration: 0.5 }, 1.5)
    .addPause('+=0', () => pageLoaded.then(() => tl.play()))
    .add(exit, '+=1');
  return { skip: exit };
}
