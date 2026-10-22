export type Theme = 'dark' | 'light';

// Shared by the pre-paint script and ThemeToggle so the two can't drift apart.
export const THEME_STORAGE_KEY = 'theme';

/** What the server renders and what first-time visitors see. */
export const DEFAULT_THEME: Theme = 'dark';
