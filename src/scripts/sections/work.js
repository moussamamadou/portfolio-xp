import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, lerp, clamp, canHover, reduced, splitChars, revealChars } from '../utils.js';

/*
 * Work:
 * 1. The heading has a small window between its words. Scrolling pins it and
 *    the window grows until it pushes the words off screen, flicking through
 *    every project on the way (after Codrops' on-scroll expanding image).
 * 2. The projects are an index. The row at the middle of the screen is the one
 *    in focus; on desktop, hovering a row brings up its cover, which trails the
 *    cursor and leans into the movement. Covers swap with a wipe.
 */
export function initWork() {
  const section = $('#work');
  initGrow(section);
  initIndex(section);
  if (canHover && !reduced) initPreview(section);
}

function initGrow(section) {
  const intro = $('[data-work-intro]', section);
  const grow = $('[data-work-grow]', section);
  const covers = $$('.cover', grow);
  // Heading words: letters rise out of their masks before the pin takes over.
  const words = [...$$('[data-work-line] > span:not(.work__grow)', section), $$('[data-work-line]', section)[1]];
  revealChars(words, { trigger: intro, start: 'top 75%', masked: true, stagger: 0.03 });
  let current = -1;
  let z = 1;
  const show = (i) => {
    if (i === current) return;
    current = i;
    const c = covers[i];
    c.style.zIndex = ++z;
    gsap.fromTo(c, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out' });
  };
  show(0);
  if (reduced) return;

  intro.style.height = '100svh';
  intro.style.display = 'flex';
  intro.style.flexDirection = 'column';
  intro.style.justifyContent = 'center';
  intro.style.paddingTop = '0';

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: intro,
      start: 'top top',
      end: '+=140%',
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        show(Math.min(covers.length - 1, Math.floor(clamp(self.progress / 0.8) * covers.length)));
        grow.classList.toggle('is-big', self.progress > 0.35);
      },
    },
  });
  tl.to(grow, {
    width: () => window.innerWidth - 2 * parseFloat(getComputedStyle($('.work__sub', section)).paddingLeft),
    height: () => window.innerHeight * (window.innerWidth < 900 ? 0.5 : 0.62),
    duration: 0.8,
  })
    .to({}, { duration: 0.2 });
}

function initIndex(section) {
  const rows = $$('[data-row]', section);
  rows.forEach((row) => {
    const rule = $('.row__rule', row);
    const title = $('[data-row-title]', row);
    ScrollTrigger.create({
      trigger: row,
      start: 'top 52%',
      end: 'bottom 52%',
      toggleClass: 'is-focus',
    });
    if (reduced) return;
    gsap.set(rule, { scaleX: 0 });
    title.classList.add('is-masked');
    const chars = splitChars(title).filter((c) => !c.classList.contains('space'));
    gsap.set(chars, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: row,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(rule, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' });
        gsap.to(chars, { yPercent: 0, duration: 1.1, ease: 'expo.out', delay: 0.15, stagger: 0.014 });
      },
    });
    // Mobile covers open like a shutter as they come in.
    const cover = $('.row__cover', row);
    if (getComputedStyle(cover).display !== 'none') {
      gsap.fromTo(
        cover,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: cover, start: 'top 95%', end: 'top 55%', scrub: 0.5 } },
      );
    }
  });
}

function initPreview(section) {
  const list = $('.work__list', section);
  const rows = $$('[data-row]', section);
  const preview = $('[data-preview]', section);
  const inner = $('[data-preview-inner]', section);
  const slides = $$('[data-preview-slide]', section);
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { ...pos };
  let open = false;
  let live = false;
  let current = -1;
  let z = 1;

  const setOpen = (v) => {
    if (open === v) return;
    open = v;
    list.classList.toggle('is-hovering', v);
    if (v) live = true;
    gsap.to(inner, {
      clipPath: v ? 'inset(0% 0% 0% 0%)' : 'inset(50% 50% 50% 50%)',
      duration: v ? 0.7 : 0.5,
      ease: 'expo.out',
      overwrite: true,
      onComplete: () => (live = open),
    });
    if (!v) {
      rows.forEach((r) => r.classList.remove('is-hover'));
      current = -1;
    }
  };
  const showSlide = (i) => {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    current = i;
    rows.forEach((r, j) => r.classList.toggle('is-hover', j === i));
    const s = slides[i];
    s.style.zIndex = ++z;
    gsap.fromTo(
      s,
      { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out', overwrite: true },
    );
    gsap.fromTo($('.cover__num', s), { yPercent: 40 * dir }, { yPercent: 0, duration: 0.9, ease: 'expo.out' });
  };

  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', () => {
      setOpen(true);
      showSlide(i);
    });
  });
  list.addEventListener('pointerleave', () => setOpen(false));
  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });
  // Scrolling moves rows under a still cursor, so check what's under it.
  ScrollTrigger.create({
    trigger: list,
    start: 'top bottom',
    end: 'bottom top',
    onLeave: () => setOpen(false),
    onLeaveBack: () => setOpen(false),
  });

  const w = () => preview.offsetWidth;
  const h = () => preview.offsetHeight;
  gsap.ticker.add(() => {
    if (!live) return;
    const px = pos.x;
    pos.x = lerp(pos.x, target.x, 0.12);
    pos.y = lerp(pos.y, target.y, 0.12);
    const vx = pos.x - px;
    // Keep the cover on the side of the cursor with more room.
    const side = target.x > window.innerWidth * 0.62 ? -1 : 1;
    const x = pos.x + (side > 0 ? 40 : -40 - w());
    const y = clamp(pos.y - h() / 2, 70, window.innerHeight - h() - 20);
    gsap.set(preview, { x, y, rotation: clamp(vx * 0.35, -8, 8), skewX: clamp(-vx * 0.25, -10, 10) });
  });
}
