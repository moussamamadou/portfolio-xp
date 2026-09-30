import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { $, $$, splitChars, rand, reduced } from '../utils.js';

/*
 * About: the title assembles itself from scattered letters, the intro paragraph
 * "reads itself" as you scroll, the answer gets stamped on the page, and the
 * story is drawn as a winding route that lights up each stop.
 */
export function initAbout() {
  const section = $('#about');

  // 1. Title letters fly in from above and below and snap into place.
  $$('[data-scatter]', section).forEach((line, li) => {
    const chars = splitChars(line);
    if (reduced) return;
    gsap.from(chars, {
      yPercent: (i) => (i % 2 ? 1 : -1) * rand(90, 220),
      xPercent: () => rand(-60, 60),
      rotation: () => rand(-50, 50),
      opacity: 0,
      ease: 'none',
      stagger: { each: 0.02, from: li ? 'end' : 'start' },
      scrollTrigger: { trigger: line, start: 'top 95%', end: 'top 45%', scrub: 1 },
    });
  });

  // 2. The lead paragraph fills in word by word with the scroll.
  const lead = $('[data-fill]', section);
  const words = new SplitType(lead, { types: 'words' }).words;
  if (!reduced) {
    gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: lead, start: 'top 80%', end: 'bottom 50%', scrub: true },
      },
    );
  }

  // 3. "Yes, it's possible." lands like a rubber stamp and shakes the page a little.
  const stamp = $('[data-stamp]', section);
  const note = $('[data-stamp-note]', section);
  if (!reduced) {
    gsap.set(stamp, { scale: 3.2, rotation: -18, opacity: 0 });
    gsap.set(note, { opacity: 0 });
    ScrollTrigger.create({
      trigger: stamp,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap
          .timeline()
          .to(stamp, { scale: 1, rotation: -4, opacity: 1, duration: 0.45, ease: 'power4.in' })
          .fromTo(section, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.2)', clearProps: 'x' })
          .to(note, { opacity: 1, duration: 0.2 }, '-=0.4')
          .to(note, { duration: 1.4, scrambleText: { text: note.textContent, chars: 'lowerCase', speed: 0.5 } }, '<');
      },
    });
  }

  // 4. The route: an SVG path threaded through each stop, drawn by the scroll.
  const route = $('[data-route]', section);
  const svg = $('.route__svg', route);
  const path = $('.route__path', route);
  const ghost = $('.route__ghost', route);
  const stops = $$('[data-stop]', route);

  const buildPath = () => {
    const box = route.getBoundingClientRect();
    const pts = $$('[data-dot]', route).map((d) => {
      const b = d.getBoundingClientRect();
      return { x: b.left + b.width / 2 - box.left, y: b.top + b.height / 2 - box.top };
    });
    const first = { x: pts[0].x, y: 0 };
    const all = [first, ...pts];
    let d = `M ${first.x} ${first.y}`;
    for (let i = 1; i < all.length; i++) {
      const a = all[i - 1];
      const b = all[i];
      // Vertical tangents keep each leg in the corridor between the cards,
      // and the corridor zig-zags: an unconventional route, drawn literally.
      const k = (b.y - a.y) * 0.55;
      d += ` C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`;
    }
    const last = all[all.length - 1];
    d += ` L ${last.x} ${box.height}`;
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    path.setAttribute('d', d);
    ghost.setAttribute('d', d);
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    return len;
  };

  let len = buildPath();
  ScrollTrigger.addEventListener('refreshInit', () => {
    len = buildPath();
  });

  if (reduced) {
    path.style.strokeDashoffset = '0';
    stops.forEach((s) => s.classList.add('is-on'));
  } else {
    gsap.fromTo(
      path,
      { strokeDashoffset: () => len },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: route, start: 'top 60%', end: 'bottom 60%', scrub: 0.6, invalidateOnRefresh: true },
      },
    );
    stops.forEach((stop) => {
      const card = $('.route__card', stop);
      const fromX = stop.classList.contains('route__stop--left') ? -60 : 60;
      gsap.set(card, { x: fromX, opacity: 0 });
      ScrollTrigger.create({
        trigger: $('[data-dot]', stop),
        start: 'top 60%',
        onEnter: () => {
          stop.classList.add('is-on');
          gsap.to(card, { x: 0, opacity: 1, duration: 1, ease: 'expo.out' });
        },
        onLeaveBack: () => {
          stop.classList.remove('is-on');
          gsap.to(card, { x: fromX, opacity: 0, duration: 0.5, ease: 'power2.in' });
        },
      });
    });
  }

  // 5. The formula: the ingredients start scattered and slide together into one line.
  const eq = $('[data-equation]', section);
  const chips = $$('[data-chip]', eq);
  const ops = $$('[data-op]', eq);
  const result = $('[data-result]', eq);
  if (!reduced) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: eq, start: 'top 90%', end: 'top 30%', scrub: 1 },
      defaults: { ease: 'none' },
    });
    tl.from(chips, {
      x: (i) => (i - 1.5) * window.innerWidth * 0.18,
      y: (i) => (i % 2 ? 1 : -1) * 120,
      rotation: (i) => (i % 2 ? 14 : -12),
    }, 0)
      .from(ops, { scale: 0, rotation: 180 }, 0.4)
      .fromTo(result, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0.5);
  }
}
