import { StandaloneSection } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata } from "@/lib/site";
export const metadata = createPageMetadata({
  title: "Engineering work",
  description: "Selected systems, reliability, and developer experience work.",
  path: "/projects/",
});
export default function Page() {
  return <StandaloneSection section="work" />;
}
