import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, splitChars, reduced } from '../utils.js';
import { resetVisits } from './loader.js';

/*
 * Contact, the payoff: after a whole page of blue used sparingly, blue finally
 * floods everything from the top. The headline pieces arrive from opposite sides,
 * "extraordinary" bounces in letter by letter and keeps breathing, and a marquee
 * runs whichever way you're scrolling.
 */
export function initContact(visit, lenis) {
  const section = $('#contact');
  const flood = $('[data-flood]', section);

  if (reduced) {
    gsap.set(flood, { clipPath: 'none' });
    section.classList.add('is-blue');
  } else {
    gsap.to(flood, {
      clipPath: 'circle(150% at 50% 12%)',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 90%',
        end: 'top 5%',
        scrub: true,
        onUpdate: (self) => section.classList.toggle('is-blue', self.progress > 0.35),
      },
    });
  }

  // Headline: first two lines slide in from opposite sides, the last one bounces up.
  const words = $$('[data-contact-word]', section);
  const extra = $('[data-extra]', section);
  const extraChars = splitChars(extra);
  if (!reduced) {
    gsap.from(words[0], { xPercent: -110, ease: 'expo.out', duration: 1.4, scrollTrigger: { trigger: words[0], start: 'top 85%' } });
    gsap.from(words[1], { xPercent: 110, ease: 'expo.out', duration: 1.4, delay: 0.1, scrollTrigger: { trigger: words[0], start: 'top 85%' } });
    gsap.from(extraChars, {
      yPercent: 120,
      scaleY: 0.2,
      opacity: 0,
      duration: 1.4,
      ease: 'elastic.out(1, 0.45)',
      stagger: { each: 0.04, from: 'center' },
      scrollTrigger: { trigger: extra, start: 'top 90%' },
    });

    // "extraordinary" keeps breathing: a weight wave that never quite settles.
    let visible = false;
    ScrollTrigger.create({ trigger: extra, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });
    gsap.ticker.add((time) => {
      if (!visible) return;
      extraChars.forEach((c, i) => {
        c.style.fontWeight = (560 + 300 * Math.sin(time * 2.2 - i * 0.45)).toFixed(0);
      });
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
      track.style.transform = `translate3d(${x}px,0,0) skewX(${-dir * boost * 0.4}deg)`;
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
    n === 1 ? 'Visit #1 · you got the full show' : n === 2 ? 'Visit #2 · the loader noticed' : n === 3 ? 'Visit #3 · the loader gave up' : `Visit #${n} · you come here often`;
  $('[data-reset-visits]', section).addEventListener('click', () => {
    resetVisits();
    const url = new URL(location.href);
    url.searchParams.delete('visit');
    url.hash = '';
    location.href = url.toString();
  });
}
