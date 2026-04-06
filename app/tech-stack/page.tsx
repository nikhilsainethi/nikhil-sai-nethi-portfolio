import { Skills } from "@/components/portfolio/Skills";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Tech Stack",
  description:
    "Technical strengths across cloud platforms, observability, networking, AI application layers, and programming languages.",
  path: "/tech-stack",
});

export default function TechStackPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
      <Skills />
    </main>
  );
}
