# `projects` feature

Scaffolded 2026-09-11. Project showcase: a list page and a detail page per project.

## Directory split: `features/` vs `app/`

```
src/features/projects/     ← the feature: data, types, components (no routing)
src/app/projects/          ← the routes: just wires the feature into URLs
```

This is the core idea behind "feature-driven architecture." In a typical small Next.js
app, everything lives in `app/`. In an enterprise codebase, `app/` stays thin —
routing and page-level composition only — while the actual logic, data, and UI live in
`features/`, isolated per domain. This is what lets multiple teams work in parallel
without stepping on each other. The `visuals` feature follows the same split
(`app/page.tsx` is ~20 lines; the real work is in `features/visuals`).

## Files

```
src/features/projects/
  types.ts                     — Project interface
  data/projects.ts             — local project data (see "Data source" below)
  components/
    ProjectCard.tsx            — one card, links to the detail page
    ProjectGrid.tsx            — maps data -> ProjectCard
    ProjectDetail.tsx          — full detail view for one project

src/app/projects/
  page.tsx                     — /projects — renders <ProjectGrid />
  [slug]/page.tsx              — /projects/[slug] — renders <ProjectDetail />
```

### `types.ts`

```ts
export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  year: number;
  links?: { repo?: string; demo?: string };
}
```

Deliberately minimal — just what the current UI needs. No speculative fields
(`featured`, `status`, `category`, ...) until a real requirement demands them.

### `data/content/*.json` + `data/projects.ts` — data source decision

**Resolved 2026-09-11.** Rather than pay for a database right now, data is a small
content directory (`data/content/*.json`, one file per project) read with genuinely
async I/O (`node:fs/promises`), so the code path is real `async`/`await`, not a
synchronous array. This costs $0 and means swapping in a real DB later is a one-line
change inside `getProjects`/`getProject` — every caller already awaits them.

```ts
export async function getProjects(): Promise<Project[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('projects');

  const files = await readdir(CONTENT_DIR);
  const projects = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (file) => {
        const raw = await readFile(path.join(CONTENT_DIR, file), 'utf-8');
        return JSON.parse(raw) as Project;
      })
  );
  return projects.sort((a, b) => b.year - a.year);
}
```

Why `'use cache'` here specifically: per
`node_modules/next/dist/docs/.../08-caching.md` ("Predictable values"), an async file
read is only treated as _predictable_ (auto-prerendered, no directive needed) when it
happens at **module scope**, before any component runs. Here the read happens **inside**
the function, evaluated during rendering — Next treats that as "uncached data" that must
be wrapped in either `use cache` or `<Suspense>`. `use cache` was the right choice
because this data doesn't depend on the request (no `cookies()`/`params` inside it), so
there's nothing to stream — it can join the static shell instead.

- `cacheLife('hours')` — revalidate every hour, expire after a day. Confirmed in the
  `next build` output, which now prints `Revalidate`/`Expire` columns (`1h` / `1d`) per
  route.
- `cacheTag('projects')` / `cacheTag('projects', 'project-${slug}')` — not wired to
  anything yet (no mutation path exists), but sets up on-demand invalidation
  (`revalidateTag`/`updateTag`) for whenever a "write" path (an admin form, a CMS
  webhook) is added.
- Enabling this required flipping `cacheComponents: true` in `next.config.ts` — a
  **global** config change, not scoped to this feature. It affects how every route in
  the app is allowed to mix static/cached/dynamic content going forward.

**Still local, still free** — this isn't a database, and doesn't need to become one
unless real content-editing workflows (an admin UI, a CMS) show up later.

### Components — why 3 files instead of 1

`ProjectCard` (one item) → `ProjectGrid` (the list) → `ProjectDetail` (the full page).
None of them have `'use client'` — they're React Server Components by default, meaning
they render to HTML on the server/at build time with **zero JS shipped** for them. Only
`InteractiveHero` / `StarfieldCanvas` (in `features/visuals`) need `'use client'`,
because they need Three.js and browser APIs.

### `app/projects/[slug]/page.tsx` — the dynamic route

```ts
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
```

Tells Next.js, at build time: "here are all the valid slugs — pre-render an HTML file
for each one." Confirmed by the `next build` output:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /projects
└   /projects/[slug]
  ├ ● /projects/interactive-portfolio-engine
  ├ ● /projects/project-two
  └ ● /projects/project-three

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

`●` (SSG) means these are static HTML files, indistinguishable from a static site at
request time — no server computation per visit. If a slug isn't in that list,
`notFound()` triggers Next's 404 page.

`PageProps<'/projects/[slug]'>` is Next 16's generated type helper (see
`node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
"Route Props Helpers") — it's generated by `next dev`/`next build`/`next typegen`, which
is why a build was required before this would typecheck.

## Verified so far

- `npm run lint` — clean
- `npm run build` — clean; build output confirms the Cache Components behavior:

  ```
  Route (app)                                   Revalidate  Expire
  ┌ ○ /
  ├ ○ /_not-found
  ├ ○ /projects                                         1h      1d
  └   /projects/[slug]
    ├ ◐ /projects/[slug]
    ├ ○ /projects/interactive-portfolio-engine          1h      1d
    ├ ○ /projects/project-three                         1h      1d
    └ ○ /projects/project-two                           1h      1d

  ○  (Static)             prerendered as static content
  ◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
  ```

- Manual browser walkthrough (`next dev`), 2026-09-11:
  - **View Page Source** on `/projects` showed real project summaries (e.g. "TODO:
    Second Project") in the raw server-sent HTML — confirms the `use cache`-wrapped
    `getProjects()` output is in the static shell, not filled in by client JS.
  - `http://localhost:3000/projects/does-not-exist` rendered Next's built-in 404 page —
    confirms `notFound()` fires when `getProject(slug)` returns `undefined` for a slug
    outside `generateStaticParams`.
  - Clicking a project card in DevTools' Network tab showed a small request with `_rsc`
    in its query string, not a full document reload — confirms `<Link>` does a
    client-side RSC transition instead of a full page navigation.

## Troubleshooting notes

### Stale `next/image` output after replacing a file at the same path (2026-09-11)

Symptom: swapped `public/projects/mrface/1.png` for a new file (same filename), but the
`<Image>`-rendered thumbnail on `/projects` kept showing the old picture — in Chrome,
even after hard refresh, DevTools "Disable cache", and a fresh Incognito window. Safari
showed the correct new image the whole time.

Root cause: not browser caching at all (despite how it looked) — Turbopack's persistent
dev cache (`.next/cache/turbopack`, a ~100MB on-disk LRU store that's explicitly
designed to **survive server restarts**) had a stale cached entry for whatever image
width Chrome happened to be requesting. A `Ctrl+C` + `npm run dev` restart doesn't clear
it, because clearing it isn't the point of that cache — persisting across restarts is
the point. Safari coincidentally requested a different responsive width than Chrome,
one that hadn't been cached before the file swap, which is why it looked "browser
specific" for a while.

Fix: stop the dev server, `rm -rf .next`, restart. This wipes every on-disk Next.js
cache (Turbopack's cache included) and forces a full rebuild — slower first load, but
guaranteed to have nothing stale left.

**General lesson**, not specific to this bug: overwriting a static asset at the same
path is fragile — nothing about the URL changes when the content does, so every caching
layer between the file and the browser (this project's dev cache, a browser, a CDN in
production) has to actively notice the change instead of getting it for free. The
robust fix is content-hashed filenames (`1.a3f9c2.png`) so a changed file is
automatically a new URL. Not worth doing for a handful of hand-managed project
screenshots right now, but relevant if this ever becomes a real asset pipeline.

### Eager-loading the wrong card (2026-09-11)

After fixing the stale-cache issue above, the LCP warning was still firing. Actual bug,
not caching: `getProjects()` sorts by year descending, so "Interactive Portfolio
Engine" (2026, no `images` set) sorts before MRFACE (2025, has `images`). The original
fix in `ProjectGrid.tsx` set `eager={index === 0}` — array position zero — but position
zero has no cover image to render at all, so marking it eager did nothing. MRFACE, the
actual first card with a real `<Image>` and the true LCP candidate, sat at index 1 and
stayed lazy.

Fix: eager-load the first project whose `images?.[0]` exists, not whichever project
happens to be first in the sorted array:

```ts
const firstCoverSlug = projects.find((project) => project.images?.[0])?.slug;
// ...
eager={project.slug === firstCoverSlug}
```

**Lesson:** "first item in the array" and "first rendered element of a given type"
silently diverge the moment any item in the list can be missing that element. Index-based
eager/priority-loading logic needs to account for that, not just assume position 0.

## TODO

- Replace `project-three` placeholder JSON file in `data/content/` with a real project
  write-up.
- Wire up `revalidateTag`/`updateTag` once there's an actual write path (e.g. an admin
  form) that changes project content.
