import { THEME_STORAGE_KEY } from './constants';

// Inlined into <head> by the root layout. Inline scripts run synchronously
// while the browser parses the HTML, so a saved theme is applied before the
// first paint — no flash of the default theme for returning visitors.
//
// Only 'light' or 'dark' are accepted, so a corrupted or tampered storage value
// can't put arbitrary text into the attribute. try/catch covers browsers where
// localStorage throws (some private modes).
//
// localStorage rather than a cookie: reading a cookie on the server would make
// every page dynamic and lose static prerendering.
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
