import { profile } from '@/features/profile/data/profile';

const linkClass =
  'transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

// Colophon footer. No copyright year: with Cache Components, `new Date()`
// during prerender fails the build, and a year-free line never goes stale.
export default function SiteFooter() {
  return (
    <footer className="mt-auto px-4 pb-10 pt-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Double rule closes the page, like the poster's frame */}
        <div aria-hidden="true" className="border-t-[3px] border-rule" />
        <div aria-hidden="true" className="mt-1.5 border-t border-rule" />

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Set in <span className="font-display tracking-wide text-fg">Jost</span> and Geist.
            Palette sampled from Horace Taylor&rsquo;s 1926 London Underground poster{' '}
            <cite>Summer Sales</cite>. Built with Next.js, React Three Fiber and Tailwind CSS.
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            <li>{profile.name}</li>
            <li>
              <a
                href={profile.links.source}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Source on GitHub
              </a>
            </li>
            <li>
              <a href="#" className={linkClass}>
                Back to top ↑
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
