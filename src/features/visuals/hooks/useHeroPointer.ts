'use client';

import { useEffect, type RefObject } from 'react';

export type HeroPointer = {
  /** Position in normalized device coordinates of the hero: -1..1, y up. */
  x: number;
  y: number;
  active: boolean;
};

/**
 * Tracks the mouse over an element that other content covers (the canvas sits behind the
 * hero text, so it can't receive pointer events itself). Listens on the window and maps
 * to the element's rectangle. Touch is ignored: a finger dragging to scroll shouldn't
 * trigger a hover effect.
 */
export function useHeroPointer(
  elementRef: RefObject<HTMLElement | null>,
  pointerRef: RefObject<HeroPointer>,
  enabled: boolean
) {
  useEffect(() => {
    const pointer = pointerRef.current;
    pointer.active = false;
    if (!enabled) return;

    function onMove(event: PointerEvent) {
      const element = elementRef.current;
      if (!element || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointer.active = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      pointer.x = x * 2 - 1;
      pointer.y = 1 - y * 2;
    }
    const onLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      pointer.active = false;
    };
  }, [elementRef, pointerRef, enabled]);
}
