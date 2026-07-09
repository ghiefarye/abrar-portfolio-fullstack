import ExperienceSection from "@/sections/experience-section";
import HeroSection from "@/sections/hero-section";
import IntroSection from "@/sections/intro-section";
import ProjectsSection from "@/sections/projects-section";
import GithubContributions from "@/sections/github-contributions";
import ContactSection from "@/sections/contact-section";
import StaggeredMenu from "@/components/StaggeredMenu";
import { siteConfig } from "@/lib/site";
import { getExperiences, getFeaturedProjects, getSettings } from "@/lib/api";

// Data (Projects, Experience, Settings) sekarang datang dari database lewat
// backend Flask, jadi halaman ini selalu dirender ulang tiap request supaya
// perubahan dari admin panel langsung tampil tanpa perlu rebuild.
export const dynamic = "force-dynamic";

const personId = `${siteConfig.url}/#person`;
const websiteId = `${siteConfig.url}/#website`;
const profilePageId = `${siteConfig.url}/#profile-page`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      url: siteConfig.url,
      // TODO: ganti dengan path foto profil asli setelah diunggah ke /public
      image: `${siteConfig.url}/profile.jpg`,
      jobTitle: siteConfig.role,
      mainEntityOfPage: { "@id": profilePageId },
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location.city,
        addressRegion: siteConfig.location.region,
        addressCountry: siteConfig.location.countryCode,
      },
      sameAs: Object.values(siteConfig.social),
      knowsAbout: [
        "Full-stack web development",
        "Laravel",
        "Node.js",
        "Python",
        "MySQL",
        "Flutter",
      ],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteConfig.url,
      name: "Abrar Ghifari Portfolio",
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": profilePageId,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
    },
  ],
};

const navigationItems = [
  { label: "Home", ariaLabel: "Go to home section", link: "#home" },
  { label: "About", ariaLabel: "Go to about section", link: "#about" },
  {
    label: "Journey",
    ariaLabel: "Go to journey section",
    link: "#journey",
  },
  {
    label: "Projects",
    ariaLabel: "Go to projects section",
    link: "#projects",
  },
  {
    label: "All Projects",
    ariaLabel: "View all projects",
    link: "/projects",
  },
  { label: "Contact", ariaLabel: "Go to contact section", link: "#contact" },
];

// TODO: pastikan /resume.pdf sudah diunggah ke folder public
const socialItems = [
  { label: "Resume", link: "/resume.pdf" },
  { label: "GitHub", link: siteConfig.social.github },
  { label: "LinkedIn", link: siteConfig.social.linkedin },
  { label: "Instagram", link: siteConfig.social.instagram },
];

export default async function Home() {
  const [settings, experiences, featuredProjects] = await Promise.all([
    getSettings(),
    getExperiences(),
    getFeaturedProjects(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <main className="relative isolate min-h-dvh overflow-hidden bg-background text-foreground">
        <StaggeredMenu
          isFixed
          position="right"
          items={navigationItems}
          socialItems={socialItems}
          colors={["#aeb8b0", "#3d403f"]}
          accentColor="#aeb8b0"
          logoText="Abrar / Portfolio"
          menuButtonColor="#111114"
          openMenuButtonColor="#111114"
        />
        <HeroSection settings={settings} />
        <IntroSection />
        <ExperienceSection experiences={experiences} />
        <ProjectsSection featuredProjects={featuredProjects} />
        <GithubContributions />
        <ContactSection settings={settings} />
      </main>
    </>
  );
}
