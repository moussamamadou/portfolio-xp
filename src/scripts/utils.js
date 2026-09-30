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
