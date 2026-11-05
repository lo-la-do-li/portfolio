import { expect, test } from '@playwright/test';

// The three files from `npm run icons`: each needs a <link> in <head> and a
// response of the right type
const ICONS = [
  { rel: 'icon', type: 'image/x-icon', path: '/favicon.ico' },
  { rel: 'icon', type: 'image/svg+xml', path: '/icon.svg' },
  { rel: 'apple-touch-icon', type: 'image/png', path: '/apple-icon.png' },
];

for (const { rel, type, path } of ICONS) {
  test(`${path} is linked and served`, async ({ page, request }) => {
    await page.goto('/');

    // Next appends a cache-busting query, so match the start of the href
    const link = page.locator(`head link[rel="${rel}"][type="${type}"][href^="${path}"]`);
    await expect(link).toHaveCount(1);

    const response = await request.get((await link.getAttribute('href')) ?? '');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toBe(type);
  });
}
