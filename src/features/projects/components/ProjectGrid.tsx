import { getProjects } from '../data/projects';
import ProjectCard from './ProjectCard';

export default async function ProjectGrid({
  eagerFirstCover = true,
  cardTitleAs = 'h3',
  columns = 3,
}: {
  /** 3 for a full-width page, 2 inside a narrower column (home page section). */
  columns?: 2 | 3;
  /** Card heading level: h2 when the grid sits directly under a page h1. */
  cardTitleAs?: 'h2' | 'h3';
  /**
   * Eager-load the first cover image (a likely LCP element). Only right when
   * the grid is near the top of the page, as on /projects. Pass false when the
   * grid is below the fold (the home page) so it doesn't compete with the hero.
   */
  eagerFirstCover?: boolean;
}) {
  // The featured project leads; the rest keep their order (newest first)
  const all = await getProjects();
  const projects = [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)];
  // Not every project has a cover image, so "first card" isn't necessarily
  // "first rendered <Image>" — eager-load the first one that actually has one.
  const firstCoverSlug = eagerFirstCover
    ? projects.find((project) => project.images?.[0])?.slug
    : undefined;

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          eager={project.slug === firstCoverSlug}
          titleAs={cardTitleAs}
          variant={index === 0 && project.featured ? 'feature' : 'standard'}
        />
      ))}
    </div>
  );
}
