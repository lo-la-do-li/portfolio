import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
  test('an unknown URL gets a real 404 and a way back', async ({ page }) => {
    const response = await page.goto('/no-such-page');

    // The status matters for search engines, not only the page shown
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page).toHaveTitle('Page not found | Lola Dolinsky');

    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
  });

  test('an unknown project shows the same page', async ({ page }) => {
    const response = await page.goto('/projects/no-such-project');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  });
});
