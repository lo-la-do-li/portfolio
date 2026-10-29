import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { THEME_STORAGE_KEY, type Theme } from '../src/features/theme/constants';

const PATHS = ['/', '/projects', '/projects/mrface', '/no-such-page'];
const THEMES: Theme[] = ['dark', 'light'];

for (const path of PATHS) {
  for (const theme of THEMES) {
    test(`${path} in ${theme} theme has no detectable WCAG A/AA violations`, async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [THEME_STORAGE_KEY, theme]
      );
      // Skip entrance animations, so contrast is checked on the settled page
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
}
