import { expect, test } from '@playwright/test';
import { profile } from '../src/features/profile/data/profile';

// The request API doesn't follow redirects when maxRedirects is 0, so each
// test sees the redirect itself: its status and where it points
const REDIRECTS = [
  { from: '/resume', to: profile.links.resume, status: 307 },
  { from: '/work', to: '/projects', status: 308 },
  { from: '/contact', to: '/#contact', status: 308 },
];

for (const { from, to, status } of REDIRECTS) {
  test(`${from} redirects to ${to}`, async ({ request }) => {
    const response = await request.get(from, { maxRedirects: 0 });

    expect(response.status()).toBe(status);
    expect(response.headers().location).toBe(to);
  });
}

test('/resume lands on the PDF', async ({ request }) => {
  const response = await request.get('/resume');

  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toBe('application/pdf');
});
