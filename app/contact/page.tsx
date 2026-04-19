import { ContactSection } from "@/components/portfolio/ContactSection";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Nikhil Sai Nethi for conversations around platform engineering, observability, cloud-native delivery, and AI tooling.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main style={{ paddingTop: 96 }}>
      <ContactSection />
    </main>
  );
}
