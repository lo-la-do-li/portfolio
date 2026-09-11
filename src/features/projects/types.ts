export interface ProjectImage {
  src: string;
  alt: string;
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
  images?: ProjectImage[];
  links?: {
    repo?: string;
    demo?: string;
  };
}
