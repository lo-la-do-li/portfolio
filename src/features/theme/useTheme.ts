'use client';

import { useSyncExternalStore } from 'react';
import { DEFAULT_THEME, type Theme } from './constants';

// The theme lives on <html data-theme>, outside React. useSyncExternalStore
// reads it safely: during hydration React uses getServerSnapshot (matching the
// server HTML, so no hydration error), then re-renders with the real value.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
