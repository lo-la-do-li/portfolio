import type { NextConfig } from 'next';
import { profile } from './src/features/profile/data/profile';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enables the `use cache` directive (Cache Components / Partial Prerendering).
  cacheComponents: true,
  turbopack: {
    // Pin the project root here. Without this, Turbopack walks upward looking
    // for a lockfile and finds an unrelated one in the parent `coding/`
    // directory (leftover from a different, unrelated project), which sits
    // outside this git repo and triggers a root-detection warning.
    root: __dirname,
  },
  // Short URLs to type or paste into applications. Answered before rendering.
  async redirects() {
    return [
      // Temporary (307): browsers cache permanent redirects, so a renamed PDF
      // would leave old visitors pointed at a file that no longer exists.
      { source: '/resume', destination: profile.links.resume, permanent: false },
      // Permanent (308): common guesses for pages that won't move.
      { source: '/work', destination: '/projects', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
    ];
  },
};

export default nextConfig;
