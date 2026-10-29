import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClass } from '@/components/buttonClass';
import SectionHeading from '@/components/SectionHeading';
import { profile } from '@/features/profile/data/profile';

export const metadata: Metadata = {
  title: 'Page not found',
};

// Root not-found renders inside the root layout (header, footer, theme) for
// any unmatched URL and for notFound() calls, e.g. an unknown project slug.
export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      <section aria-labelledby="not-found-heading" className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading id="not-found-heading" index="404" title="Page not found" as="h1" />
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-fg">
          This link doesn&rsquo;t lead anywhere on the site. It may have moved, or the URL has a
          typo.
        </p>

        <ul className="mt-10 flex flex-wrap gap-3">
          <li>
            <Link href="/" className={buttonClass}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/projects" className={buttonClass}>
              Projects
            </Link>
          </li>
          <li>
            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              Résumé (PDF)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
