import SectionHeading from '@/components/SectionHeading';
import type { CaseStudy } from '../types';

const listClass = 'mt-6 list-disc space-y-3 pl-5 leading-relaxed text-fg marker:text-muted';

// Role is rendered separately in ProjectDetail's header area, next to the tags.
export default function CaseStudySections({
  caseStudy,
}: {
  caseStudy: Pick<CaseStudy, 'problem' | 'approach' | 'outcome'>;
}) {
  return (
    <div className="mt-16 space-y-16">
      <section aria-labelledby="problem-heading">
        <SectionHeading id="problem-heading" title="Problem" />
        <p className="mt-6 max-w-prose leading-relaxed text-fg">{caseStudy.problem}</p>
      </section>

      <section aria-labelledby="approach-heading">
        <SectionHeading id="approach-heading" title="Approach" />
        <ul className={listClass}>
          {caseStudy.approach.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="outcome-heading">
        <SectionHeading id="outcome-heading" title="Outcome" />
        <ul className={listClass}>
          {caseStudy.outcome.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
