import type { Profile } from '../types';

const linkClass =
  'rounded-full border border-white/10 px-5 py-2 text-sm text-white transition hover:border-blue-500/40 hover:text-blue-300';

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
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24 text-center"
    >
      <h2 id="contact-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Get in touch
      </h2>
      <p className="mt-4 text-slate-400">
        Open to frontend roles on product teams. The fastest way to reach me is email.
      </p>

      <a
        href={`mailto:${email}`}
        className="mt-8 inline-block text-lg font-medium text-blue-300 hover:text-blue-200"
      >
        {email}
      </a>

      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        <li>
          <a href={links.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
            GitHub
          </a>
        </li>
        <li>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
            LinkedIn
          </a>
        </li>
        <li>
          <a href={links.resume} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Résumé (PDF)
          </a>
        </li>
      </ul>
    </section>
  );
}
