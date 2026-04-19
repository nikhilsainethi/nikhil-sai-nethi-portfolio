import type { Metadata } from "next";

export const repoName = "nikhil-sai-nethi-portfolio";
export const basePath = `/${repoName}`;
export const siteUrl = `https://nikhilsainethi.github.io/${repoName}/`;
export const siteName = "Nikhil Sai Nethi";
export const siteTitle = `${siteName} | Software Engineer`;
export const siteDescription =
  "Portfolio for Nikhil Sai Nethi, a software engineer focused on cloud infrastructure, observability, and AI/LLM applications.";

const isProduction = process.env.NODE_ENV === "production";

export function withBasePath(path: `/${string}`) {
  return isProduction ? `${basePath}${path}` : path;
}

export const resumePath = withBasePath("/nikhil-sai-nethi-resume.pdf");
export const heroPortraitPath = withBasePath("/images/nikhil-hero.jpg");

export type NavItem = {
  id: string;
  label: string;
  route: `/${string}`;
};

export const primaryNavItems: NavItem[] = [
  { id: "about", label: "About", route: "/#about" },
  { id: "experience", label: "Exp.", route: "/#experience" },
  { id: "projects", label: "Projects", route: "/#projects" },
  { id: "skills", label: "Skills", route: "/#skills" },
  { id: "contact", label: "Contact", route: "/#contact" },
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
