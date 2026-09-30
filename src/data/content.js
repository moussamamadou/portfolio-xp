// All copy lives here so it can be edited without touching the layout.
// Anything marked `placeholder: true` (or TBD) is waiting for real info.

export const person = {
  name: 'Moussa Mamadou',
  role: 'Creative Developer — Independent',
  location: 'Based somewhere on Earth',
  email: 'moussa.mamadou@outlook.com',
  linkedin: 'https://www.linkedin.com/in/moussa-mamadou',
  linkedinLabel: 'linkedin.com/in/moussa-mamadou',
  website: 'https://moussamamadou.com/',
  webflow: 'https://webflow.com/@moussamamadou',
  codepen: 'https://codepen.io/moussamamadou',
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'labs', label: 'Labs' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'contact', label: 'Contact' },
];

const TBD = 'TBD';

export const projects = [
  {
    num: '01',
    title: 'Julien Calot',
    kind: 'Artiste Peintre',
    description: null,
    role: TBD,
    stack: ['Webflow', 'GSAP', 'PixiJS'],
    link: 'https://www.juliencalot.com/',
    art: 'paint',
  },
  {
    num: '02',
    title: 'JOHNROOCKS',
    kind: 'Photographer',
    description: null,
    role: TBD,
    stack: ['Nuxt', 'GSAP', 'Three.js', 'Prismic'],
    link: 'soon',
    art: 'lens',
  },
  {
    num: '03',
    title: 'Le Marché des Argonautes',
    kind: 'Landing Page',
    description: null,
    role: TBD,
    stack: ['Webflow', 'GSAP'],
    link: 'https://www.marche-argonautes.fr/',
    art: 'market',
  },
  {
    num: '04',
    title: 'Florence Jeev',
    kind: 'Designer Portfolio',
    description:
      'Florence is a creative director who needed a new portfolio. The objective was to create subtle animations that matched her personality and visual style.',
    role: 'Developer',
    stack: ['GSAP', 'Lenis', 'SplitType', 'Webflow'],
    link: 'soon',
    art: 'soft',
  },
  {
    num: '05',
    title: 'History of Graphic Design',
    kind: 'Interactive Experience',
    description:
      'An interactive deep dive into the evolution of graphic design, exploring its history through an interactive experience.',
    role: 'Developer',
    stack: ['Vanilla JavaScript', 'WebGL', 'Astro.js'],
    link: 'https://www.historyofgraphicdesign.com/',
    art: 'swiss',
  },
  {
    num: '06',
    title: 'Chery France',
    kind: 'Website',
    description: null,
    role: TBD,
    stack: ['Nuxt', 'GSAP', 'Tailwind', 'Sanity'],
    link: 'https://www.cheryfrance.com/',
    art: 'drive',
  },
  {
    num: '07',
    title: 'SATEP',
    kind: 'Website',
    description: null,
    role: TBD,
    stack: ['Webflow', 'GSAP', 'D3.js', 'Swup'],
    link: 'https://www.satep.fr/',
    art: 'data',
  },
];

export const labs = [
  {
    num: '01',
    title: 'Smooth Scroll Experience',
    tools: ['GSAP Core', 'GSAP ScrollTrigger'],
    codepen: null,
    webflow: null,
  },
  {
    num: '02',
    title: 'Smooth Scroll Experience',
    tools: ['GSAP Core', 'GSAP ScrollTrigger', 'GSAP MotionPath'],
    codepen: null,
    webflow: null,
  },
  {
    num: '03',
    title: 'Experimental Interaction',
    tools: ['GSAP Core', 'GSAP Observer', 'WebGL'],
    codepen: null,
    webflow: null,
  },
];

export const skillGroups = [
  {
    id: 'fancy',
    title: 'The Fancy Stuff',
    items: [
      { name: 'GSAP', note: 'my beloved' },
      { name: 'Three.js', note: 'for showing off' },
      { name: 'OGL', note: 'because why not?' },
      { name: 'WebGL', note: "when I'm feeling dangerous" },
    ],
  },
  {
    id: 'bread',
    title: 'The Bread & Butter',
    items: [
      { name: 'JavaScript', note: 'we have a love-hate relationship' },
      { name: 'Astro.js', note: 'my current crush' },
      { name: 'Vue.js', note: 'the mandatory stuff' },
      { name: 'React.js', note: 'the mandatory stuff' },
      { name: 'Next.js', note: 'the mandatory stuff' },
    ],
  },
  {
    id: 'nocode',
    title: 'The "No Code" That Actually Needs Code',
    items: [{ name: 'Webflow', note: "and yes, I'll customize it" }],
  },
];

export const awards = [
  {
    body: 'The Awwwkwards',
    badge: 'SOTD',
    badgeLabel: 'Site of the Daydream',
    title: 'Best Imaginary Portfolio Design',
    year: '2023',
    scores: [
      ['Design', 9.2],
      ['Usability', 8.4],
      ['Creativity', 9.7],
      ['Realness', 0.3],
    ],
    jury: 'Jury: my mom, my cat, one very supportive rubber duck',
  },
  {
    body: 'FWA',
    bodyLong: 'Friends Who Approve',
    badge: 'FWA',
    badgeLabel: 'Of the Day (allegedly)',
    title: 'Most Fun Developer to Work With',
    year: '2024',
    scores: [
      ['Vibes', 9.9],
      ['Puns', 7.1],
      ['Deadlines', 8.8],
      ['Humility', 2.0],
    ],
    jury: 'Jury: every designer I said "yes, it\'s possible" to',
  },
  {
    body: 'CSS Dream Awards',
    badge: 'WOTD',
    badgeLabel: 'Wish Of The Day',
    title: 'Future Awwwards Winner',
    year: 'Manifesting it for 2025',
    scores: [
      ['Ambition', 10],
      ['Patience', 4.2],
      ['Manifesting', 9.6],
      ['Trophies', 0],
    ],
    jury: 'Jury: the universe (response pending)',
  },
];
