import { readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

// Every project page gets its own card, so test every project in the content
// folder: a new project is covered without touching this file
const projectPaths = readdirSync(path.join(__dirname, '../src/features/projects/data/content'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => `/projects/${file.replace(/\.json$/, '')}`);

const PATHS = ['/', '/projects', ...projectPaths];

for (const pagePath of PATHS) {
  test(`${pagePath} has a share card`, async ({ page, request }) => {
    await page.goto(pagePath);

    const meta = (property: string) =>
      page.locator(`meta[property="${property}"]`).getAttribute('content');

    // The preview's text matches the page's own title
    expect(await meta('og:title')).toBe(await page.title());
    expect(await meta('og:image:alt')).toBeTruthy();
    if (pagePath.startsWith('/projects/')) {
      expect(await meta('og:image')).toContain(`${pagePath}/opengraph-image`);
    }

    // og:image is absolute (metadataBase: the production domain, or :3000
    // locally), so fetch its path from the server under test instead
    const imageUrl = new URL((await meta('og:image')) ?? '');
    const image = await request.get(imageUrl.pathname + imageUrl.search);

    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toBe('image/png');

    // A PNG stores its width and height in the IHDR chunk, bytes 16–23
    const png = await image.body();
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  });
}
