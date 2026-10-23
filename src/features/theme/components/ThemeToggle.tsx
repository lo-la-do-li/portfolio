'use client';

import { THEME_STORAGE_KEY, type Theme } from '../constants';
import { useTheme } from '../useTheme';

function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the theme still applies for this page view.
  }
}

const base =
  'px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
// Pressed styling comes from CSS (the `light:` variant), not React state, so
// it's correct on the very first paint — before React has hydrated.
const selected = 'bg-fg text-bg';
const unselected = 'text-muted hover:text-fg';

export default function ThemeToggle() {
  const theme = useTheme();

  return (
    <div role="group" aria-label="Color theme" className="flex border border-rule">
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        className={`${base} ${selected} light:bg-transparent light:text-muted light:hover:text-fg`}
      >
        Night
      </button>
      <button
        type="button"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
        className={`${base} ${unselected} light:bg-fg light:text-bg light:hover:text-bg`}
      >
        Day
      </button>
    </div>
  );
}
