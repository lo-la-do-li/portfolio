import type { ReactNode } from 'react';

// Two-column editorial layout for the home page sections. On large screens the
// left column holds a poster-scale outlined section number and the title, and
// stays pinned while the content on the right scrolls past. On small screens it
// collapses to one column with a compact number on a fine rule.
// The number is decorative (the <h2> names the section), so it's hidden from
// assistive tech.
export default function EditorialSection({
  id,
  index,
  title,
  children,
}: {
  /** Anchor for nav links (`/#about`); the heading gets `${id}-heading`. */
  id: string;
  /** Position on the page, e.g. '01'. */
  index: string;
  title: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24 lg:py-32"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          {/* Small screens: compact number on a fine rule */}
          <div aria-hidden="true" className="flex items-center gap-4 lg:hidden">
            <span className="font-mono text-xs tracking-[0.16em] text-muted">{index}</span>
            <span className="h-px flex-1 bg-rule-soft" />
          </div>
          {/* Large screens: poster-scale outlined numeral */}
          <span
            aria-hidden="true"
            className="hidden font-display text-[9rem] font-light leading-none text-transparent [-webkit-text-stroke:1.5px_var(--rule)] lg:block"
          >
            {index}
          </span>
          <h2
            id={headingId}
            className="mt-4 font-display text-3xl font-medium uppercase tracking-[0.08em] text-fg sm:text-4xl lg:mt-6"
          >
            {title}
          </h2>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
