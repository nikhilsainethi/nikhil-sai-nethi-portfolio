import { SectionHeading } from "@/components/portfolio/SectionHeading";

const contactLinks = [
  {
    label: "Email",
    value: "nikhilsainethi@gmail.com",
    href: "mailto:nikhilsainethi@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/nikhilsainethi",
    href: "https://github.com/nikhilsainethi",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/nikhilsai",
    href: "https://www.linkedin.com/in/nikhilsai/",
  },
  {
    label: "Location",
    value: "Charlotte, NC",
    href: "https://www.google.com/maps/place/Charlotte,+NC/",
  },
];

export function Contact() {
  return (
    <section id="contact" className="section-rule py-16 sm:py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Contact"
        description="Open to conversations around platform engineering, observability, cloud-native delivery, and AI tooling that helps engineers move faster with less guesswork."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            className="card-hover rounded-[1.3rem] border border-border bg-surface p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href={link.href}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            target={link.href.startsWith("http") ? "_blank" : undefined}
          >
            <p className="mono-label text-[11px] text-muted">{link.label}</p>
            <p className="mt-3 text-base font-semibold text-foreground">{link.value}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
