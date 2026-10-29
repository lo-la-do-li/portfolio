'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';

// Same squared buttons as the contact section and the 404 page
const linkClass =
  'inline-block cursor-pointer border border-rule px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-fg transition-colors hover:bg-fg hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// Root error boundary: wraps every page inside the root layout, so the header,
// footer and theme survive a crash. Errors in the root layout itself would
// need global-error.tsx, which this small static layout doesn't warrant.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen">
      {/* Client components can't export metadata; React hoists this into <head> */}
      <title>Something went wrong | Lola Dolinsky</title>
      <section aria-labelledby="error-heading" className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading id="error-heading" index="Error" title="Something went wrong" as="h1" />
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-fg">
          This page hit an unexpected error. Trying again often fixes it.
        </p>
        {/* Server errors reach the browser with only this id (no message), to
            match the error in the server logs */}
        {error.digest && (
          <p className="mt-4 font-mono text-xs tracking-[0.14em] text-muted">
            Reference: {error.digest}
          </p>
        )}

        <ul className="mt-10 flex flex-wrap gap-3">
          <li>
            <button type="button" onClick={() => retry()} className={linkClass}>
              Try again
            </button>
          </li>
          <li>
            <Link href="/" className={linkClass}>
              Home
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
