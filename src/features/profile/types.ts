export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  /** ISO year-month, e.g. '2024-04'. Rendered via <time dateTime>. */
  start: string;
  /** Omit for a current role; renders as "Present". */
  end?: string;
  highlights: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Profile {
  name: string;
  headline: string;
  bio: string;
  email: string;
  links: {
    github: string;
    linkedin: string;
    /** Path under /public, e.g. '/lola-dolinsky-resume.pdf'. */
    resume: string;
  };
  experience: ExperienceEntry[];
  skills: SkillGroup[];
}
