import { CertificationsEducation } from "@/components/portfolio/CertificationsEducation";
import { ExperienceTimeline } from "@/components/portfolio/ExperienceTimeline";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Experience",
  description:
    "Work history, certifications, and education for Nikhil Sai Nethi across cloud infrastructure, observability, and software engineering roles.",
  path: "/experience",
});

export default function ExperiencePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
      <ExperienceTimeline />
      <CertificationsEducation />
    </main>
  );
}
