import Link from 'next/link';
import EditorialSection from '@/components/EditorialSection';
import ProjectGrid from './ProjectGrid';

// Home page section: the project cards themselves, so reviewers see the work
// without a click, plus a link through to the full projects page.
export default function SelectedWorkSection() {
  return (
    <EditorialSection id="work" index="03" title="Selected work">
      {/* Below the fold here, so no eager image loading; two columns fit the content column */}
      <ProjectGrid eagerFirstCover={false} columns={2} />

      <Link
        href="/projects"
        className="mt-10 inline-block font-mono text-xs uppercase tracking-[0.16em] text-fg underline decoration-rule-soft underline-offset-8 transition-colors hover:text-accent hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        All projects →
      </Link>
    </EditorialSection>
  );
}
