import SectionHeading from '@/components/SectionHeading';
import type { SkillGroup } from '../types';

export default function AboutSection({ bio, skills }: { bio: string; skills: SkillGroup[] }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24"
    >
      <SectionHeading id="about-heading" index="01" title="About" />

      <p className="mt-8 max-w-prose text-lg leading-relaxed text-fg">{bio}</p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {skills.map((group) => (
          <div key={group.label}>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              {group.label}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border border-rule-soft px-2.5 py-1 font-mono text-xs text-fg"
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
