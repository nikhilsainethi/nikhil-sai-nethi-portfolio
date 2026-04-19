import { ExperienceSection } from "@/components/portfolio/ExperienceSection";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Experience",
  description:
    "Work history spanning cloud infrastructure, observability, and software engineering roles at Moody's, Verisk, and Nokia.",
  path: "/experience",
});

export default function ExperiencePage() {
  return (
    <main style={{ paddingTop: 96 }}>
      <ExperienceSection />
    </main>
  );
}
