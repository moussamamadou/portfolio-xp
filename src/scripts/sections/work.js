import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { $, $$, reduced } from '../utils.js';

/*
 * Work: the heading rises out of masks, then the page turns sideways.
 * Each project slides past; its giant number swells and turns blue as it crosses
 * the middle, its visual opens up like a shutter, and a counter keeps score.
 */
export function initWork() {
  const section = $('#work');
  const pin = $('[data-work-pin]', section);
  const track = $('[data-work-track]', section);
  const projects = $$('[data-project]', section);
  const reel = $('[data-counter-reel]', section);

  // Heading lines slide up from behind masks.
  $$('[data-mask-lines]', section).forEach((el) => {
    const split = new SplitType(el, { types: 'lines' });
    split.lines.forEach((line) => {
      const mask = document.createElement('span');
      mask.className = 'mask-line';
      line.parentNode.insertBefore(mask, line);
      mask.appendChild(line);
    });
    if (reduced) return;
    gsap.from(split.lines, {
      yPercent: 110,
      rotation: 4,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  const setActive = (i) => {
    projects.forEach((p, j) => p.classList.toggle('is-active', j === i));
    if (i >= 0) reel.style.transform = `translateY(${-i * 1.5}em)`;
  };

  const mm = gsap.matchMedia();

  mm.add({ wide: '(min-width: 901px)', narrow: '(max-width: 900px)' }, (ctx) => {
    const { wide } = ctx.conditions;

    if (wide && !reduced) {
      section.classList.add('work--h');
      const distance = () => track.scrollWidth - window.innerWidth;
      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      projects.forEach((p, i) => {
        const num = $('[data-project-num]', p);
        const visual = $('[data-project-visual]', p);
        const art = $('.art', p);
        const title = $('[data-project-title]', p);
        const common = { trigger: p, containerAnimation: slide, scrub: true };

        gsap.fromTo(num, { scale: 0.55, xPercent: -10 }, { scale: 1.05, xPercent: 20, ease: 'none', scrollTrigger: { ...common, start: 'left right', end: 'right left' } });
        gsap.fromTo(
          visual,
          { clipPath: 'inset(22% 18% 22% 18% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { ...common, start: 'left 95%', end: 'center 55%' } },
        );
        gsap.fromTo(art, { xPercent: -12 }, { xPercent: 12, ease: 'none', scrollTrigger: { ...common, start: 'left right', end: 'right left' } });
        gsap.fromTo(title, { x: 90 }, { x: -40, ease: 'none', scrollTrigger: { ...common, start: 'left right', end: 'right left' } });

        ScrollTrigger.create({
          trigger: p,
          containerAnimation: slide,
          start: 'left 60%',
          end: 'right 40%',
          onToggle: (self) => self.isActive && setActive(i),
          onLeaveBack: () => i === 0 && setActive(-1),
        });
      });

      return () => section.classList.remove('work--h');
    }

    // Stacked version: same ideas, vertical.
    projects.forEach((p, i) => {
      const num = $('[data-project-num]', p);
      const visual = $('[data-project-visual]', p);
      if (!reduced) {
        gsap.fromTo(num, { scale: 0.6 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'center center', scrub: true } });
        gsap.fromTo(
          visual,
          { clipPath: 'inset(16% 12% 16% 12% round 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none', scrollTrigger: { trigger: visual, start: 'top 95%', end: 'center 55%', scrub: true } },
        );
      }
      ScrollTrigger.create({
        trigger: p,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => self.isActive && setActive(i),
      });
    });
    return undefined;
  });
}
