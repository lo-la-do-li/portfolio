# `og` feature

Share cards: the image LinkedIn, Slack, iMessage and others show when a link to the site
is pasted. OG is the [Open Graph](https://ogp.me) protocol, the `<meta property="og:…">`
tags those apps read.

## What's generated

| Route                                         | Card                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/app/opengraph-image.tsx`                 | Site card: boxed wordmark, role, headline. The default for every route without its own |
| `src/app/projects/[slug]/opengraph-image.tsx` | One per project: title, summary, first four tags, year                                 |

Both are drawn with `ImageResponse` from `next/og` and **rendered at build time**, like
static files, so they cost nothing per request. Next writes the `og:image` tags (with
width, height, type and alt) and the `twitter:card` tags; `og:title` and
`og:description` come from each page's own `title` and `description`, so the layout
sets no `openGraph` object (a page that set one would replace it wholesale, not merge).

Project cards use `generateImageMetadata` only to give each card its own alt text, so
their URL ends in `/opengraph-image/card`.

`src/features/og/` holds what the two share: `theme.ts` (colors, size, fonts) and
`OgFrame` (the double-rule poster frame with the umbrella stripe).

## Satori, not a browser

`ImageResponse` uses Satori to turn JSX into an SVG, then a PNG. It looks like React,
but:

- **Inline styles only.** No Tailwind, no CSS variables: `theme.ts` mirrors the Night
  theme from `globals.css` by hex value. Change the palette there too.
- **Flexbox only.** Every element with more than one child needs `display: flex`; no
  grid.
- **Flex children shrink instead of overflowing**, so too much text is drawn on top of
  its neighbours. Children of the project card set `flexShrink: 0`; the summary is
  clamped to two lines and the tags keep to one row.
- **`lineClamp` needs `display: block`** on the clamped element.
- **Fonts must be TTF, OTF or WOFF**, not the woff2 `next/font` serves, so the TTFs
  live in `src/features/og/fonts/` (all OFL). Satori's whole bundle must stay under
  500 KB; the fonts are about 250 KB.
- **Body text is Jost, not Geist.** Satori leaves an extra-wide space after some Geist
  words (after "performance" in "high-performance web"), with Google's file and with
  the copy bundled in `next/og` alike. Jost spaces evenly.

To iterate on a card: `npm run build && npm start`, then open
`/opengraph-image` or `/projects/<slug>/opengraph-image/card`.

## Tests

`e2e/og.spec.ts`, for `/`, `/projects` and every project in the content folder: the
`og:title` matches the page title, there's alt text, project pages point at their own
card, and the image is a real 1200×630 PNG (read from the PNG header).
