'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Shared lifecycle for the hero's R3F canvases.
 *
 * - `canvasKey`: with cacheComponents, Next hides (not unmounts) this page on
 *   navigation via <Activity>. R3F's cleanup destroys the WebGL context but keeps
 *   its root ref, so on return it re-renders into a dead context. Bumping the key
 *   on hide makes React mount a fresh <Canvas> when the page is shown again.
 * - `frameloop`: 'always' (60fps) only while the canvas is on screen and the user
 *   hasn't asked for reduced motion; otherwise 'demand', which renders a still
 *   frame and then only when something changes (e.g. the theme).
 */
export function useCanvasLifecycle() {
  const [canvasKey, setCanvasKey] = useState(0);
  useLayoutEffect(() => () => setCanvasKey((key) => key + 1), []);

  const reducedMotion = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const frameloop: 'always' | 'demand' = inView && !reducedMotion ? 'always' : 'demand';

  return { canvasKey, containerRef, frameloop };
}
