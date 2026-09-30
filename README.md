# Moussa Mamadou — Portfolio XP

A single-page creative developer portfolio where the interactions are the showcase.

Built with **Astro** (static output) and vanilla JavaScript, **GSAP** (ScrollTrigger, ScrambleText, Draggable, Inertia), **Lenis** for smooth scrolling, **SplitType**, **OGL** for the one WebGL moment in Labs, and **Matter.js** for the skills playground.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview  # serve the build
```

Requires Node 22.12+.

## The loading screen

The loader changes with the number of visits (stored in `localStorage` under `mm-portfolio:visits`):

| Visit | Loader |
| --- | --- |
| 1 | The dramatic: fake boot log, orbiting shapes, giant percentage, an Enter button that swallows the screen |
| 2 | The self-aware: three lines of copy and a modest progress bar |
| 3 | The real: `Loading...` and a thin bar |
| 4+ | `Loading...` → `You come here often.` |

Preview any of them without touching your count: `/?visit=1`, `/?visit=2`, `/?visit=3`, `/?visit=4`.
The footer also has a **Reset the drama** button. `Esc` skips any loader.

## One idea per section

| Section | Interaction |
| --- | --- |
| Nav | A pill slides to the active section or hovered link; letters roll on hover; tucks away on scroll down; circular reveal menu on mobile |
| Hero | Variable-weight letters swell and turn blue near the cursor (a wave runs through them on touch); the name drifts apart as About slides over it like a sheet |
| About | Title letters assemble from scattered positions; the paragraph reads itself with the scroll; “Yes, it's possible.” lands like a stamp; the story is a winding route drawn by the scroll; the formula's pieces slide together |
| Work | The page turns sideways; each project's giant number swells and turns blue at the centre, its visual opens like a shutter, a counter keeps score |
| Labs | A WebGL halftone field that bulges and turns blue around the cursor; a scrambling title; specimen cards fly in from three directions and can be dragged around |
| Expertise | A physics playground: skills drop in as pills you can grab, throw and shake; the legend makes pills jump; the title's weight ripples with the scroll |
| Recognition | Fake award certificates dealt off a pinned stack; jury scores fill and a “Not a real award” stamp lands on each; a side ribbon slides in |
| Contact | Blue finally floods the page; “extraordinary” bounces in and keeps breathing; copy-to-clipboard with attitude; a marquee that follows your scroll direction |

`prefers-reduced-motion` turns off smooth scrolling, pinning and scrubbed motion, and uses the short loader.

## Editing content

All copy (projects, labs, skills, awards, links) lives in [`src/data/content.js`](src/data/content.js).
Fields still waiting on real info are marked `TBD` and show as dashed placeholders on the page:

- A one-line category for Chery France and SATEP (currently "Website")
- Direct CodePen / Webflow links for each Labs clonable (they point to the profiles for now)

Stacks and links for Julien Calot, JOHNROOCKS, Le Marché des Argonautes, Chery France and SATEP come from moussamamadou.com. JOHNROOCKS and Florence Jeev show "Launching soon" (`link: 'soon'`).

Project visuals are CSS placeholder compositions (`.art--*` in `src/styles/global.css`); swap them for real images inside `.project__visual`.
