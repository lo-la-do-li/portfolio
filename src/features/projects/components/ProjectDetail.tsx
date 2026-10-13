import Link from 'next/link';
import type { Project } from '../types';
import CaseStudySections from './CaseStudySections';
import ProjectGallery from './ProjectGallery';

export default function ProjectDetail({ project }: { project: Project }) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Link href="/projects" className="text-sm text-slate-400 hover:text-blue-300">
        ← All projects
      </Link>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {project.title}
        </h1>
        <span className="shrink-0 text-sm text-slate-500">{project.year}</span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-300"
          >
            {tag}
          </li>
        ))}
      </ul>

      {project.caseStudy && (
        <p className="mt-4 text-sm text-slate-400">
          <span className="font-semibold text-slate-300">Role:</span> {project.caseStudy.role}
        </p>
      )}

      {project.images && project.images.length > 0 && <ProjectGallery images={project.images} />}

      <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-slate-300">
        {project.description}
      </p>

      {project.caseStudy && <CaseStudySections caseStudy={project.caseStudy} />}

      {(project.links?.demo || project.links?.repo || project.repoConfidential) && (
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
          {project.links?.demo && (
            <a
              href={project.links.demo}
              className="text-blue-400 hover:text-blue-300"
              target="_blank"
              rel="noreferrer"
            >
              Live demo →
            </a>
          )}
          {project.links?.repo && (
            <a
              href={project.links.repo}
              className="text-blue-400 hover:text-blue-300"
              target="_blank"
              rel="noreferrer"
            >
              Source →
            </a>
          )}
          {project.repoConfidential && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
              Source confidential — client project
            </span>
          )}
        </div>
      )}
    </article>
  );
}
