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

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="font-semibold text-white hover:text-blue-300">
          {profile.name}
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <nav aria-label="Main">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={profile.links.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
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
