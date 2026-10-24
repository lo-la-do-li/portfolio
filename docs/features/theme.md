# `theme` feature

Night (ink, default) and Day (paper) themes, switched with a toggle in the header, with
no flash of the wrong theme on load.

## How the theme is applied

Colors are design tokens in `src/app/globals.css`, in two layers:

1. **Palette** (`@theme`): raw colors sampled from the 1926 _Summer Sales_ poster —
   `ink`, `paper`, `signal`, `marigold`, … Never change between themes.
2. **Semantic** (`--bg`, `--fg`, `--muted`, `--rule`, `--rule-soft`, `--accent`,
   `--surface`): dark values on `:root`, light values under `[data-theme='light']`,
   exposed to Tailwind through `@theme inline` (`bg-bg`, `text-fg`, …).

Components only use the semantic utilities, so switching theme is one attribute on
`<html>` and no component needs `dark:` variants. A `light:` custom variant exists for
the rare style that must differ by theme without a token (the toggle's pressed state).

## Avoiding the flash

The server can't read `localStorage`, so it always renders `data-theme="dark"`. A
returning Day visitor needs the attribute changed **before the first paint**:

- `themeScript.ts` — a tiny inline script the root layout puts in `<head>`. Inline scripts
  run synchronously while the HTML is parsed, so the saved theme is applied before
  anything is drawn. It only accepts `'light' | 'dark'` and wraps storage access in
  try/catch (some private modes throw).
- `<html suppressHydrationWarning>` — the script may change `data-theme` before React
  hydrates; this tells React to keep the DOM's value for that element's attributes.
- `localStorage`, not a cookie — reading a cookie on the server would make every page
  dynamic and lose static prerendering.

See `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`.

## Reading the theme in React

`useTheme.ts` reads `<html data-theme>` with `useSyncExternalStore`: during hydration it
uses the server snapshot (`'dark'`, matching the HTML, so no hydration error), then
re-renders with the real value. A `MutationObserver` on the attribute keeps subscribers
(the toggle, the starfield's colors) in sync.

`ThemeToggle.tsx` styles its pressed state with CSS (`light:` variant), not React state,
so it's correct on the very first paint; `aria-pressed` comes from `useTheme`.

## Files

- `constants.ts` — `Theme` type, storage key, `DEFAULT_THEME`
- `themeScript.ts` — the pre-paint script (built from the shared storage key)
- `useTheme.ts` — the hook above
- `components/ThemeToggle.tsx` — the Night / Day switch in the header
