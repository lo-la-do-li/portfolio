import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Open Graph images are drawn by Satori, not a browser: no Tailwind, no CSS
// variables, only inline styles. These mirror the Night theme in globals.css.
export const colors = {
  bg: '#140b0c', // ink
  fg: '#fbfaf6', // paper
  muted: '#a89f97',
  ruleSoft: 'rgba(251, 250, 246, 0.15)',
  accent: '#fdbc00', // marigold
};

// The umbrella colors from the poster, warm to cool
export const stripe = [
  '#fdbc00', // marigold
  '#e45709', // tangerine
  '#e15d66', // rose
  '#b4010c', // signal
  '#823b5b', // plum
  '#3c66ba', // cobalt
  '#818a67', // sage
];

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori can't read the woff2 files next/font serves, so the same families are
// kept here as TTF (all OFL). Read once at module scope: they never change.
// Body text is Jost, not the site's Geist: Satori puts uneven gaps between
// some Geist words ("performance  web"), whichever Geist file it's given.
const FONT_DIR = path.join(process.cwd(), 'src/features/og/fonts');
const font = (file: string) => readFile(path.join(FONT_DIR, file));

const [jost, jostMedium, jostSemiBold, geistMono] = await Promise.all([
  font('Jost-Regular.ttf'),
  font('Jost-Medium.ttf'),
  font('Jost-SemiBold.ttf'),
  font('GeistMono-Regular.ttf'),
]);

export const fonts = [
  { name: 'Jost', data: jost, weight: 400 as const, style: 'normal' as const },
  { name: 'Jost', data: jostMedium, weight: 500 as const, style: 'normal' as const },
  { name: 'Jost', data: jostSemiBold, weight: 600 as const, style: 'normal' as const },
  { name: 'Geist Mono', data: geistMono, weight: 400 as const, style: 'normal' as const },
];
