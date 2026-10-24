import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '../types';

export default function ProjectCard({
  project,
  eager = false,
  titleAs: Title = 'h3',
}: {
  project: Project;
  /** Keeps heading levels sequential: h2 under a page h1, h3 under a section h2. */
  titleAs?: 'h2' | 'h3';
  /** First card in the grid, above the fold — skip lazy-loading its cover image. */
  eager?: boolean;
}) {
  const cover = project.images?.[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border border-rule-soft bg-bg transition-colors hover:border-rule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {cover && (
        // Poster mat: the screenshot sits inside a fine rule with a margin of
        // background around it, like the white border around a printed poster.
        <div className="m-3 mb-0 border border-rule-soft p-2">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              loading={eager ? 'eager' : 'lazy'}
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-4">
          <Title className="font-display text-lg font-medium uppercase tracking-[0.06em] text-fg transition-colors group-hover:text-accent">
            {project.title}
          </Title>
          <span className="shrink-0 font-mono text-xs text-muted">{project.year}</span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>

        <ul className="mt-auto flex flex-wrap gap-2 pt-4">
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
