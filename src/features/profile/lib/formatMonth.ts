// Pinned locale + UTC so output is deterministic. `new Date('2024-04')` parses
// as UTC midnight on Apr 1; formatting it in a US timezone would print "Mar 2024".
const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** '2024-04' → 'Apr 2024' */
export function formatMonth(isoMonth: string): string {
  return formatter.format(new Date(isoMonth));
}
