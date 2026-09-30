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

## Art direction

Editorial and monochrome, set entirely in uppercase: a 12-column grid (4 on mobile), one typeface (Figtree), small text sitting in grid cells, huge display type fitted edge to edge, hairline rules instead of cards and shadows. Black and white only, no colour. Copy is kept short. Press `G` anywhere to see the grid.

## The loading screen

One quiet layout for every visit: the name, a line of copy, a hairline and an odometer counting to 100. The visit count (stored in `localStorage` under `mm-portfolio:visits`) changes how long it takes and what it says:

| Visit | Loader |
| --- | --- |
| 1 | Four short lines ("Loading a portfolio." … "Please act impressed.") over a counter that jumps unevenly, about two seconds |
| 2 | "Oh, you're back." / "Shorter version then." |
| 3 | "Loading. For real this time." |
| 4+ | "You come here often." and straight in |

Preview any of them without touching your count: `/?visit=1`, `/?visit=2`, `/?visit=3`, `/?visit=4`.
The footer also has a **Reset the drama** button. `Esc` or **Skip** ends any loader.

## One idea per section

| Section | Interaction |
| --- | --- |
| Nav | Small editorial bar; links shuffle their letters on hover; a small square marks the section you're in; the name folds to its initials after the hero; the mobile menu wipes down with rising links |
| Hero | The name is fitted edge to edge; a square black lens follows the cursor and magnifies the letters under it in negative (it wanders on its own on touch); scrolling slides the two lines up into their masks |
| About | One calm motion throughout: big lines rise out of their masks, the intro fills from grey to ink as you read, and each story row draws its rule before its text rises |
| Work | A window in the heading grows on scroll until it pushes the words off screen, flicking through the projects; then an index where the centred row is in focus and hovering brings up a cover that trails and leans with the cursor |
| Labs | A WebGL field of square dots that swell near the cursor; “Labs” scans in letter by letter; spec sheets print out and can be thrown around the table |
| Expertise | A physics playground on graph paper: skills drop in as tags you can grab, throw and shake; the legend makes tags jump |
| Recognition | Fake certificates on a pinned pile, wiped away one by one; jury scores count in and a “Not a real award” stamp lands on each |
| Contact | Twelve black columns drop in and flood the page; fitted headline lines rise; copy-to-clipboard with attitude; a marquee that follows your scroll direction |

Some of the motion borrows from Codrops experiments (mouse-following lens, on-scroll expanding image, clip-path menus), remixed for this layout.

`prefers-reduced-motion` turns off smooth scrolling, pinning and scrubbed motion, and uses the short loader.

## Editing content

All copy (projects, labs, skills, awards, links) lives in [`src/data/content.js`](src/data/content.js). Still waiting on real info:

- A one-line category for Chery France and SATEP (currently "Website")
- Direct CodePen / Webflow links for each Labs clonable (they point to the profiles for now)

Stacks and links for Julien Calot, JOHNROOCKS, Le Marché des Argonautes, Chery France and SATEP come from moussamamadou.com. JOHNROOCKS and Florence Jeev show "Launching soon" (`link: 'soon'`).

Project covers are typographic CSS placeholders (`.cover--*` in `src/styles/global.css`, rendered by `src/components/Cover.astro`); swap them for real images there.
