import { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonClass } from '@/components/buttonClass';
import type { Project } from '../types';
import CaseStudySections from './CaseStudySections';
import ProjectGallery from './ProjectGallery';

const tagClass =
  'border border-rule-soft px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted';

export default function ProjectDetail({ project }: { project: Project }) {
  const hasLinks = project.links?.demo || project.links?.repo || project.repoConfidential;
  const [cover, ...moreImages] = project.images ?? [];

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Link
        href="/projects"
        className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        ← All projects
      </Link>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <h1 className="font-display text-4xl font-medium uppercase tracking-[0.06em] text-balance text-fg sm:text-5xl">
          {project.title}
        </h1>
        <span className="shrink-0 font-mono text-sm text-muted">{project.year}</span>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li key={tag} className={tagClass}>
            {tag}
          </li>
        ))}
      </ul>

      {project.caseStudy && (
        <p className="mt-6 text-fg">
          <span className="mr-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Role
          </span>
          {project.caseStudy.role}
        </p>
      )}

      {/* Links near the top: "can I see it live?" is usually the first question */}
      {hasLinks && (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              Live site →
            </a>
          )}
          {project.links?.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              Source →
            </a>
          )}
          {project.repoConfidential && (
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Source confidential · client project
            </span>
          )}
        </div>
      )}

      {cover && (
        // Poster-mat cover. Shares its view-transition name with the project
        // card, so the card's screenshot morphs into this one on navigation.
        <div className="mt-10 border border-rule-soft p-2">
          <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                loading="eager"
                className="object-cover"
              />
            </div>
          </ViewTransition>
        </div>
      )}

      {moreImages.length > 0 && <ProjectGallery images={moreImages} />}

      <p className="mt-12 max-w-prose whitespace-pre-line text-lg leading-relaxed text-fg">
        {project.description}
      </p>

      {project.caseStudy && <CaseStudySections caseStudy={project.caseStudy} />}
    </article>
  );
}
