import { StandaloneSection } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata } from "@/lib/site";
export const metadata = createPageMetadata({
  title: "Platform capabilities",
  description: "Capabilities in platforms, observability, software and data.",
  path: "/tech-stack/",
});
export default function Page() {
  return <StandaloneSection section="skills" />;
}
