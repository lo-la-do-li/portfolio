export interface ProjectImage {
  src: string;
  alt: string;
}

/** All-or-nothing: a project either has a full case study or none. */
export interface CaseStudy {
  /** e.g. "Sole frontend engineer, working with the client's marketing consultant" */
  role: string;
  /** What was wrong or what the client needed. */
  problem: string;
  /** Key decisions, each with its reasoning. */
  approach: string[];
  /** Results — measurable where possible. */
  outcome: string[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  year: number;
  /** Client repo under NDA: show a "source confidential" note instead of a repo link. */
  repoConfidential?: boolean;
  /** Leads the project grid as a wide feature card. One project at a time. */
  featured?: boolean;
  caseStudy?: CaseStudy;
  images?: ProjectImage[];
  links?: {
    repo?: string;
    demo?: string;
  };
}
