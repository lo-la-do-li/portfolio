import type { ExperienceEntry } from '../types';
import { formatMonth } from '../lib/formatMonth';

export default function ExperienceSection({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24"
    >
      <h2
        id="experience-heading"
        className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        Experience
      </h2>

      {/* Ordered list: the sequence (most recent first) is meaningful. */}
      <ol className="mt-10 space-y-12 border-l border-white/10">
        {experience.map((job) => (
          <li key={`${job.company}-${job.start}`} className="relative pl-8">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-blue-500"
            />

            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="text-lg font-semibold text-white">
                {job.role} <span className="text-slate-400">· {job.company}</span>
              </h3>
              <p className="shrink-0 text-sm text-slate-500">
                <time dateTime={job.start}>{formatMonth(job.start)}</time> –{' '}
                {job.end ? <time dateTime={job.end}>{formatMonth(job.end)}</time> : 'Present'}
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-500">{job.location}</p>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300 marker:text-slate-600">
              {job.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
