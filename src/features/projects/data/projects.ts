import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { cacheLife, cacheTag } from 'next/cache';
import type { Project } from '../types';

// One JSON file per project, read asynchronously (not a hardcoded array).
// Swapping this for a real database later only means changing the body of
// getProjects/getProject — every caller already awaits them.
const CONTENT_DIR = path.join(process.cwd(), 'src/features/projects/data/content');

export async function getProjects(): Promise<Project[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('projects');

  const files = await readdir(CONTENT_DIR);

  const projects = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        const raw = await readFile(path.join(CONTENT_DIR, file), 'utf-8');
        return JSON.parse(raw) as Project;
      })
  );

  return projects.sort((a, b) => b.year - a.year);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  'use cache';
  cacheLife('hours');
  cacheTag('projects', `project-${slug}`);

  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}
