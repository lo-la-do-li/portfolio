# loladolinsky.com

The portfolio of Lola Dolinsky, frontend engineer — live at
**[loladolinsky.com](https://loladolinsky.com)**.

It doubles as a working example of how I build on a product team: feature-based
architecture, strict TypeScript, unit and end-to-end tests in CI, accessibility checked
on every pull request, and written-down reasoning for the decisions that matter.

## Stack

- **Next.js 16** (App Router, Cache Components) with **React 19** and **TypeScript**
- **Tailwind CSS 4**, with design tokens and a Night/Day theme
- **React Three Fiber** for the WebGL starfield hero, code-split so it doesn't slow the
  first load
- **Vitest + React Testing Library** for unit tests; **Playwright + axe** for end-to-end
  and accessibility tests on desktop Chrome and iPhone WebKit
- **GitHub Actions** CI, **Husky + lint-staged** pre-commit checks, deployed on **Vercel**

## Structure

Code is grouped by feature, so each one owns its components, data and tests:

```
src/
  app/              routes, layout, sitemap, robots
  components/       shared layout pieces (header, footer, section headings)
  features/
    og/             share cards for links (Open Graph images)
    profile/        about, experience, contact
    projects/       project data, cards, case studies, gallery
    theme/          Night/Day theme without a flash on load
    visuals/        the WebGL hero
  lib/              site-wide helpers
e2e/                Playwright tests
docs/               how and why things are built the way they are
resume/             résumé source, rendered to the PDF the site links to
```

## Running it

Requires Node 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command                | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run build`        | Production build                                                    |
| `npm run lint`         | ESLint (no `any`, Next.js and Core Web Vitals rules)                |
| `npm run format:check` | Prettier check                                                      |
| `npm test`             | Unit tests (`npm run test:watch` while coding)                      |
| `npm run test:e2e`     | Builds, serves on port 3100, runs Playwright + axe                  |
| `npm run resume:pdf`   | Renders `resume/resume.html` to the site's PDF; fails past one page |

The first `test:e2e` run needs browsers: `npx playwright install chromium webkit`.

## Docs

- [Testing](docs/testing.md) — where the tests live, which runner suits which test, CI
- [OG](docs/features/og.md) — share cards generated at build time, and Satori's quirks
- [Projects](docs/features/projects.md) — file-based project data with Cache Components
- [Theme](docs/features/theme.md) — design tokens and a Night/Day theme with no flash
- [Visuals](docs/features/visuals.md) — the code-split WebGL hero and its lifecycle
