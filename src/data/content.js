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
  codepen: 'https://codepen.io/moussamamadou',
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'labs', label: 'Labs' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'contact', label: 'Contact' },
];

const TBD = 'TBD';

// Project images are copies of the screenshots on moussamamadou.com, kept in
// public/projects/ so covers survive that site redeploying.
const IMG = '/projects';

export const projects = [
  {
    num: '01',
    title: 'Julien Calot',
    image: `${IMG}/juliencalot.webp`,
    kind: 'Artiste Peintre',
    description: null,
    role: 'Developer',
    stack: ['Webflow', 'GSAP', 'PixiJS'],
    link: 'https://www.juliencalot.com/',
    art: 'paint',
  },
  {
    num: '02',
    title: 'JOHNROOCKS',
    image: `${IMG}/johnroocks.webp`,
    kind: 'Photographer',
    description: null,
    role: 'Developer',
    stack: ['Nuxt', 'GSAP', 'Three.js', 'Prismic'],
    link: 'soon',
    art: 'lens',
  },
  {
    num: '03',
    title: 'Le Marché des Argonautes',
    image: `${IMG}/marcheargonautes.webp`,
    kind: 'Landing Page',
    description: null,
    role: 'Developer',
    stack: ['Webflow', 'GSAP'],
    link: 'https://www.marche-argonautes.fr/',
    art: 'market',
  },
  {
    num: '04',
    title: 'Florence Jeev',
    image: `${IMG}/florence.webp`,
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
    image: `${IMG}/historyofgraphicdesign.webp`,
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
    image: `${IMG}/cheryfrance.webp`,
    kind: 'Website',
    description: null,
    role: 'Developer',
    stack: ['Nuxt', 'GSAP', 'Tailwind', 'Sanity'],
    link: 'https://www.cheryfrance.com/',
    art: 'drive',
  },
  {
    num: '07',
    title: 'SATEP',
    image: `${IMG}/satep.webp`,
    kind: 'Website',
    description: null,
    role: 'Developer',
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
  },
  {
    num: '02',
    title: 'Smooth Scroll Experience',
    tools: ['GSAP Core', 'GSAP ScrollTrigger', 'GSAP MotionPath'],
    codepen: null,
  },
  {
    num: '03',
    title: 'Experimental Interaction',
    tools: ['GSAP Core', 'GSAP Observer', 'WebGL'],
    codepen: null,
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
