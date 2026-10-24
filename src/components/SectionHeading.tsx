// Shared heading for the home page sections: a section number on a fine rule,
// then the title in the display face. The number is decorative (the <h2> names
// the section), so it's hidden from assistive tech.
export default function SectionHeading({
  id,
  index,
  title,
}: {
  /** Used by the section's aria-labelledby. */
  id: string;
  /** Position on the page, e.g. '01'. */
  index: string;
  title: string;
}) {
  return (
    <div>
      <div aria-hidden="true" className="flex items-center gap-4">
        <span className="font-mono text-xs tracking-[0.16em] text-muted">{index}</span>
        <span className="h-px flex-1 bg-rule-soft" />
      </div>
      <h2
        id={id}
        className="mt-4 font-display text-3xl font-medium uppercase tracking-[0.08em] text-fg sm:text-4xl"
      >
        {title}
      </h2>
    </div>
  );
}
