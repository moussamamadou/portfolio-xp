// All copy lives here so it can be edited without touching the layout.

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
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'contact', label: 'Contact' },
];

// The unconventional route, in five stops.
export const route = [
  { tag: 'Start', title: 'Software engineering' },
  { tag: 'Detour', title: 'The banking world' },
  { tag: 'Escape', title: 'Design, motion & 3D' },
  { tag: 'Return', title: 'Front-end developer' },
  { tag: 'Now', title: 'Creative development' },
];

export const formula = ['Technology', 'Design', 'Motion', 'Experimentation'];

// Project images are copies of the screenshots on moussamamadou.com, kept in
// public/projects/ so covers survive that site redeploying.
const IMG = '/projects';

export const projects = [
  {
    num: '01',
    title: 'Julien Calot',
    image: `${IMG}/juliencalot.webp`,
    ratio: '720 / 407',
    kind: 'Artiste Peintre',
    description: 'Website for the painter Julien Calot. Webflow, with GSAP motion and PixiJS image effects.',
    role: 'Developer',
    stack: ['Webflow', 'GSAP', 'PixiJS'],
    link: 'https://www.juliencalot.com/',
  },
  {
    num: '02',
    title: 'JOHNROOCKS',
    image: `${IMG}/johnroocks.webp`,
    ratio: '1598 / 927',
    kind: 'Photographer',
    description: 'Portfolio for a photographer. Nuxt and Prismic, with Three.js and GSAP.',
    role: 'Developer',
    stack: ['Nuxt', 'GSAP', 'Three.js', 'Prismic'],
    link: 'soon',
  },
  {
    num: '03',
    title: 'Le Marché des Argonautes',
    image: `${IMG}/marcheargonautes.webp`,
    ratio: '1667 / 938',
    kind: 'Landing Page',
    description: 'Landing page for Le Marché des Argonautes, built in Webflow and animated with GSAP.',
    role: 'Developer',
    stack: ['Webflow', 'GSAP'],
    link: 'https://www.marche-argonautes.fr/',
  },
  {
    num: '04',
    title: 'Florence Jeev',
    image: `${IMG}/florence.webp`,
    ratio: '2865 / 1612',
    kind: 'Designer Portfolio',
    description:
      'Portfolio for a creative director, with subtle animations that match her personality and visual style.',
    role: 'Developer',
    stack: ['GSAP', 'Lenis', 'SplitType', 'Webflow'],
    link: 'soon',
  },
  {
    num: '05',
    title: 'History of Graphic Design',
    image: `${IMG}/historyofgraphicdesign.webp`,
    ratio: '570 / 321',
    kind: 'Interactive Experience',
    description:
      'An interactive deep dive into the evolution of graphic design.',
    role: 'Developer',
    stack: ['Vanilla JavaScript', 'WebGL', 'Astro.js'],
    link: 'https://www.historyofgraphicdesign.com/',
  },
  {
    num: '06',
    title: 'Chery France',
    image: `${IMG}/cheryfrance.webp`,
    ratio: '1200 / 630',
    kind: 'Website',
    description: 'The French site for the car brand Chery. Nuxt, Tailwind and Sanity, animated with GSAP.',
    role: 'Developer',
    stack: ['Nuxt', 'GSAP', 'Tailwind', 'Sanity'],
    link: 'https://www.cheryfrance.com/',
  },
  {
    num: '07',
    title: 'SATEP',
    image: `${IMG}/satep.webp`,
    ratio: '1445 / 813',
    kind: 'Website',
    description: 'Website for SATEP. Webflow, with D3.js data visualisation and Swup page transitions.',
    role: 'Developer',
    stack: ['Webflow', 'GSAP', 'D3.js', 'Swup'],
    link: 'https://www.satep.fr/',
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
    title: 'Scroll Along a Path',
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
