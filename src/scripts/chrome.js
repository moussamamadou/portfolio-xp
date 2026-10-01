import gsap from 'gsap';
import { $, $$ } from './lib.js';

// Anchors, the clock and the copy button.
export function initChrome(lenis) {
  $$('[data-scroll-to]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href');
      if (!target?.startsWith('#')) return;
      e.preventDefault();
      const to = target === '#top' ? 0 : target;
      if (lenis) lenis.scrollTo(to, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (to === 0) window.scrollTo(0, 0);
      else document.querySelector(target)?.scrollIntoView();
    }),
  );

  const clocks = $$('[data-clock]');
  const tick = () => {
    const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
    clocks.forEach((c) => (c.textContent = t));
  };
  tick();
  setInterval(tick, 1000);

  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn);
    const text = label.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = 'Copied ✓';
      } catch {
        label.textContent = 'Select it above';
      }
      gsap.delayedCall(2, () => (label.textContent = text));
    });
  });
}
