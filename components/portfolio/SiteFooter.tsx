import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa6";

const footerLinks = [
  {
    href: "mailto:nikhilsainethi@gmail.com",
    label: "Email",
    icon: FaEnvelope,
  },
  {
    href: "https://github.com/nikhilsainethi",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: "https://www.linkedin.com/in/nikhilsai/",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-5 border-t border-border/70 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mono-label text-sm text-accent">Nikhil Sai Nethi</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
          Building resilient systems, observable platforms, and grounded AI tooling
          for engineering teams.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {footerLinks.map((link) => {
          const Icon = link.icon;

          return (
            <a
              key={link.label}
              aria-label={link.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/65 text-accent transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              href={link.href}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              target={link.href.startsWith("http") ? "_blank" : undefined}
            >
              <Icon size={16} />
            </a>
          );
        })}
      </div>
    </footer>
  );
}
