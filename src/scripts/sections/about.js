import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, fitText, reduced } from '../utils.js';

/*
 * About:
 * 1. The title comes in warped through an SVG turbulence filter and settles as
 *    you scroll (after Codrops' scroll-based SVG filter text experiments).
 * 2. The intro types itself behind a blue caret, driven by the scroll.
 * 3. "Yes, it's possible." unfurls letter by letter from the baseline.
 * 4. The story is an index; a blue square travels down it, lighting each stop.
 * 5. The formula is a poster of fitted lines that slide in from alternate sides.
 */
export function initAbout() {
  const section = $('#about');
  initWarp(section);
  initTyping(section);
  initUnfurl(section);
  initStory(section);
  initFormula(section);
}

function initWarp(section) {
  const title = $('[data-warp]', section);
  const map = $('[data-warp-map]', section);
  const noise = $('[data-warp-noise]', section);
  if (reduced) return;
  const state = { s: 160, f: 0.03 };
  const apply = () => {
    map.setAttribute('scale', state.s.toFixed(1));
    noise.setAttribute('baseFrequency', `${(state.f * 0.4).toFixed(4)} ${state.f.toFixed(4)}`);
    title.style.filter = state.s > 0.5 ? 'url(#warp)' : 'none';
  };
  apply();
  gsap.to(state, {
    s: 0,
    f: 0.004,
    ease: 'power2.out',
    onUpdate: apply,
    scrollTrigger: { trigger: title, start: 'top 95%', end: 'top 35%', scrub: 0.6 },
  });
  gsap.from($$('.about__title-line', title), {
    xPercent: (i) => (i ? 8 : -8),
    ease: 'none',
    scrollTrigger: { trigger: title, start: 'top 95%', end: 'top 35%', scrub: 0.6 },
  });
}

function initTyping(section) {
  const lead = $('[data-type]', section);
  const chars = splitChars(lead);
  if (reduced) return;
  lead.style.position = 'relative';
  const caret = document.createElement('span');
  caret.className = 'about__caret';
  caret.setAttribute('aria-hidden', 'true');
  caret.style.position = 'absolute';
  caret.style.left = '0';
  caret.style.top = '0';
  lead.appendChild(caret);

  let typed = -1;
  const place = (n) => {
    if (n === typed) return;
    typed = n;
    chars.forEach((c, i) => c.classList.toggle('is-typed', i < n));
    const ref = chars[Math.max(n - 1, 0)];
    const lb = lead.getBoundingClientRect();
    const b = ref.getBoundingClientRect();
    const x = n === 0 ? b.left - lb.left : b.right - lb.left;
    gsap.set(caret, { x: x + 2, y: b.top - lb.top + b.height * 0.14 });
  };
  place(0);
  ScrollTrigger.create({
    trigger: lead,
    start: 'top 80%',
    end: 'bottom 45%',
    onUpdate: (self) => place(Math.round(self.progress * chars.length)),
    onRefresh: (self) => {
      typed = -1;
      place(Math.round(self.progress * chars.length));
    },
  });
}

function initUnfurl(section) {
  const yes = $('[data-unfurl]', section);
  const chars = splitChars(yes);
  fitText([yes]);
  if (reduced) return;
  gsap.fromTo(
    chars,
    { scaleY: 0, yPercent: 20 },
    {
      scaleY: 1,
      yPercent: 0,
      ease: 'power3.out',
      stagger: { each: 0.04, from: 'center' },
      scrollTrigger: { trigger: yes, start: 'top 90%', end: 'top 45%', scrub: 0.8 },
    },
  );
}

function initStory(section) {
  const story = $('[data-story]', section);
  const rowsWrap = $('.story__rows', story);
  const rows = $$('[data-story-row]', story);
  const marker = $('[data-story-marker]', story);
  rowsWrap.appendChild(marker);

  if (reduced) {
    rows.forEach((r) => r.classList.add('is-on'));
    return;
  }

  rows.forEach((row) => {
    const rule = $('.story__rule', row);
    const rise = $$('[data-rise]', row);
    gsap.set(rule, { scaleX: 0 });
    gsap.set(rise, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: row,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(rule, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' });
        gsap.to(rise, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.2 });
      },
    });
  });

  // The route: a square that travels down the index and switches each stop on.
  ScrollTrigger.create({
    trigger: rowsWrap,
    start: 'top 55%',
    end: 'bottom 55%',
    scrub: true,
    onUpdate: (self) => {
      const h = rowsWrap.offsetHeight;
      const y = self.progress * (h - 30) + 26;
      gsap.to(marker, { y, duration: 0.4, ease: 'power3', overwrite: true });
      rows.forEach((r) => r.classList.toggle('is-on', r.offsetTop + 18 <= y));
    },
  });
  gsap.set(marker, { y: 26 });
}

function initFormula(section) {
  const formula = $('[data-formula]', section);
  const lines = $$('[data-formula-line]', formula);
  fitText(lines);
  if (reduced) return;
  lines.forEach((line, i) => {
    const last = i === lines.length - 1;
    if (last) {
      gsap.fromTo(
        line,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: line, start: 'top 95%', end: 'top 55%', scrub: 0.6 } },
      );
      return;
    }
    gsap.from(line, {
      xPercent: i % 2 ? 60 : -60,
      ease: 'none',
      scrollTrigger: { trigger: line, start: 'top bottom', end: 'top 55%', scrub: 0.6 },
    });
  });
}
