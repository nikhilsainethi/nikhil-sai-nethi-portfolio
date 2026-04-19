"use client";

import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";

const LINKS = [
  {
    label: "Email",
    value: "nikhilsainethi@gmail.com",
    href: "mailto:nikhilsainethi@gmail.com",
    symbol: "✉",
  },
  {
    label: "GitHub",
    value: "github.com/nikhilsainethi",
    href: "https://github.com/nikhilsainethi",
    symbol: "⌨",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/nikhilsai",
    href: "https://www.linkedin.com/in/nikhilsai/",
    symbol: "⬡",
  },
  {
    label: "Location",
    value: "Charlotte, NC",
    href: "https://www.google.com/maps/place/Charlotte,+NC",
    symbol: "◎",
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="above"
      style={{ background: "var(--sec1)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="mx-auto text-center"
        style={{ maxWidth: 1200, padding: "90px 32px" }}
      >
        <Reveal>
          <p
            className="mono-label"
            style={{ color: "var(--amber)", marginBottom: 20 }}
          >
            06 · Next Steps
          </p>
          <h2
            style={{
              fontSize: "clamp(3.5rem, 9vw, 9rem)",
              fontWeight: 800,
              letterSpacing: "-.055em",
              lineHeight: 0.92,
              marginBottom: 26,
              color: "var(--fg)",
            }}
          >
            Ready to
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--cyan) 0%, #6ee7ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              scale?
            </span>
          </h2>
          <p
            style={{
              color: "var(--muted2)",
              fontSize: 18,
              lineHeight: 1.75,
              maxWidth: 540,
              margin: "0 auto 44px",
            }}
          >
            Open to roles in platform engineering, observability, cloud-native
            delivery, and AI tooling that helps engineers move faster.
          </p>
          <MagneticButton>
            <a
              href="mailto:nikhilsainethi@gmail.com"
              className="inline-flex items-center"
              style={{
                gap: 10,
                padding: "18px 40px",
                borderRadius: 999,
                background: "var(--amber)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 0 60px rgba(248,124,46,.25)",
                transition: "transform .15s, box-shadow .15s",
                marginBottom: 56,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow =
                  "0 0 80px rgba(248,124,46,.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow =
                  "0 0 60px rgba(248,124,46,.25)";
              }}
            >
              Start a Conversation →
            </a>
          </MagneticButton>
          <div className="flex flex-wrap justify-center" style={{ gap: 10 }}>
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="flex items-center"
                style={{
                  gap: 10,
                  padding: "11px 18px",
                  borderRadius: ".9rem",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  fontSize: 13,
                  color: "var(--muted2)",
                  transition:
                    "border-color .15s, color .15s, background .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,229,199,.2)";
                  e.currentTarget.style.color = "var(--fg)";
                  e.currentTarget.style.background = "var(--surface2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--muted2)";
                  e.currentTarget.style.background = "var(--surface)";
                }}
              >
                <span aria-hidden="true" style={{ color: "var(--cyan)" }}>
                  {link.symbol}
                </span>
                <span>{link.value}</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
