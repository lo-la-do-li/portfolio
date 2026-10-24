'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Hash links are root-relative (`/#about`) so they also work from /projects/*.
const navItems = [
  { href: '/#about', label: 'About', section: 'about' },
  { href: '/#experience', label: 'Experience', section: 'experience' },
  // On the home page, "Projects" lights up for the Selected work section
  { href: '/projects', label: 'Projects', section: 'work' },
  { href: '/#contact', label: 'Contact', section: 'contact' },
];

const linkClass =
  'group relative inline-block transition-colors hover:text-fg data-[active=true]:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

// Active indicator: an accent diamond whose hairlines draw outward from it
// (the same diamond as the Experience timeline and the "Featured" label).
function Indicator() {
  const line =
    'h-px w-0 bg-accent transition-[width] duration-300 ease-out group-data-[active=true]:w-3 motion-reduce:transition-none';
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-full mt-1.5 flex -translate-x-1/2 items-center gap-1"
    >
      <span className={line} />
      <span className="h-1.5 w-1.5 rotate-45 scale-0 bg-accent transition-transform duration-200 group-data-[active=true]:scale-100 motion-reduce:transition-none" />
      <span className={line} />
    </span>
  );
}

export default function HeaderNav({ resumeHref }: { resumeHref: string }) {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [visibleSection, setVisibleSection] = useState<string | null>(null);

  // Home page: watch a thin band ~40% down the viewport. Whichever section
  // crosses it is "current". Cheaper than a scroll listener, and a section only
  // takes over once its heading is well into view.
  useEffect(() => {
    if (!onHome) return;
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        // In the hero (no section in the band), nothing is active
        setVisibleSection(intersecting.values().next().value ?? null);
      },
      { rootMargin: '-40% 0px -59% 0px' }
    );
    for (const item of navItems) {
      const element = document.getElementById(item.section);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [onHome]);

  function currentFor(item: (typeof navItems)[number]) {
    if (onHome) return item.section === visibleSection ? 'location' : undefined;
    return item.href === '/projects' && pathname.startsWith('/projects') ? 'page' : undefined;
  }

  return (
    <nav aria-label="Main">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
        {navItems.map((item) => {
          const current = currentFor(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current}
                data-active={current ? 'true' : undefined}
                className={linkClass}
              >
                {item.label}
                <Indicator />
              </Link>
            </li>
          );
        })}
        <li>
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Résumé
          </a>
        </li>
      </ul>
    </nav>
  );
}
