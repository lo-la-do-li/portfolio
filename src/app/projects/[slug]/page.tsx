import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject, getProjects } from '@/features/projects/data/projects';
import ProjectDetail from '@/features/projects/components/ProjectDetail';

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);

  return {
    title: project?.title ?? 'Project not found',
    description: project?.summary,
  };
}

export default async function ProjectPage(props: PageProps<'/projects/[slug]'>) {
  const { slug } = await props.params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-slate-950 text-white">
      <ProjectDetail project={project} />
    </main>
  );
}
