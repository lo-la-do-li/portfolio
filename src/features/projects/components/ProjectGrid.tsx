import { getProjects } from '../data/projects';
import ProjectCard from './ProjectCard';

export default async function ProjectGrid() {
  const projects = await getProjects();
  // Not every project has a cover image, so "first card" isn't necessarily
  // "first rendered <Image>" — eager-load the first one that actually has one.
  const firstCoverSlug = projects.find((project) => project.images?.[0])?.slug;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} eager={project.slug === firstCoverSlug} />
      ))}
    </div>
  );
}
