import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from './constants';
import { themeScript } from './themeScript';

// The layout inlines the script into <head>; run the same string here
function runThemeScript() {
  new Function(themeScript)();
}

const theme = () => document.documentElement.getAttribute('data-theme');

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('themeScript', () => {
  it('applies a saved theme before React runs', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    runThemeScript();
    expect(theme()).toBe('light');
  });

  it('leaves the default alone when nothing is saved', () => {
    runThemeScript();
    expect(theme()).toBeNull();
  });

  it('ignores a stored value that is not a theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '"><img src=x onerror=alert(1)>');
    runThemeScript();
    expect(theme()).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    expect(runThemeScript).not.toThrow();
    expect(theme()).toBeNull();
  });
});
