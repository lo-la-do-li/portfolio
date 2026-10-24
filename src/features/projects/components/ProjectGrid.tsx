import { getProjects } from '../data/projects';
import ProjectCard from './ProjectCard';

export default async function ProjectGrid({
  eagerFirstCover = true,
  cardTitleAs = 'h3',
}: {
  /** Card heading level: h2 when the grid sits directly under a page h1. */
  cardTitleAs?: 'h2' | 'h3';
  /**
   * Eager-load the first cover image (a likely LCP element). Only right when
   * the grid is near the top of the page, as on /projects. Pass false when the
   * grid is below the fold (the home page) so it doesn't compete with the hero.
   */
  eagerFirstCover?: boolean;
}) {
  const projects = await getProjects();
  // Not every project has a cover image, so "first card" isn't necessarily
  // "first rendered <Image>" — eager-load the first one that actually has one.
  const firstCoverSlug = eagerFirstCover
    ? projects.find((project) => project.images?.[0])?.slug
    : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.slug}
          project={project}
          eager={project.slug === firstCoverSlug}
          titleAs={cardTitleAs}
        />
      ))}
    </div>
  );
}
