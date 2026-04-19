"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { heroPortraitPath, resumePath } from "@/lib/site";
import { MagneticButton } from "./MagneticButton";
import { Marquee } from "./Marquee";
import { TiltCard } from "./TiltCard";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

const ROLES = [
  "cloud infrastructure",
  "LLM observability",
  "platform reliability",
  "RAG systems",
];

const MARQUEE_ITEMS = [
  "EKS",
  "OpenTelemetry",
  "RAG",
  "LangChain",
  "pgvector",
  "Prometheus",
  "Grafana",
  "Kubernetes",
  "Python",
  "AWS",
  "LangSmith",
  "CCNA",
  "CKA",
  "Jenkins",
  "Terraform",
  "Datadog",
  "Resilience",
];

const STAT_CHIPS = [
  { label: "Current", value: "Moody's Corp" },
  { label: "Location", value: "Charlotte, NC" },
  { label: "Focus", value: "Platform Eng" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
  window.scrollTo({ top, behavior: "smooth" });
}

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const shouldSimplify = useShouldSimplifyMotion();

  useEffect(() => {
    const show = window.setTimeout(() => setMounted(true), 150);
    return () => window.clearTimeout(show);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setRoleIndex((n) => (n + 1) % ROLES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (shouldSimplify || reduceMotion) return;
    const onScroll = () => {
      const el = photoRef.current;
      if (!el) return;
      el.style.transform = `scale(1.08) translateY(${window.scrollY * 0.18}px)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldSimplify, reduceMotion]);

  const fade = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(20px)",
    transition: `opacity .7s ${delay}s cubic-bezier(.16,1,.3,1), transform .7s ${delay}s cubic-bezier(.16,1,.3,1)`,
  });

  return (
    <section
      id="hero"
      className="above flex flex-col"
      style={{ minHeight: "100vh", paddingTop: 80 }}
    >
      <TiltCard
        className="dot-grid hero-grid relative mx-3 mt-3 overflow-hidden"
        style={{
          flex: 1,
          borderRadius: "2rem",
          border: "1px solid var(--border2)",
          background: "var(--hero-bg, rgba(11,17,32,.85))",
          backdropFilter: "blur(2px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 45fr) minmax(0, 55fr)",
          minHeight: "calc(100vh - 112px)",
        }}
      >
        {/* Photo panel */}
        <div className="relative overflow-hidden">
          <div
            ref={photoRef}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              transform: "scale(1.08)",
              transition: "transform .1s linear",
              willChange: "transform",
            }}
          >
            <Image
              alt="Nikhil Sai Nethi"
              src={heroPortraitPath}
              fill
              priority
              sizes="(max-width: 700px) 100vw, 45vw"
              unoptimized
              style={{
                objectFit: "cover",
                objectPosition: "center top",
                filter: "contrast(1.05) saturate(.88)",
              }}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent 30%, rgba(11,17,32,.85) 100%), linear-gradient(to bottom, transparent 60%, rgba(11,17,32,.95) 100%)",
            }}
          />
          <div
            className="absolute bottom-7 left-5 flex flex-col gap-2"
            style={fade(1.0)}
          >
            {STAT_CHIPS.map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-2.5"
                style={{
                  background: "rgba(6,8,14,.9)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: ".8rem",
                  padding: "8px 14px",
                  backdropFilter: "blur(16px)",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 9,
                    color: "#00e5c7",
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                  }}
                >
                  {chip.label}
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#e8edf8" }}
                >
                  {chip.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Text panel */}
        <div
          className="flex flex-col justify-center"
          style={{ padding: "clamp(36px, 5vw, 64px)", gap: 28 }}
        >
          <div className="flex flex-wrap items-center gap-3" style={fade(0.3)}>
            <span
              className="inline-flex items-center gap-2"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--cyan)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--cyan)",
                  boxShadow: "0 0 8px var(--cyan)",
                  animation: "pulse-soft 2s infinite",
                  display: "inline-block",
                }}
              />
              Software Engineer
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--cyan)",
                background: "var(--cyan-dim)",
                border: "1px solid rgba(0,229,199,.28)",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--cyan)",
                  display: "inline-block",
                  animation: "pulse-soft 2s infinite",
                }}
              />
              Open to Opportunities
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--amber)",
                background: "rgba(248,124,46,.1)",
                border: "1px solid rgba(248,124,46,.28)",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--amber)",
                  display: "inline-block",
                }}
              />
              Open to Relocation
            </span>
          </div>

          <h1
            style={{
              fontWeight: 700,
              lineHeight: 0.92,
              letterSpacing: "-.045em",
              fontSize: "clamp(3rem, 5.5vw, 6rem)",
              color: "#dce8ff",
              ...fade(0.5),
            }}
          >
            Nikhil Sai
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
              Nethi.
            </span>
          </h1>

          <div
            className="flex flex-wrap items-center gap-2.5"
            style={fade(0.7)}
          >
            <span style={{ color: "rgba(180,200,240,.7)", fontSize: 17 }}>
              Building
            </span>
            <div
              style={{
                background: "color-mix(in srgb, var(--cyan) 11%, transparent)",
                border: "1px solid color-mix(in srgb, var(--cyan) 30%, transparent)",
                borderRadius: ".6rem",
                padding: "7px 16px",
                minWidth: 252,
                height: 38,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                key={roleIndex}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 16,
                  fontFamily:
                    "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 12,
                  color: "var(--cyan)",
                  filter: "brightness(.82)",
                  whiteSpace: "nowrap",
                  animation: "role-in .45s cubic-bezier(.16,1,.3,1) forwards",
                }}
              >
                {ROLES[roleIndex]}
                <span className="cursor-blink" style={{ marginLeft: 1 }}>
                  _
                </span>
              </span>
            </div>
            <span style={{ color: "rgba(180,200,240,.7)", fontSize: 17 }}>
              systems.
            </span>
          </div>

          <p
            style={{
              color: "rgba(220,232,255,.72)",
              fontSize: 15,
              lineHeight: 1.8,
              maxWidth: 440,
              ...fade(0.9),
            }}
          >
            Specializing in deep observability, reliable Kubernetes platforms,
            and practical AI integrations that make engineering teams faster and
            systems harder to break.
          </p>

          <div className="flex flex-wrap gap-3" style={fade(1.1)}>
            <MagneticButton>
              <button
                type="button"
                onClick={() => scrollToSection("experience")}
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "var(--amber)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "0 0 34px rgba(248,124,46,.3)",
                  transition: "background .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff9040";
                  e.currentTarget.style.boxShadow = "0 0 50px rgba(248,124,46,.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--amber)";
                  e.currentTarget.style.boxShadow = "0 0 34px rgba(248,124,46,.3)";
                }}
              >
                Explore Work ↓
              </button>
            </MagneticButton>
            <MagneticButton>
              <a
                href={resumePath}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.06)",
                  color: "#dce8ff",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,.13)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.06)";
                }}
              >
                Resume ↗
              </a>
            </MagneticButton>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute right-5 select-none pointer-events-none"
          style={{
            bottom: -10,
            fontSize: "18vw",
            fontWeight: 800,
            color: "var(--watermark)",
            fontFamily:
              "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
            lineHeight: 1,
          }}
        >
          01
        </div>
      </TiltCard>

      <div
        className="above mx-3"
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "13px 0",
          background: "color-mix(in srgb, var(--bg2) 70%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Marquee items={MARQUEE_ITEMS} />
      </div>
    </section>
  );
}
