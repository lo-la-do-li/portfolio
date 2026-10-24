// Shared heading for sections and pages: an optional number on a fine rule,
// then the title in the display face. The number is decorative (the heading
// names the section), so it's hidden from assistive tech.
export default function SectionHeading({
  id,
  index,
  title,
  as: Heading = 'h2',
}: {
  /** Used by the section's aria-labelledby. */
  id: string;
  /** Position on the page, e.g. '01'. Omit for a plain rule. */
  index?: string;
  title: string;
  /** h1 for a page title, h2 (default) for a section within a page. */
  as?: 'h1' | 'h2';
}) {
  return (
    <div>
      <div aria-hidden="true" className="flex items-center gap-4">
        {index && <span className="font-mono text-xs tracking-[0.16em] text-muted">{index}</span>}
        <span className="h-px flex-1 bg-rule-soft" />
      </div>
      <Heading
        id={id}
        className="mt-4 font-display text-3xl font-medium uppercase tracking-[0.08em] text-fg sm:text-4xl"
      >
        {title}
      </Heading>
    </div>
  );
}
