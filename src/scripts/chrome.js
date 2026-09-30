import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reduced, finePointer } from './lib.js';

// Header, menu, anchors, cursor chip, clocks, copy button.
export function initChrome(lenis) {
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else document.querySelector(target)?.scrollIntoView();
  };

  // Menu (mobile)
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const words = $$('[data-menu-word]', menu);
  let open = false;
  const setMenu = (v) => {
    open = v;
    toggle.setAttribute('aria-expanded', String(v));
    menu.setAttribute('aria-hidden', String(!v));
    $('[data-menu-label]').textContent = v ? 'Close' : 'Menu';
    $$('a', menu).forEach((a) => (a.tabIndex = v ? 0 : -1));
    if (v) {
      lenis?.stop();
      gsap.set(menu, { visibility: 'visible' });
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.3 });
    } else {
      lenis?.start();
      gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    }
  };
  toggle.addEventListener('click', () => setMenu(!open));

  // Anchors
  $$('[data-scroll-to]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href');
      if (!target?.startsWith('#')) return;
      e.preventDefault();
      if (open) setMenu(false);
      scrollTo(target === '#top' ? 0 : target);
    }),
  );

  // Active section in the header
  $$('[data-nav]').forEach((link) => {
    const section = document.getElementById(link.dataset.nav);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  // Scramble small links on hover
  if (finePointer && !reduced) {
    $$('[data-scramble]').forEach((el) => {
      const text = el.textContent;
      (el.closest('a') ?? el).addEventListener('pointerenter', () =>
        gsap.to(el, { duration: 0.6, scrambleText: { text, chars: 'upperCase', speed: 0.8 }, overwrite: true }),
      );
    });
  }

  // Cursor chip on anything with a data-cursor label
  const chip = $('[data-cursor-chip]');
  const chipText = $('[data-cursor-text]');
  if (finePointer) {
    const x = gsap.quickTo(chip, 'x', { duration: 0.45, ease: 'power3.out' });
    const y = gsap.quickTo(chip, 'y', { duration: 0.45, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      x(e.clientX + 18);
      y(e.clientY + 18);
    });
    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        chipText.textContent = el.dataset.cursor;
        gsap.to(chip, { scale: 1, xPercent: 0, yPercent: 0, duration: 0.35, ease: 'back.out(2)' });
      });
      el.addEventListener('pointerleave', () => gsap.to(chip, { scale: 0, duration: 0.25, ease: 'power2.in' }));
    });
    gsap.set(chip, { xPercent: 0, yPercent: 0, transformOrigin: '0% 0%' });
  }

  // Clocks
  const clocks = $$('[data-clock]');
  const tick = () => {
    const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
    clocks.forEach((c) => (c.textContent = t));
  };
  tick();
  setInterval(tick, 1000);

  // Copy email
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn);
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = 'Copied ✓';
      } catch {
        label.textContent = 'Select it above';
      }
      gsap.delayedCall(2, () => (label.textContent = 'Copy address'));
    });
  });
}
