import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import OgFrame from '@/features/og/components/OgFrame';
import { colors, contentType, fonts, size } from '@/features/og/theme';
import { getProject, getProjects } from '@/features/projects/data/projects';
import { profile } from '@/features/profile/data/profile';

// One card per project, rendered at build time from the same data as the page
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

// Lets each card carry its own alt text (a plain `alt` export is one string
// for every project). One image per project, so a single fixed id.
export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

  return [
    {
      id: 'card',
      alt: project ? `${project.title}: ${project.summary}` : 'Project not found',
      size,
      contentType,
    },
  ];
}

// Satori shrinks flex children to fit instead of letting them overflow, so
// text that doesn't fit gets drawn over its neighbours. Nothing here shrinks;
// the summary is clamped and the tags keep to one row instead (the first four
// fit; overflow: hidden is a backstop for long ones).
const MAX_TAGS = 4;
const noShrink = { display: 'flex', flexShrink: 0 } as const;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return new ImageResponse(
    <OgFrame caption={profile.name}>
      <div
        style={{
          ...noShrink,
          alignItems: 'center',
          gap: 16,
          fontFamily: 'Geist Mono',
          fontSize: 22,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: colors.muted,
        }}
      >
        {/* The project card's diamond marker */}
        <div
          style={{ width: 12, height: 12, background: colors.accent, transform: 'rotate(45deg)' }}
        />
        {project.caseStudy ? 'Case study' : 'Project'} · {project.year}
      </div>

      <div
        style={{
          ...noShrink,
          marginTop: 24,
          fontWeight: 500,
          fontSize: 64,
          lineHeight: 1.05,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {project.title}
      </div>
      {/* lineClamp needs display: block in Satori */}
      <div
        style={{
          display: 'block',
          flexShrink: 0,
          marginTop: 20,
          maxWidth: 940,
          fontSize: 32,
          lineHeight: 1.3,
          lineClamp: 2,
        }}
      >
        {project.summary}
      </div>

      <div
        style={{ ...noShrink, gap: 12, marginTop: 'auto', marginBottom: 32, overflow: 'hidden' }}
      >
        {project.tags.slice(0, MAX_TAGS).map((tag) => (
          <div
            key={tag}
            style={{
              ...noShrink,
              border: `2px solid ${colors.ruleSoft}`,
              padding: '6px 14px',
              fontFamily: 'Geist Mono',
              fontSize: 20,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </OgFrame>,
    { ...size, fonts }
  );
}
