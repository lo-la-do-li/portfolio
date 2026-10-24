import SectionHeading from '@/components/SectionHeading';
import type { ExperienceEntry } from '../types';
import { formatMonth } from '../lib/formatMonth';

export default function ExperienceSection({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24"
    >
      <SectionHeading id="experience-heading" index="02" title="Experience" />

      {/* Ordered list: the sequence (most recent first) is meaningful. */}
      <ol className="mt-12 space-y-14 border-l border-rule-soft">
        {experience.map((job) => (
          <li key={`${job.company}-${job.start}`} className="relative pl-8">
            {/* Timeline marker: a small accent diamond on the rule */}
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-2 h-2.5 w-2.5 rotate-45 bg-accent"
            />

            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="font-display text-xl font-medium uppercase tracking-[0.06em] text-fg">
                {job.role}
              </h3>
              <p className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                <time dateTime={job.start}>{formatMonth(job.start)}</time> –{' '}
                {job.end ? <time dateTime={job.end}>{formatMonth(job.end)}</time> : 'Present'}
              </p>
            </div>
            <p className="mt-1 text-fg">
              {job.company} <span className="text-muted">· {job.location}</span>
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-fg marker:text-muted">
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
