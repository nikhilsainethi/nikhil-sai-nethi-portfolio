import Link from "next/link";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa6";
import { primaryNavItems } from "@/lib/site";

const socialLinks = [
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
    <footer className="mx-auto mt-10 w-full max-w-6xl border-t border-border/70 pt-8 pb-6 text-sm text-muted">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        {/* Brand + tagline */}
        <div className="space-y-3">
          <p className="mono-label text-sm text-accent">Nikhil Sai Nethi</p>
          <p className="max-w-xs text-sm leading-6 text-muted">
            Building resilient systems, observable platforms, and grounded AI tooling
            for engineering teams.
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/65 text-muted transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  href={link.href}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <p className="mono-label mb-3 text-[10px] text-muted">Navigation</p>
          <ul className="space-y-2">
            {primaryNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="text-sm text-muted transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact callout */}
        <div className="space-y-3">
          <p className="mono-label text-[10px] text-muted">Get in Touch</p>
          <p className="max-w-[14rem] text-sm leading-6 text-muted">
            Open to SWE, infrastructure, and AI/LLM engineering roles.
          </p>
          <a
            href="mailto:nikhilsainethi@gmail.com"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            nikhilsainethi@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-8 border-t border-border/50 pt-5">
        <p className="text-xs text-muted/60">
          © {new Date().getFullYear()} Nikhil Sai Nethi · Built with Next.js &amp; Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
