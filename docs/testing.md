# Testing

Two separate runners, split by how much of the app a test needs:

- **Vitest + React Testing Library** — one function or component, in Node with jsdom.
  Milliseconds per test.
- **Playwright** — the whole app in real browsers (Chromium and WebKit) against a
  production build. About a second per test.

They never run together: each has its own config, its own files and its own command.

## Where the tests live

```
vitest.config.mts             Vitest config
vitest.setup.ts               runs before every unit test file
playwright.config.ts          Playwright config
e2e/                          Playwright: whole-app tests
  gallery.spec.ts
  theme.spec.ts
  not-found.spec.ts
  redirects.spec.ts
  og.spec.ts
  a11y.spec.ts
src/**/*.test.ts(x)           Vitest: next to the code each one covers
```

Vitest only picks up `src/**/*.test.{ts,tsx}` (`include`); Playwright only looks in `e2e/`
(`testDir`). Different suffixes and folders keep either runner from picking up the
other's files.

Unit tests sit beside their code to match the feature-folder architecture (route files
like `app/error.tsx` included): moving or deleting `features/theme` takes its tests with
it, and it's obvious what has coverage.
End-to-end tests cover several features at once, so they get their own folder.

## Which runner for which test

|          | Vitest + React Testing Library               | Playwright                                      |
| -------- | -------------------------------------------- | ----------------------------------------------- |
| Tests    | One function, hook or component              | The app as a user experiences it                |
| Runs in  | Node + **jsdom** (a DOM written in JS)       | **Real browsers**: Chromium, WebKit             |
| App      | Only the imported module; no Next, no server | A production build on port 3100                 |
| Can't do | Layout, CSS, scrolling, what's on top        | Reach inside one function cheaply               |
| Command  | `npm test` · `npm run test:watch`            | `npm run test:e2e` · `npx playwright test --ui` |

Rule of thumb: if the logic can be checked without rendering a page, it's a unit test;
if the bug would only show in a real browser, it's an end-to-end test.

jsdom has no layout engine, so it could never have caught the gallery bug (the image
painted over the arrows on phones). A browser is overkill for `formatMonth('2024-04')`,
and a unit test can force edge cases (a US timezone) that are awkward in a browser.

## Unit tests (`npm test`)

1. `vitest.config.mts` sets the jsdom environment, the `@/` path aliases, and the worker
   environment (below).
2. `vitest.setup.ts` adds DOM matchers (`toHaveAttribute`, `toBeInTheDocument`) and
   unmounts components after each test.
3. Each test imports only what it covers. Component tests query the way a user or
   screen reader finds things (`getByRole('button', { name: 'Day', pressed: true })`)
   and interact through `user-event`.

| File                   | Guards                                                                          |
| ---------------------- | ------------------------------------------------------------------------------- |
| `formatMonth.test.ts`  | The UTC pin: runs in `America/Denver`, where `'2024-04'` would print `Mar 2024` |
| `themeScript.test.ts`  | Saved theme applied; tampered value ignored; storage that throws                |
| `ThemeToggle.test.tsx` | Default Night; clicking Day updates `<html>`, `aria-pressed`, storage           |
| `error.test.tsx`       | Error page heading, the digest shown only when present, Try again calls `retry` |

Worker environment:

- `TZ=America/Denver` for every test, so date bugs show up.
- Node 22+ ships a global `localStorage` that shadows jsdom's and is unusable without a
  backing file. Workers get `--no-experimental-webstorage`, but only on Node versions
  that have the flag (Node 20, used in CI, would refuse to start with it).

## End-to-end tests (`npm run test:e2e`)

1. `webServer` builds the site and serves it on **port 3100**: a production build, as the
   Next.js docs recommend (`next dev` behaves differently and blocks its assets for any
   host but localhost). Port 3100 so a running `next dev` on 3000 isn't mistaken for it.
   Locally an existing server on 3100 is reused; in CI the build is an earlier step, so
   it only starts the server.
2. Every spec runs in two projects: **desktop** (Desktop Chrome) and **mobile** (iPhone 13
   in WebKit, Safari's engine, where the gallery bug lived).
3. Each test drives a real page:

| Spec                | Checks                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `gallery.spec.ts`   | Arrows are tappable (the regression), swipe track, page scroll lock, Close / backdrop / Escape, focus returns to the thumbnail |
| `theme.spec.ts`     | Night by default; Day survives a reload **with the app's JS blocked**, proving the pre-paint script (not React) applies it     |
| `not-found.spec.ts` | Unknown URLs and unknown project slugs return a real 404 status, the 404 page and a link home                                  |
| `redirects.spec.ts` | Each short URL's status (307 or 308) and `Location`; `/resume` ends at a PDF                                                   |
| `og.spec.ts`        | Share card tags on `/`, `/projects` and every project; each image is a 1200×630 PNG                                            |
| `a11y.spec.ts`      | axe WCAG 2.2 A/AA scan of `/`, `/projects`, a project page and the 404 page, in both themes                                    |

Notes:

- The gallery regression relies on Playwright's actionability checks: `click()` refuses
  when another element would receive the click, so an image painted over an arrow fails
  the test.
- Playwright can't synthesise a touch swipe in WebKit, so the swipe test scrolls the
  track by one slide, which is what a swipe does.
- The a11y scan emulates reduced motion so contrast is checked on the settled page, not
  mid-fade.
- Keyboard navigation is skipped on the mobile project.
- The redirect tests use Playwright's `request` fixture with `maxRedirects: 0`: no
  browser, just HTTP, so they can check the redirect itself rather than where it ends up.

## CI

`.github/workflows/ci.yml`, in order; the first failure stops the run:

```
lint → format check → unit tests → build → install browsers → e2e + a11y → upload report
```

Unit tests run before the build: they need no build, so a broken function fails the run
in seconds. Playwright runs after it and reuses it. On failure, download the
**playwright-report** artifact from the run: it holds the trace, a step-by-step replay of
what the browser did.

## Checking that a test can fail

A test that can't fail proves nothing. When adding a guard, reintroduce the bug it
guards against, confirm the test fails for the right reason, then restore:

- Removing `timeZone: 'UTC'` from `formatMonth` fails both of its tests.
- Dropping the theme script's `light` / `dark` whitelist fails the tampered-value test.
- Layering the gallery track over the Next arrow on mobile fails the arrows test.
- Disconnecting the error page's Try again button from `retry` fails its retry test.
- Removing the project card route fails the project share card tests (they fall back
  to the site card).
