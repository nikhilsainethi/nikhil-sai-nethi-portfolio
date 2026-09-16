import type { Metadata } from "next";

export const repoName = "nikhil-sai-nethi-portfolio";
export const basePath = `/${repoName}`;
export const siteUrl = `https://nikhilsainethi.github.io/${repoName}/`;
export const siteName = "Nikhil Sai Nethi";
export const siteTitle = `${siteName} | Platform Infrastructure Engineer`;
export const siteDescription =
  "Nikhil Sai Nethi — incoming Platform Infrastructure Engineer at Google. Explore hardware models, reliable platforms, networking, and the engineering behind complex systems.";

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
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
      url: path,
      images: [`${siteUrl}social-preview.png`],
    },
    twitter: {
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
      images: [`${siteUrl}social-preview.png`],
    },
  };
}
