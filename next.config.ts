import type { NextConfig } from 'next';

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
};

export default nextConfig;
