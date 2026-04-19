import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Tech Stack",
  description:
    "Technical strengths across cloud platforms, observability, AI application layers, and programming languages.",
  path: "/tech-stack",
});

export default function TechStackPage() {
  return (
    <main style={{ paddingTop: 96 }}>
      <SkillsSection />
    </main>
  );
}
