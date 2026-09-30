import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, canHover, reduced } from '../utils.js';

/* Rolling letters on links and buttons (the CSS does the motion). */
export function initRolls() {
  $$('[data-roll]').forEach((el) => splitChars(el));
}

/* Magnetic buttons: they lean toward the cursor, then spring back. */
export function initMagnetic() {
  if (!canHover || reduced) return;
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const strength = el.classList.contains('btn--xxl') ? 0.25 : 0.4;
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      x((e.clientX - (b.left + b.width / 2)) * strength);
      y((e.clientY - (b.top + b.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: true });
    });
  });
}

/* A labelled bubble that appears only over elements that ask for one (data-cursor). */
export function initCursor() {
  if (!canHover) return null;
  const cursor = $('.cursor');
  const label = $('.cursor__label', cursor);
  const x = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  let current = null;

  window.addEventListener('pointermove', (e) => {
    x(e.clientX);
    y(e.clientY);
    const target = e.target.closest?.('[data-cursor]');
    if (target !== current) {
      current = target;
      if (target) {
        label.textContent = target.dataset.cursor;
        cursor.classList.add('is-active');
        cursor.classList.toggle('is-blue', !!target.closest('.pill, .specimen__card'));
      } else {
        cursor.classList.remove('is-active');
      }
    }
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  return {
    set(text) {
      label.textContent = text;
    },
  };
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

/*
 * Nav: a black pill slides to whichever section you're in (or whichever link you hover),
 * the bar tucks away when you scroll down and comes back when you scroll up.
 */
export function initNav(lenis) {
  const nav = $('#nav');
  const links = $$('.nav__link', nav);
  const pill = $('.nav__pill', nav);
  const wrap = $('.nav__links', nav);
  const progress = $('.nav__progress span', nav);
  const burger = $('.nav__burger', nav);
  const menu = $('#menu');
  let active = null;
  let hovered = null;

  const movePill = (link, instant = false) => {
    links.forEach((l) => l.classList.toggle('is-lit', l === link));
    if (!link) {
      gsap.to(pill, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power3.out' });
      return;
    }
    const w = wrap.getBoundingClientRect();
    const b = link.getBoundingClientRect();
    gsap.to(pill, {
      x: b.left - w.left,
      width: b.width,
      opacity: 1,
      scale: 1,
      duration: instant ? 0 : 0.7,
      ease: 'elastic.out(1, 0.75)',
    });
  };

  links.forEach((link) => {
    link.addEventListener('pointerenter', () => {
      hovered = link;
      movePill(link);
    });
    link.addEventListener('pointerleave', () => {
      hovered = null;
      movePill(active);
    });
  });

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
        if (!hovered) movePill(active);
      },
    });
  });

  // Contact floods blue, so the nav switches to white there.
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 40px',
    end: 'bottom top',
    toggleClass: { targets: nav, className: 'on-blue' },
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      progress.style.transform = `scaleX(${self.progress})`;
      const menuOpen = burger.getAttribute('aria-expanded') === 'true';
      if (!menuOpen) nav.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 240);
    },
  });

  // Mobile menu: a circle grows out of the burger.
  const menuLinks = $$('a', menu);
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menuLinks.forEach((a) => (a.tabIndex = open ? 0 : -1));
    nav.classList.toggle('on-blue', open);
    if (open) {
      lenis?.stop();
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'circle(150% at calc(100% - 50px) 36px)', duration: 0.9, ease: 'expo.inOut' });
      gsap.fromTo($$('.menu__link', menu), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out', delay: 0.3 });
    } else {
      lenis?.start();
      gsap.to(menu, {
        clipPath: 'circle(0% at calc(100% - 50px) 36px)',
        duration: 0.7,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
      });
    }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // Hidden until the loader is gone, then the pieces drop in one by one.
  const parts = [$('.nav__logo', nav), $('.nav__status', nav), ...links, $('.nav__cta', nav), burger];
  gsap.set(parts, { yPercent: -160, opacity: 0 });
  gsap.set(wrap, { scaleX: 0.2, opacity: 0 });

  return {
    closeMenu: () => burger.getAttribute('aria-expanded') === 'true' && setMenu(false),
    intro() {
      return gsap
        .timeline()
        .to(wrap, { scaleX: 1, opacity: 1, duration: 1, ease: 'expo.out' }, 0.4)
        .to(parts, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, 0.5)
        .add(() => movePill(active, true));
    },
  };
}
