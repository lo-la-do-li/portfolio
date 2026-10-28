import { defineConfig, devices } from '@playwright/test';

// Not 3000, so a running `next dev` doesn't get mistaken for the test server
const PORT = 3100;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // WebKit is Safari's engine: the gallery bug this suite started from showed up on iPhones
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  // A production build, as Next recommends: `next dev` behaves differently
  // (and blocks its assets for any host but localhost). CI builds in an earlier step.
  webServer: {
    command: isCI ? `npm run start -- -p ${PORT}` : `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 240_000,
  },
});
