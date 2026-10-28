import { expect, test } from '@playwright/test';

test.describe('Night/Day theme', () => {
  test('defaults to Night', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Night' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('Day is remembered on the next visit, before React loads', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Day' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Block the app's JavaScript: only the inline pre-paint script can apply
    // the theme now, which is what prevents a flash of Night on return visits
    await page.route('**/_next/static/**/*.js', (route) => route.abort());
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
