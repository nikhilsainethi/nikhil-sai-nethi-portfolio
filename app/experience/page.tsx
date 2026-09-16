import { StandaloneSection } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata } from "@/lib/site";
export const metadata = createPageMetadata({
  title: "Experience",
  description:
    "Engineering experience at Moody’s, Verisk, and Nokia, and an incoming platform infrastructure role focused on observability and monitoring for Google’s UHM-M team.",
  path: "/experience/",
});
export default function Page() {
  return <StandaloneSection section="about" />;
}
