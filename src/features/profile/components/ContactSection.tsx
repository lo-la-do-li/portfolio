import SectionHeading from '@/components/SectionHeading';
import type { Profile } from '../types';

// Squared buttons that invert to solid text color on hover
const linkClass =
  'inline-block border border-rule px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-fg transition-colors hover:bg-fg hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function ContactSection({
  email,
  links,
}: {
  email: Profile['email'];
  links: Profile['links'];
}) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24"
    >
      <SectionHeading id="contact-heading" index="04" title="Get in touch" />

      {/* Double-rule poster frame: bookends the page with the hero's frame */}
      <div className="mt-12 border-[3px] border-rule p-1.5">
        <div className="border border-rule px-6 py-10 sm:px-12 sm:py-14">
          <p className="max-w-prose text-lg leading-relaxed text-fg">
            Open to frontend roles on product teams. The fastest way to reach me is email.
          </p>

          <a
            href={`mailto:${email}`}
            className="mt-6 inline-block break-all font-display text-2xl font-medium text-fg underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-3xl"
          >
            {email}
          </a>

          <ul className="mt-10 flex flex-wrap gap-3">
            <li>
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Résumé (PDF)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
