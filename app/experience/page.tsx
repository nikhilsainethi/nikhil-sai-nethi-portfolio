import { StandaloneSection } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata } from "@/lib/site";
export const metadata = createPageMetadata({
  title: "Experience",
  description:
    "Platform infrastructure at Google, working on infrastructure deployments for UHM-M models, built on engineering experience at Moody’s, Verisk, and Nokia.",
  path: "/experience/",
});
export default function Page() {
  return <StandaloneSection section="about" />;
}
