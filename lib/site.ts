import type { Metadata } from "next";

export const repoName = "nikhil-sai-nethi-portfolio";
export const basePath = `/${repoName}`;
export const siteUrl = `https://nikhilsainethi.github.io/${repoName}/`;
export const siteName = "Nikhil Sai Nethi";
export const siteTitle = `${siteName} | Software Engineer`;
export const siteDescription =
  "Portfolio for Nikhil Sai Nethi, a software engineer focused on cloud infrastructure, observability, and AI/LLM applications.";

export function withBasePath(path: `/${string}`) {
  return `${basePath}${path}`;
}

export const resumePath = withBasePath("/nikhil-sai-nethi-resume.pdf");
export const heroPortraitPath = withBasePath("/images/nikhil-hero-placeholder.svg");

export const primaryNavItems = [
  { href: "/" as const, label: "Home" },
  { href: "/projects" as const, label: "Projects" },
  { href: "/experience" as const, label: "Experience" },
  { href: "/tech-stack" as const, label: "Tech Stack" },
  { href: "/contact" as const, label: "Contact" },
];

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: "/" | `/${string}`;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      images: ["/opengraph-image"],
    },
    twitter: {
      title: `${title} | ${siteName}`,
      description,
      images: ["/twitter-image"],
    },
  };
}
