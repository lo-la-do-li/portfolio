// Squared buttons that invert to solid text color on hover. A class string
// rather than a component, because it styles <Link>, <a> and <button> alike.
// cursor-pointer: Tailwind 4 leaves <button> on the default cursor.
export const buttonClass =
  'inline-block cursor-pointer border border-rule px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-fg transition-colors hover:bg-fg hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
