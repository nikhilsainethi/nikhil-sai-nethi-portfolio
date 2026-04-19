import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Projects",
  description:
    "Flagship RAG case study and supporting engineering work spanning observability, resilience, and release automation.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <main style={{ paddingTop: 96 }}>
      <ProjectsSection />
    </main>
  );
}
