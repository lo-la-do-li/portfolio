import type { Metadata } from 'next';
import SectionHeading from '@/components/SectionHeading';
import ProjectGrid from '@/features/projects/components/ProjectGrid';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Frontend case studies by Lola Dolinsky: client sites and personal projects built with React, Next.js, and TypeScript.',
};

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen">
      <section aria-labelledby="projects-heading" className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading id="projects-heading" title="Projects" as="h1" />
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-fg">
          Case studies from client and personal work: the problem, the decisions I made, and what
          changed as a result.
        </p>

        <div className="mt-12">
          {/* Cards sit directly under the page h1 here, so their titles are h2 */}
          <ProjectGrid cardTitleAs="h2" />
        </div>
      </section>
    </main>
  );
}
