import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, fitText, reduced } from '../utils.js';
import { resetVisits } from './loader.js';

/*
 * Contact, the payoff: after a whole page on paper, twelve black
 * columns drop in one after the other (the grid itself floods). The headline
 * lines rise out of their masks, and a marquee runs whichever way you're scrolling.
 */
export function initContact(visit, lenis) {
  const section = $('#contact');
  const cols = $$('[data-flood-col]', section);

  if (reduced) {
    gsap.set(cols, { scaleY: 1 });
    section.classList.add('is-blue');
  } else {
    gsap.to(cols, {
      scaleY: 1,
      ease: 'power2.inOut',
      stagger: { each: 0.06, from: 'start' },
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'top 5%',
        scrub: 0.4,
        onUpdate: (self) => section.classList.toggle('is-blue', self.progress > 0.55),
      },
    });
  }

  // Headline: fitted lines that rise from their masks one after the other.
  const lines = $$('[data-contact-line]', section);
  const big = $('.bigcta__text', section);
  splitChars(big);
  fitText([...lines, big]);
  if (!reduced) {
    gsap.set(lines, { yPercent: 105 });
    ScrollTrigger.create({
      trigger: lines[0],
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 }),
    });
  }

  // Copy the email address, with a bit of attitude.
  const copyBtn = $('[data-copy]', section);
  const copyLabel = $('[data-copy-label]', copyBtn);
  const original = copyLabel.textContent;
  copyBtn.addEventListener('click', async () => {
    let msg = 'Copied. Go write something nice.';
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.copy);
    } catch {
      msg = 'Copy blocked. Old-school select it?';
    }
    gsap.to(copyLabel, { duration: 0.8, scrambleText: { text: msg, chars: 'upperCase', speed: 0.6 } });
    gsap.to(copyLabel, { delay: 3, duration: 0.8, scrambleText: { text: original, chars: 'upperCase', speed: 0.6 } });
  });

  // Marquee: direction follows your scroll, speed follows how hard you scroll.
  const track = $('[data-marquee-track]', section);
  const group = $('.marquee__group', track);
  let x = 0;
  let dir = -1;
  let boost = 0;
  lenis?.on('scroll', (l) => {
    if (l.direction) dir = l.direction === 1 ? -1 : 1;
    boost = Math.min(Math.abs(l.velocity) * 0.6, 30);
  });
  if (!reduced) {
    gsap.ticker.add((_, delta) => {
      const w = group.offsetWidth;
      if (!w) return;
      boost *= 0.94;
      x += dir * (1.2 + boost) * (delta / 16.7);
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.style.transform = `translate3d(${x}px,0,0) skewX(${-dir * boost * 0.3}deg)`;
    });
  }

  // Footer: the visitor's clock, and a way to get the dramatic loader back.
  const clock = $('[data-clock]', section);
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  tick();
  setInterval(tick, 1000);

  const visitLine = $('[data-visit-line]', section);
  const n = visit.count;
  visitLine.textContent =
    n === 1 ? 'Visit #1 · you got the full show' : n === 2 ? 'Visit #2 · the loader noticed' : n === 3 ? 'Visit #3 · the loader stopped joking' : `Visit #${n} · you come here often`;
  $('[data-reset-visits]', section).addEventListener('click', () => {
    resetVisits();
    const url = new URL(location.href);
    url.searchParams.delete('visit');
    url.hash = '';
    location.href = url.toString();
  });
}
