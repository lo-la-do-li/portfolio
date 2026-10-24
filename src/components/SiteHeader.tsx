import Link from 'next/link';
import { profile } from '@/features/profile/data/profile';
import ThemeToggle from '@/features/theme/components/ThemeToggle';

// Hash links are root-relative (`/#about`) so they also work from /projects/*.
const navItems = [
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/projects', label: 'Projects' },
  { href: '/#contact', label: 'Contact' },
];

const navLink =
  'text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

// Two rules run through the box behind the name, after the 1920s Underground
// nameplate. The name's own background masks the rules where the text sits.
const wordmarkRule =
  "before:absolute before:inset-x-[-14px] before:top-1.5 before:h-0.5 before:bg-rule before:content-[''] after:absolute after:inset-x-[-14px] after:bottom-1.5 after:h-0.5 after:bg-rule after:content-['']";

export default function SiteHeader() {
  return (
    // Solid background (not translucent) so the wordmark's masking background
    // matches the header behind it.
    <header className="sticky top-0 z-50 border-b border-rule-soft bg-bg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link
          href="/"
          className={`relative mx-3.5 inline-grid place-items-center border-2 border-rule px-3.5 py-1.5 ${wordmarkRule} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
        >
          <span className="relative z-10 bg-bg px-2 font-display text-[15px] font-semibold uppercase tracking-[0.18em] text-fg">
            {profile.name}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <nav aria-label="Main">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.12em]">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={profile.links.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navLink}
                >
                  Résumé
                </a>
              </li>
            </ul>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
