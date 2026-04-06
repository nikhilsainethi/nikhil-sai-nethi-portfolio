import { Contact } from "@/components/portfolio/Contact";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Nikhil Sai Nethi for conversations around platform engineering, observability, cloud-native delivery, and practical AI tooling.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
      <Contact />
    </main>
  );
}
