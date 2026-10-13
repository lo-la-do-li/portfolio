import type { CaseStudy } from '../types';

const headingClass = 'text-xl font-semibold tracking-tight text-white';
const listClass = 'mt-3 list-disc space-y-2 pl-5 text-slate-300 marker:text-slate-600';

// Role is rendered separately in ProjectDetail's header area, next to the tags.
export default function CaseStudySections({
  caseStudy,
}: {
  caseStudy: Pick<CaseStudy, 'problem' | 'approach' | 'outcome'>;
}) {
  return (
    <div className="mt-12 space-y-10">
      <section aria-labelledby="problem-heading">
        <h2 id="problem-heading" className={headingClass}>
          Problem
        </h2>
        <p className="mt-3 leading-relaxed text-slate-300">{caseStudy.problem}</p>
      </section>

      <section aria-labelledby="approach-heading">
        <h2 id="approach-heading" className={headingClass}>
          Approach
        </h2>
        <ul className={listClass}>
          {caseStudy.approach.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="outcome-heading">
        <h2 id="outcome-heading" className={headingClass}>
          Outcome
        </h2>
        <ul className={listClass}>
          {caseStudy.outcome.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
