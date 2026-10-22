import type { MetadataRoute } from 'next';
import { getProjects } from '@/features/projects/data/projects';
import { siteUrl } from '@/lib/site';

// URLs only: Google ignores changeFrequency and priority, and only trusts
// lastModified when it's accurate — a build timestamp would claim every page
// changed on every deploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  return [
    { url: siteUrl },
    { url: `${siteUrl}/projects` },
    ...projects.map((project) => ({ url: `${siteUrl}/projects/${project.slug}` })),
  ];
}
