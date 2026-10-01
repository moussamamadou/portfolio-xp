import SplitType from 'split-type';

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
