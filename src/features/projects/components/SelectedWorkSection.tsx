import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import ProjectGrid from './ProjectGrid';

// Home page section: the project cards themselves, so reviewers see the work
// without a click, plus a link through to the full projects page.
export default function SelectedWorkSection() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24"
    >
      <SectionHeading id="work-heading" index="03" title="Selected work" />

      <div className="mt-12">
        {/* Below the fold here, so no eager image loading */}
        <ProjectGrid eagerFirstCover={false} />
      </div>

      <Link
        href="/projects"
        className="mt-10 inline-block font-mono text-xs uppercase tracking-[0.16em] text-fg underline decoration-rule-soft underline-offset-8 transition-colors hover:text-accent hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        All projects →
      </Link>
    </section>
  );
}
