"use client";

import { useEffect, useState } from "react";
import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";

const LINKS = [
  {
    code: "MAIL",
    label: "Email",
    value: "nikhilsainethi@gmail.com",
    href: "mailto:nikhilsainethi@gmail.com",
  },
  {
    code: "REPO",
    label: "GitHub",
    value: "github.com/nikhilsainethi",
    href: "https://github.com/nikhilsainethi",
  },
  {
    code: "LINK",
    label: "LinkedIn",
    value: "linkedin.com/in/nikhilsai",
    href: "https://www.linkedin.com/in/nikhilsai/",
  },
];

function formatCharlotteTime(now: Date) {
  // Display Charlotte, NC time (US Eastern) regardless of the viewer's locale.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return fmt.format(now);
}

function formatTzOffset(now: Date) {
  // Compute the Charlotte UTC offset for the current instant. Handles DST.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  });
  const parts = fmt.formatToParts(now);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
  return tz.replace("GMT", "UTC");
}

export function ContactSection() {
  const [clock, setClock] = useState("--:--:--");
  const [offset, setOffset] = useState("UTC");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(formatCharlotteTime(now));
      setOffset(formatTzOffset(now));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="contact"
      className="above"
      style={{ background: "var(--sec1)", backdropFilter: "blur(4px)" }}
    >
      <div className="nsn-section text-center">
        <Reveal>
          <p
            className="mono-label"
            style={{ color: "var(--amber)", marginBottom: 20 }}
          >
            06 · Next Steps
          </p>
          <h2
            className="ready-to-scale"
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
                background:
                  "linear-gradient(135deg, var(--cyan) 0%, #6ee7ff 100%)",
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
              margin: "0 auto 40px",
            }}
          >
            Open to roles in platform engineering, observability, cloud-native
            delivery, and AI tooling that helps engineers move faster.
          </p>

          <div className="operator-status" aria-label="Operator status">
            <header className="operator-status__head">
              <span className="operator-status__dot" />
              <span className="operator-status__heading">
                OPERATOR · STATUS
              </span>
              <span className="operator-status__divider" />
              <span className="operator-status__id">NSN-001</span>
              <span className="operator-status__spacer" />
              <span className="operator-status__sync">
                LAST SYNC <b>{clock}</b>
              </span>
            </header>
            <div className="operator-status__grid">
              <StatusCell
                label="AVAILABILITY"
                value="OPEN"
                detail="for full-time roles"
                tone="positive"
              />
              <StatusCell
                label="LOCAL · CLT"
                value={clock}
                detail={`${offset} · Charlotte, NC`}
                tone="neutral"
                mono
              />
              <StatusCell
                label="DOMAIN · FOCUS"
                value="PLATFORM"
                detail="obs / k8s / AI tooling"
                tone="neutral"
              />
              <StatusCell
                label="RESPONSE · TIME"
                value="< 24h"
                detail="weekdays · EDT"
                tone="neutral"
                mono
              />
            </div>
          </div>

          <MagneticButton>
            <a
              href="mailto:nikhilsainethi@gmail.com"
              className="contact-cta"
            >
              <span className="contact-cta__bracket">[</span>
              <span className="contact-cta__action">START · CONVERSATION</span>
              <span className="contact-cta__arrow">→</span>
              <span className="contact-cta__bracket">]</span>
            </a>
          </MagneticButton>

          <div className="contact-channels" role="list">
            {LINKS.map((link) => (
              <a
                key={link.code}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="contact-channel"
                role="listitem"
              >
                <span className="contact-channel__code">{link.code}</span>
                <span className="contact-channel__bar" />
                <span className="contact-channel__value">{link.value}</span>
                <span className="contact-channel__arrow">↗</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatusCell({
  label,
  value,
  detail,
  tone = "neutral",
  mono = false,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "positive";
  mono?: boolean;
}) {
  return (
    <div
      className={`operator-status__cell operator-status__cell--${tone}${mono ? " is-mono" : ""}`}
    >
      <span className="operator-status__label">{label}</span>
      <span className="operator-status__value">{value}</span>
      <span className="operator-status__detail">{detail}</span>
    </div>
  );
}
