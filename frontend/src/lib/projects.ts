export const projectCategories = [
  "all",
  "frontend",
  "backend",
  "fullstack",
] as const;

export type ProjectCategory = Exclude<
  (typeof projectCategories)[number],
  "all"
>;

export interface ProjectImage {
  src: string;
  alt: string;
  label: string;
  description: string;
}

export interface ProjectImpactStat {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  role: string;
  category: ProjectCategory;
  featured: boolean;
  experienceId?: string | null;
  experienceLabel?: string | null;
  summary: string;
  contributions?: string[];
  impactSummary?: string;
  impactStats?: ProjectImpactStat[];
  impacts?: string[];
  highlights: string[];
  techStack: string[];
  images: ProjectImage[];
  link: string | null;
}

export function formatProjectCategory(category: ProjectCategory) {
  if (category === "fullstack") return "Fullstack";

  return `${category[0].toUpperCase()}${category.slice(1)}`;
}
