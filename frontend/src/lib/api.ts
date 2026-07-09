import type { Project } from "@/lib/projects";
import type { Experience } from "@/components/ExperienceCard";

// Dipanggil dari Server Component, jadi ini benar-benar request
// server-ke-server langsung ke Flask (bukan lewat rewrites browser).
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export interface SiteSettings {
  siteUrl: string;
  name: string;
  shortName: string;
  role: string;
  title: string;
  description: string;
  language: string;
  locale: string;
  location: {
    city: string;
    region: string;
    country: string;
    countryCode: string;
  };
  email: string;
  social: {
    github: string;
    linkedin: string;
    instagram: string;
  };
  projectArchive: string;
  profileImage: string | null;
  resumeFile: string | null;
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // Backend Flask belum jalan / lagi down - tetap tampilkan situs
    // dengan data kosong/fallback daripada error 500.
    return fallback;
  }
}

export function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>("/api/projects", []);
}

export function getFeaturedProjects(): Promise<Project[]> {
  return getProjects().then((projects) => projects.filter((p) => p.featured));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === slug) ?? null;
}

export function getExperiences(): Promise<Experience[]> {
  return fetchJson<Experience[]>("/api/experiences", []);
}

const FALLBACK_SETTINGS: SiteSettings = {
  siteUrl: "https://abrarghifari.dev",
  name: "Abrar Ghifari",
  shortName: "Abrar Ghifari",
  role: "Full-Stack Web Developer",
  title: "Abrar Ghifari | Full-Stack Web Developer",
  description: "Portfolio Abrar Ghifari.",
  language: "en",
  locale: "en_US",
  location: {
    city: "Jombang",
    region: "East Java",
    country: "Indonesia",
    countryCode: "ID",
  },
  email: "abrarghifari@example.com",
  social: {
    github: "https://github.com/abrarghifari",
    linkedin: "https://linkedin.com/in/abrarghifari",
    instagram: "https://instagram.com/abrarghifari",
  },
  projectArchive: "https://abrarghifari.dev/projects",
  profileImage: null,
  resumeFile: null,
};

export function getSettings(): Promise<SiteSettings> {
  return fetchJson<SiteSettings>("/api/settings", FALLBACK_SETTINGS);
}
