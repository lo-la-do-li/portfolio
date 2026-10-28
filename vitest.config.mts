import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Node 22+ ships its own global localStorage, which shadows jsdom's and is
// unusable without a backing file. Turn it off so tests get the browser one.
// (Node 20 has no such flag and would refuse to start with it.)
const nodeMajor = Number(process.versions.node.split('.')[0]);
const execArgv = nodeMajor >= 22 ? ['--no-experimental-webstorage'] : [];

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    execArgv,
    setupFiles: ['./vitest.setup.ts'],
    // Unit tests sit next to the code they cover; Playwright owns e2e/
    include: ['src/**/*.test.{ts,tsx}'],
    // A US timezone, where date bugs show up: '2024-04' is UTC midnight on
    // Apr 1, which is still March in Denver
    env: { TZ: 'America/Denver' },
  },
});
