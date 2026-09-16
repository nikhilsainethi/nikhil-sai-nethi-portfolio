import { InfrastructurePortfolio } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata, siteDescription, siteTitle } from "@/lib/site";
export const metadata = createPageMetadata({
  title: siteTitle,
  description: siteDescription,
  path: "/",
});
export default function Home() {
  return <InfrastructurePortfolio />;
}
