export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const rand = (min, max) => min + Math.random() * (max - min);
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * Wrap every character of an element's text nodes in <span class="char">,
 * leaving child elements (icons, dots) untouched. Returns the char spans.
 */
export function splitChars(el) {
  if (el.dataset.split) return $$('.char', el);
  el.dataset.split = 'chars';
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.replace(/\s+/g, ' ');
        if (!text.trim() && !text.includes(' ')) return;
        const frag = document.createDocumentFragment();
        // Words stay unbreakable so a line never wraps in the middle of one.
        text.split(/( )/).forEach((part) => {
          if (!part) return;
          const holder = part === ' ' ? frag : document.createElement('span');
          if (part !== ' ') holder.className = 'word';
          for (const c of part) {
            const span = document.createElement('span');
            span.className = c === ' ' ? 'char space' : 'char';
            span.textContent = c;
            span.style.setProperty('--ci', chars.length);
            chars.push(span);
            holder.appendChild(span);
          }
          if (holder !== frag) frag.appendChild(holder);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  return chars;
}

/** Wrap each word in a clipping mask: <span class="w"><span>word</span></span>. */
export function maskWords(el, text) {
  el.innerHTML = text
    .split(' ')
    .map((w) => `<span class="w"><span>${w}</span></span>`)
    .join(' ');
  return $$('.w > span', el);
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/*
 * Fit-to-width type: every [data-fit] element is sized so its text spans the
 * width of its parent's content box exactly. Optional data-fit-max caps the
 * size as a fraction of the viewport height (e.g. 0.3).
 */
const fitted = new Set();
export function fitText(els) {
  els.forEach((el) => fitted.add(el));
  refit(els);
}
export function refit(els = fitted) {
  els.forEach((el) => {
    const parent = el.parentElement;
    const cs = getComputedStyle(parent);
    const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.style.fontSize = '100px';
    // Negative tracking leaves the last glyph hanging past the box; count it in.
    const ls = parseFloat(getComputedStyle(el).letterSpacing) || 0;
    const w = (el.getBoundingClientRect().width || 1) - Math.min(ls, 0);
    let size = (100 * avail) / w;
    const max = parseFloat(el.dataset.fitMax || '');
    if (max) size = Math.min(size, window.innerHeight * max);
    el.style.fontSize = `${size.toFixed(2)}px`;
  });
}

/*
 * Letter shuffle: characters cycle through random glyphs and settle back in
 * order, left to right. Used on nav and text links on hover.
 */
const UPPER = 'ABCDEFGHKMNOPRSTUXZ#/+';
const LOWER = 'abcdeghknopqrsuxz_-*';
export function shuffle(el, text = el.dataset.text || el.textContent) {
  el.dataset.text = text;
  if (el._shuffle) cancelAnimationFrame(el._shuffle);
  // Lock the width so neighbours don't jiggle while glyphs change size.
  el.style.display = 'inline-block';
  el.style.width = '';
  el.style.width = `${el.getBoundingClientRect().width}px`;
  el.style.whiteSpace = 'nowrap';
  const start = performance.now();
  const dur = 36 * text.length + 180;
  const frame = (now) => {
    const t = (now - start) / dur;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const settle = i / text.length;
      const c = text[i];
      const set = c === c.toLowerCase() ? LOWER : UPPER;
      out += c === ' ' || t > settle + 0.15 ? c : set[(Math.random() * set.length) | 0];
    }
    el.textContent = out;
    if (t < 1.15) el._shuffle = requestAnimationFrame(frame);
    else {
      el.textContent = text;
      el.style.width = '';
    }
  };
  el._shuffle = requestAnimationFrame(frame);
}
