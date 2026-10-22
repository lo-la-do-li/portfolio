// Absolute base URL for the site, for anything that needs a full URL (sitemap,
// robots.txt, metadataBase). Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build
// time to the production domain, so adding or changing a custom domain needs no
// code change. Locally it falls back to the dev server.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';
