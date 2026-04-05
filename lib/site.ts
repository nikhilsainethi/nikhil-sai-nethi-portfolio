export const repoName = "nikhil-sai-nethi-portfolio";
export const basePath = `/${repoName}`;
export const siteUrl = `https://nikhilsainethi.github.io/${repoName}/`;
export const siteTitle = "Nikhil Sai Nethi | Software Engineer";
export const siteDescription =
  "Portfolio for Nikhil Sai Nethi, a software engineer focused on cloud infrastructure, observability, and AI/LLM applications.";

export function withBasePath(path: `/${string}`) {
  return `${basePath}${path}`;
}

export const resumePath = withBasePath("/nikhil-sai-nethi-resume.pdf");
