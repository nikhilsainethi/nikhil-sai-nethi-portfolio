import { StandaloneSection } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata } from "@/lib/site";
export const metadata = createPageMetadata({
  title: "Engineering work",
  description:
    "Production observability, incident response, systems diagnosis, and platform work at Moody’s, Nokia, and Verisk.",
  path: "/projects/",
});
export default function Page() {
  return <StandaloneSection section="work" />;
}
