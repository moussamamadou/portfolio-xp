import SplitType from 'split-type';
import gsap from 'gsap';

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Split into chars, each tagged with its index for CSS staggers. */
export function chars(el) {
  const s = new SplitType(el, { types: 'words,chars', tagName: 'span' });
  s.chars.forEach((c, i) => c.style.setProperty('--i', i));
  return s.chars;
}

/** Split into lines, each wrapped in a mask. Returns the inner line spans. */
export function lines(el) {
  const s = new SplitType(el, { types: 'lines', tagName: 'span' });
  return s.lines.map((line) => {
    const mask = document.createElement('span');
    mask.className = 'line-mask';
    line.parentNode.insertBefore(mask, line);
    mask.appendChild(line);
    line.style.display = 'block';
    return line;
  });
}

/** Wrap every char of an element in a clip so it can rise from below. */
export function clippedChars(el) {
  const cs = chars(el);
  el.querySelectorAll('.word').forEach((w) => w.classList.add('clip'));
  return cs;
}

/** Rolling hover text: the host element triggers, the .roll child rolls. */
export function initRolls() {
  $$('[data-roll]').forEach((el) => {
    const inner = document.createElement('span');
    inner.className = 'roll__in';
    inner.textContent = el.textContent;
    el.textContent = '';
    el.appendChild(inner);
    chars(inner);
    (el.closest('a, button') ?? el).setAttribute('data-roll-host', '');
  });
}

/** Size an inline-block text element so it fills its parent's content width. */
export function fit(el, max = Infinity) {
  el.style.fontSize = '100px';
  const w = el.getBoundingClientRect().width;
  const avail = el.parentElement.clientWidth;
  el.style.fontSize = `${Math.min(max, Math.floor((100 * avail * 0.995) / w * 10) / 10)}px`;
}

/**
 * The signature: screenshot windows set into headlines. Each keeps cycling
 * through the projects, the next shot wiping up over the last.
 */
export function cycleWindows(wins, delay = 2) {
  wins.forEach((win, w) => {
    const imgs = [...win.querySelectorAll('img')];
    if (imgs.length < 2) return;
    let i = 0;
    let z = 1;
    gsap.delayedCall(delay + w * 0.6, function step() {
      i = (i + 1) % imgs.length;
      imgs[i].style.zIndex = ++z;
      gsap.fromTo(imgs[i], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9, ease: 'expo.inOut' });
      gsap.delayedCall(1.8, step);
    });
  });
}
