import { StandaloneSection } from "@/components/infrastructure/InfrastructurePortfolio";
import { createPageMetadata } from "@/lib/site";
export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Connect with Nikhil Sai Nethi about infrastructure and engineering.",
  path: "/contact/",
});
export default function Page() {
  return <StandaloneSection section="contact" />;
}
