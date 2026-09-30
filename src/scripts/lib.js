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

/**
 * Size a display word so it fills `avail` px at a given width axis value.
 * The width axis is then free to animate without the size changing.
 */
export function fitW(el, avail, w = 125, max = Infinity) {
  const prev = el.style.getPropertyValue('--w');
  el.style.setProperty('--w', w);
  el.style.fontSize = '100px';
  const width = el.getBoundingClientRect().width;
  el.style.fontSize = `${Math.min(max, Math.floor(((100 * avail * 0.995) / width) * 10) / 10)}px`;
  if (prev) el.style.setProperty('--w', prev);
  else el.style.removeProperty('--w');
  el.classList.add('is-fit');
}

/** Read a CSS length custom property from :root, in px. */
export const cssPx = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
