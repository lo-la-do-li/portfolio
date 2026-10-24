# `visuals` feature

The WebGL starfield hero on the home page.

## Files

- `components/InteractiveHero.tsx` — client component. Renders the hero copy (passed in
  as `eyebrow`/`title`/`subtitle` props so this feature doesn't import `profile` data — the
  page composes the two) inside the double-rule poster frame, bottom-left aligned, with a
  translucent scrim and thin text-shadow outlines so text stays legible over particles.
  Code-splits the canvas with `next/dynamic` + `ssr: false`, so the Three.js bundle never
  blocks initial load. `MotionConfig reducedMotion="user"` drops the slide-up for users
  who prefer reduced motion.
- `components/StarfieldCanvas.tsx` — the React Three Fiber `<Canvas>` and a rotating
  point cloud (2000 points from `maath/random.inSphere`), colored per point from the
  palette via a vertex-color buffer (built once per theme). Switches `frameloop` from
  `'always'` to `'demand'` when the hero is scrolled out of view (IntersectionObserver)
  or the user prefers reduced motion.
- `palette.ts` — the poster palette as hex values for WebGL, which can't read CSS
  classes. Must be kept in sync with the palette layer in `src/app/globals.css`; day mode
  drops butter, which disappears on paper.
- `hooks/usePrefersReducedMotion.ts` — live `prefers-reduced-motion` via
  `useSyncExternalStore` (server snapshot `false`, corrected after hydration).

## Troubleshooting notes

### Starfield blank after navigating back to the home page (2026-10-10)

Symptom: load `/`, click through to `/projects` (or any other route), then return to
`/` via a header link or the browser back button. The hero was empty — no starfield.
A full page reload brought it back. Only surfaced once the site header existed, since
before that nothing linked back to `/` client-side.

Root cause: an interaction between two behaviors that are each correct on their own.

1. **Next 16 hides pages instead of unmounting them.** With `cacheComponents: true`,
   navigating away wraps the old page in React's `<Activity mode="hidden">` (DOM kept,
   `display: none`) so its state survives a return trip. Up to 3 routes are kept. While
   hidden, React runs every effect **cleanup**; on return it re-runs the effects. See
   `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.
2. **R3F's `<Canvas>` assumes cleanup means "gone forever."** From its source in
   `node_modules/@react-three/fiber`:
   - cleanup calls `unmountComponentAtNode(canvas)`, which after a 500ms `setTimeout`
     calls `gl.forceContextLoss()` and disposes the scene;
   - setup does `if (!root.current) root.current = createRoot(canvas)`.

   Activity preserves refs, so on return `root.current` still exists, `createRoot` is
   skipped, and R3F re-renders into the WebGL context it already destroyed.

How it was confirmed: on `/projects`, the Console logs `THREE.WebGLRenderer: Context
Lost.` about half a second after leaving `/` — the renderer being torn down for a page
that is merely hidden. DevTools Elements still shows the home page's `<main>` in the DOM.

Fix (in `StarfieldCanvas.tsx`): remount the canvas whenever the page becomes visible
again, by changing its React `key` in a layout-effect cleanup — the reset pattern the
Next docs recommend for Activity:

```tsx
const [canvasKey, setCanvasKey] = useState(0);
useLayoutEffect(() => () => setCanvasKey((key) => key + 1), []);
// ...
<Canvas key={canvasKey} camera={{ position: [0, 0, 1] }}>
```

The effect body does nothing; only its cleanup matters, and that runs exactly when
Activity hides the page. A new key makes React discard the old `<Canvas>` (and its dead
root) and mount a fresh one with a new WebGL context. `useLayoutEffect` rather than
`useEffect` so the cleanup runs synchronously as the page is hidden.

Alternatives rejected:

- **Disable `cacheComponents`** — would also remove `use cache` in the `projects`
  feature. Far too big a change for one component.
- **`useRouter().bfcacheId` as a key** — the docs call it a migration tool, and it resets
  the whole page's state rather than just the canvas.
- **Keep the WebGL context alive while hidden** — R3F's own cleanup tears it down
  regardless, and it would hold GPU memory for an invisible page (browsers cap live
  WebGL contexts at roughly 16).

**General lesson:** framework features that change component lifecycle (Activity,
StrictMode's double-mount in dev, Fast Refresh) break third-party libraries that treat
"cleanup ran" as "unmounted for good." When a library holds resources outside React
(WebGL contexts, sockets, map instances), check whether it handles cleanup → re-setup
on the _same_ component instance. If it doesn't, a `key` change is the simplest way to
force a true remount.
