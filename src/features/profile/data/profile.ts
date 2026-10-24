import type { Profile } from '../types';

// A single, rarely-changing object: a typed module is enough here. Unlike
// features/projects, there is no collection to read from disk or cache.
export const profile = {
  name: 'Lola Dolinsky',
  role: 'Frontend Engineer',
  headline: 'Building scalable, high-performance web products with React, TypeScript, and Next.js.',
  bio: 'I’m a frontend engineer with 4+ years of experience building responsive, scalable web applications and shared UI systems. I focus on performance, accessibility, reusable component architecture, and developer-friendly workflows that help teams ship faster. I’ve worked across agency and SaaS environments, delivering product-facing features and internal tools with measurable impact. I’m looking for a long-term product team where I can contribute to thoughtful UX and continue growing across the frontend stack.',
  email: 'dolinsky.lola@gmail.com',
  links: {
    github: 'https://github.com/lo-la-do-li',
    linkedin: 'https://www.linkedin.com/in/lola-dolinsky/',
    resume: '/lola-dolinsky-resume.pdf',
  },
  experience: [
    {
      company: 'Light Studios LLC',
      role: 'Frontend Engineer',
      location: 'Denver, CO',
      start: '2024-04',
      highlights: [
        'Improved site performance, navigation, and SEO for client platforms, including one site that grew traffic by 210% in one month.',
        'Delivered responsive, mobile-first web experiences using React, Next.js, and TypeScript across multiple client projects.',
        'Built reusable frontend patterns that improved maintainability and sped up future feature delivery.',
      ],
    },
    {
      company: 'LeafLink',
      role: 'Frontend Software Engineer',
      location: 'New York, NY',
      start: '2021-10',
      end: '2024-01',
      highlights: [
        'Shipped responsive, scalable features for the Payments Portal used by internal teams and external customers.',
        'Built reusable Tailwind-based design system components that improved UI consistency across 3 applications and increased development efficiency.',
        'Maintained 80%+ test coverage, integrated Product Experience Software, and helped build a hackathon-winning Real User Monitoring dashboard.',
      ],
    },
    {
      company: 'Rocket Software',
      role: 'Software Engineer Intern',
      location: 'Denver, CO',
      start: '2021-06',
      end: '2021-08',
      highlights: [
        'Built accessible frontend components and data visualizations for a performance monitoring dashboard.',
        'Helped resolve a frontend build bottleneck, improving build time by 28%.',
        'Collaborated across a distributed Agile team spanning 5 time zones to support reliable sprint delivery.',
      ],
    },
  ],
  skills: [
    {
      label: 'Frontend',
      items: [
        'React',
        'Next.js',
        'Vue.js',
        'TypeScript',
        'JavaScript',
        'HTML',
        'CSS',
        'Tailwind CSS',
      ],
    },
    {
      label: 'Engineering',
      items: [
        'Responsive design',
        'Accessibility (a11y)',
        'SEO',
        'Performance optimization',
        'Component architecture',
        'Design systems',
      ],
    },
    {
      label: 'Developer Experience',
      items: [
        'Reusable component libraries',
        'Frontend observability',
        'Testing',
        'Build/performance improvements',
        'AI-assisted development',
      ],
    },
  ],
} satisfies Profile;
