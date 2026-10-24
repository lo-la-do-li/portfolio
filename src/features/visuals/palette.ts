import type { Theme } from '@/features/theme/constants';

// WebGL can't read CSS classes, so the particles need raw color values.
// KEEP IN SYNC with the palette layer in src/app/globals.css (@theme).
// Ten values don't justify a token build step; a shared generated source
// (e.g. Style Dictionary) would be the next move if this grows.
const umbrellas = {
  signal: '#b4010c',
  rose: '#e15d66',
  marigold: '#fdbc00',
  tangerine: '#e45709',
  cobalt: '#3c66ba',
  sage: '#818a67',
  plum: '#823b5b',
  butter: '#fee191',
} as const;

/** Particle colors per theme. Butter disappears on paper, so day mode drops it. */
export const particleColors: Record<Theme, readonly string[]> = {
  dark: Object.values(umbrellas),
  light: Object.values(umbrellas).filter((color) => color !== umbrellas.butter),
};

/**
 * Rain: one main color plus a single accent, per theme (the restrained look
 * from the moodboard: mostly ink/paper, about one drop in ten in the accent).
 */
export const rainColors: Record<Theme, { main: string; accent: string }> = {
  dark: { main: '#fbfaf6', accent: umbrellas.marigold }, // paper + marigold on ink
  light: { main: '#140b0c', accent: umbrellas.signal }, // ink + signal red on paper
};
