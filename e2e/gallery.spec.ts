import { expect, test, type Page } from '@playwright/test';

// A project with several screenshots after the cover
const PROJECT_PATH = '/projects/mrface';

async function openGallery(page: Page) {
  await page.goto(PROJECT_PATH);
  const thumbnail = page.getByRole('button', { name: /^Enlarge:/ }).first();
  await thumbnail.click();
  const dialog = page.getByRole('dialog', { name: 'Project screenshots' });
  await expect(dialog).toBeVisible();
  return { dialog, thumbnail, counter: dialog.getByText(/^\d+ \/ \d+$/) };
}

test.describe('project gallery lightbox', () => {
  test('arrows step through the screenshots', async ({ page }) => {
    const { dialog, counter } = await openGallery(page);
    await expect(counter).toHaveText(/^1 \//);

    // Regression: on phones the image was painted over the arrows, so taps
    // landed on the <img>. click() fails if anything else would receive it.
    await dialog.getByRole('button', { name: 'Next image' }).click();
    await expect(counter).toHaveText(/^2 \//);

    await dialog.getByRole('button', { name: 'Previous image' }).click();
    await expect(counter).toHaveText(/^1 \//);
  });

  test('swiping the track moves to the next screenshot', async ({ page }) => {
    const { dialog, counter } = await openGallery(page);

    // Playwright can't synthesise a touch swipe in WebKit; scroll the track
    // by one slide, which is what a swipe does
    await dialog
      .locator('.snap-x')
      .evaluate((track) => track.scrollTo({ left: track.clientWidth, behavior: 'instant' }));
    await expect(counter).toHaveText(/^2 \//);
  });

  test('locks the page behind it while open', async ({ page }) => {
    await openGallery(page);
    await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden');
  });

  test('Close returns focus to the thumbnail', async ({ page }) => {
    const { dialog, thumbnail } = await openGallery(page);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(thumbnail).toBeFocused();
    await expect(page.locator('html')).not.toHaveCSS('overflow-y', 'hidden');
  });

  test('a tap on the backdrop closes it', async ({ page }) => {
    const { dialog } = await openGallery(page);
    // Top-left corner: backdrop, clear of the image and every control
    await dialog.click({ position: { x: 8, y: 8 } });
    await expect(dialog).toBeHidden();
  });

  test('arrow keys move and Escape closes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is a desktop concern');
    const { dialog, thumbnail, counter } = await openGallery(page);

    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText(/^2 \//);
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText(/^1 \//);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(thumbnail).toBeFocused();
  });
});
