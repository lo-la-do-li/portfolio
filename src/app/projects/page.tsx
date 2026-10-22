import type { Metadata } from 'next';
import ProjectGrid from '@/features/projects/components/ProjectGrid';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Frontend case studies by Lola Dolinsky: client sites and personal projects built with React, Next.js, and TypeScript.',
};

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Projects</h1>
        <p className="mt-4 max-w-2xl text-slate-400">A selection of things I&apos;ve built.</p>

        <div className="mt-12">
          <ProjectGrid />
        </div>
      </section>
    </main>
  );
}
