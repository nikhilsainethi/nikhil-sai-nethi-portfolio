import { Projects } from "@/components/portfolio/Projects";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Projects",
  description:
    "Flagship RAG case study and supporting engineering work spanning observability, resilience, and release automation.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
      <Projects />
    </main>
  );
}
