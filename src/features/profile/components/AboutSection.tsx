import type { SkillGroup } from '../types';

export default function AboutSection({ bio, skills }: { bio: string; skills: SkillGroup[] }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24"
    >
      <h2 id="about-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        About
      </h2>

      <p className="mt-6 text-base leading-relaxed text-slate-300">{bio}</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {skills.map((group) => (
          <div key={group.label}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
