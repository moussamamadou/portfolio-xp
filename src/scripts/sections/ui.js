import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, canHover, reduced, shuffle } from '../utils.js';

/* Hovering a [data-shuffle] link scrambles its text and lets it settle. */
export function initShuffles() {
  if (!canHover || reduced) return;
  $$('[data-shuffle]').forEach((el) => {
    const text = $('.shuf', el) ?? el;
    el.addEventListener('pointerenter', () => shuffle(text));
  });
}

/* Section heads: the hairline draws itself, then the labels rise into their cells. */
export function initSectionHeads() {
  $$('[data-shead]').forEach((head) => {
    if (reduced) return head.classList.add('is-in');
    ScrollTrigger.create({ trigger: head, start: 'top 88%', once: true, onEnter: () => head.classList.add('is-in') });
  });
}

/*
 * The cursor: an 8px black square. Over anything with data-cursor it stretches
 * into a label, sized to the text so it never looks like a pill.
 */
export function initCursor() {
  if (!canHover) return;
  const cursor = $('.cursor');
  const label = $('.cursor__label', cursor);
  const x = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
  let current = null;

  window.addEventListener('pointermove', (e) => {
    x(e.clientX);
    y(e.clientY);
    const target = e.target.closest?.('[data-cursor]');
    cursor.classList.toggle('on-blue', !!e.target.closest?.('.contact.is-blue, .menu'));
    if (target === current) return;
    current = target;
    if (target) {
      label.textContent = target.dataset.cursor;
      cursor.style.setProperty('--cw', `${label.scrollWidth + 2}px`);
      cursor.classList.add('is-active');
    } else {
      cursor.classList.remove('is-active');
    }
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
}

/* Smooth anchor scrolling through Lenis (falls back to native). */
export function initAnchors(lenis, onNavigate) {
  $$('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      onNavigate?.();
      if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (target === 0) window.scrollTo({ top: 0 });
      else target.scrollIntoView();
    });
  });
}

/* Press G to see the 12-column grid everything sits on. */
export function initGridToggle() {
  const lines = $('.gridlines');
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    lines.classList.toggle('is-on');
  });
}

/*
 * Nav: a small editorial bar. A small square slides to the section you're in and
 * pushes its label over; the name folds down to "M.M." once you leave the hero;
 * everything turns white over the black contact section.
 */
export function initNav(lenis) {
  const nav = $('#nav');
  const links = $$('.nav__link', nav);
  const burger = $('.nav__burger', nav);
  const burgerLabel = $('[data-burger-label]', burger);
  const menu = $('#menu');
  let active = null;
  let isOpen = false;

  const moveMarker = (link) => links.forEach((l) => l.classList.toggle('is-active', l === link));

  links.forEach((link) => {
    const section = $(`#${link.dataset.section}`);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) active = link;
        else if (active === link) active = null;
        moveMarker(active);
      },
    });
  });

  // Past the hero the bar gets a solid ground so content can pass under it.
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top top',
    end: 'max',
    toggleClass: { targets: nav, className: 'is-solid' },
  });

  // The name folds away to its initials after the hero.
  const folds = $$('[data-fold]', nav);
  folds.forEach((f) => (f.dataset.w = f.offsetWidth));
  const fold = (closed) =>
    gsap.to(folds, {
      width: (i, f) => (closed ? 0 : +f.dataset.w),
      duration: 0.8,
      ease: 'expo.inOut',
      stagger: 0.05,
      overwrite: true,
      onComplete: () => !closed && gsap.set(folds, { clearProps: 'width' }),
    });
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 60%',
    onEnter: () => fold(true),
    onLeaveBack: () => fold(false),
  });

  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 30px',
    end: 'bottom top',
    onToggle: (self) => {
      nav.dataset.blue = self.isActive ? '1' : '';
      nav.classList.toggle('on-blue', self.isActive || isOpen);
    },
  });

  // Mobile menu: the panel wipes down, links rise one by one, closes the other way.
  const menuLinks = $$('a', menu);
  const labels = $$('.menu__link', menu);
  const setMenu = (open) => {
    isOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menuLinks.forEach((a) => (a.tabIndex = open ? 0 : -1));
    nav.classList.toggle('on-blue', open || nav.dataset.blue === '1');
    burgerLabel.textContent = open ? 'Close' : 'Menu';
    gsap.killTweensOf([menu, labels]);
    if (open) {
      lenis?.stop();
      gsap.set(menu, { visibility: 'visible' });
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(labels, { yPercent: 105 }, { yPercent: 0, duration: 0.8, stagger: 0.04, ease: 'expo.out', delay: 0.35 });
    } else {
      lenis?.start();
      gsap.to(labels, { yPercent: -105, duration: 0.4, stagger: 0.02, ease: 'power3.in' });
      gsap.to(menu, {
        clipPath: 'inset(0% 0% 0% 100%)',
        duration: 0.7,
        delay: 0.15,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
      });
    }
  };
  burger.addEventListener('click', () => setMenu(!isOpen));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) setMenu(false);
  });

  // Hidden until the loader is gone, then each cell slides up into place.
  const parts = [...nav.children].filter((c) => getComputedStyle(c).display !== 'none');
  if (!reduced) gsap.set(parts, { yPercent: -120, opacity: 0 });

  return {
    closeMenu: () => isOpen && setMenu(false),
    intro() {
      return gsap.to(parts, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, onComplete: () => moveMarker(active) });
    },
  };
}
