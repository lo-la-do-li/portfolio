import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '../types';

export default function ProjectCard({
  project,
  eager = false,
}: {
  project: Project;
  /** First card in the grid, above the fold — skip lazy-loading its cover image. */
  eager?: boolean;
}) {
  const cover = project.images?.[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-blue-500/40 hover:bg-white/[0.06]"
    >
      {cover && (
        <div className="relative aspect-video w-full overflow-hidden border-b border-white/10">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading={eager ? 'eager' : 'lazy'}
            className="object-cover transition group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300">
            {project.title}
          </h3>
          <span className="shrink-0 text-sm text-slate-500">{project.year}</span>
        </div>

        <p className="mt-2 text-sm text-slate-400">{project.summary}</p>

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
      </div>
    </Link>
  );
}
