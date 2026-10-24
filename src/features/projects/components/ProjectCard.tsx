import { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '../types';

export default function ProjectCard({
  project,
  eager = false,
  titleAs: Title = 'h3',
  variant = 'standard',
}: {
  project: Project;
  /** Keeps heading levels sequential: h2 under a page h1, h3 under a section h2. */
  titleAs?: 'h2' | 'h3';
  /** First card in the grid, above the fold — skip lazy-loading its cover image. */
  eager?: boolean;
  /** 'feature' spans the whole grid row, with the screenshot beside the text. */
  variant?: 'standard' | 'feature';
}) {
  const cover = project.images?.[0];
  const feature = variant === 'feature';

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex flex-col border border-rule-soft bg-bg transition-colors hover:border-rule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        feature ? 'col-span-full md:grid md:grid-cols-[3fr_2fr]' : ''
      }`}
    >
      {cover && (
        // Poster mat: the screenshot sits inside a fine rule with a margin of
        // background around it, like the white border around a printed poster.
        <div className={`m-3 mb-0 border border-rule-soft p-2 ${feature ? 'md:mb-3 md:mr-0' : ''}`}>
          {/* Same name as the detail page's cover: the browser morphs one into the other */}
          <ViewTransition name={`project-cover-${project.slug}`} share="morph" default="none">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                // The feature card's image is ~60% of the row, so it needs a larger source
                sizes={
                  feature
                    ? '(min-width: 768px) 60vw, 100vw'
                    : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                }
                loading={eager ? 'eager' : 'lazy'}
                className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
            </div>
          </ViewTransition>
        </div>
      )}

      <div className={`flex flex-1 flex-col p-5 ${feature ? 'md:justify-center md:p-8' : ''}`}>
        {feature && (
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent" />
            Featured
          </p>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <Title
            className={`font-display font-medium uppercase tracking-[0.06em] text-fg transition-colors group-hover:text-accent ${
              feature ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}
          >
            {project.title}
          </Title>
          <span className="shrink-0 font-mono text-xs text-muted">{project.year}</span>
        </div>

        <p className={`mt-2 leading-relaxed text-muted ${feature ? 'text-base' : 'text-sm'}`}>
          {project.summary}
        </p>

        <ul className={`flex flex-wrap gap-2 pt-4 ${feature ? '' : 'mt-auto'}`}>
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="border border-rule-soft px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
