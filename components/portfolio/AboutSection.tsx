"use client";

import { useEffect, useRef, useState } from "react";
import { useCounter } from "./useCounter";
import { Reveal } from "./Reveal";
import { ScrambleHeading } from "./ScrambleHeading";
import { TiltCard } from "./TiltCard";
import { UptimeSparkline } from "./UptimeSparkline";

const LOGS = [
  {
    title: "LLM Observability Workflows",
    tags: ["LangChain", "LangSmith", "OTel"],
    n: "01",
  },
  {
    title: "Service Resilience Patterns",
    tags: ["EKS", "Resilience", "On-call"],
    n: "02",
  },
  {
    title: "Release Safety Automation",
    tags: ["Python", "Jenkins", "Automation"],
    n: "03",
  },
];

const HEADLINE_LINE_1 = ["Code", "is", "easy."];
const HEADLINE_LINE_2_PREFIX = "";
const HEADLINE_LINE_2_KEY = "Operations";
const HEADLINE_LINE_2_SUFFIX = ["is", "hard."];

export function AboutSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [headlineArmed, setHeadlineArmed] = useState(false);
  const [counterRef, count] = useCounter<HTMLDivElement>(99.99, 2, 1800);
  const [sparkProgress, setSparkProgress] = useState(0);
  const [sparkActive, setSparkActive] = useState(false);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadlineArmed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Drive sparkline progress alongside the counter for ~1.8s, then leave it
  // animating gently to suggest "live" telemetry.
  useEffect(() => {
    if (!headlineArmed) return;
    const start = performance.now();
    const duration = 1800;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setSparkProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setSparkActive(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [headlineArmed]);

  return (
    <section
      id="about"
      className="above"
      style={{ background: "var(--sec1)", backdropFilter: "blur(4px)" }}
    >
      <div className="nsn-section">
        <Reveal>
          <div style={{ marginBottom: 56 }}>
            <div
              className="flex items-center"
              style={{ gap: 12, marginBottom: 14 }}
            >
              <span
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  color: "var(--amber)",
                  letterSpacing: ".2em",
                }}
              >
                02 ·
              </span>
              <span
                aria-hidden="true"
                style={{ width: 28, height: 1, background: "var(--border2)" }}
              />
              <span className="mono-label">Philosophy</span>
            </div>
            <h2
              ref={headlineRef}
              className={`section-heading-title about-headline${headlineArmed ? " is-armed" : ""}`}
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                fontWeight: 700,
                letterSpacing: "-.04em",
                lineHeight: 1.05,
                color: "var(--fg)",
              }}
            >
              <span className="about-headline__line">
                {HEADLINE_LINE_1.map((w, i) => (
                  <span
                    key={i}
                    className="about-headline__word"
                    style={{ ["--word-i" as string]: i }}
                  >
                    {w}
                  </span>
                ))}
              </span>
              <span className="about-headline__line">
                {HEADLINE_LINE_2_PREFIX}
                <span
                  className="about-headline__word about-headline__word--key"
                  style={{
                    ["--word-i" as string]: HEADLINE_LINE_1.length,
                    background:
                      "linear-gradient(135deg, var(--cyan), #6ee7ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {headlineArmed ? (
                    <ScrambleHeading text={HEADLINE_LINE_2_KEY} />
                  ) : (
                    HEADLINE_LINE_2_KEY
                  )}
                  <span className="about-headline__underline" aria-hidden="true" />
                </span>{" "}
                {HEADLINE_LINE_2_SUFFIX.map((w, i) => (
                  <span
                    key={i}
                    className="about-headline__word"
                    style={{ ["--word-i" as string]: HEADLINE_LINE_1.length + 1 + i }}
                  >
                    {w}
                  </span>
                ))}
              </span>
            </h2>
          </div>
        </Reveal>

        <div
          className="about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          <Reveal direction="left">
            <div className="about-sticky" style={{ position: "sticky", top: 100 }}>
              <p
                style={{
                  color: "var(--muted2)",
                  fontSize: 16,
                  lineHeight: 1.85,
                  marginBottom: 20,
                }}
              >
                I started out building features, but quickly realized the real
                challenge isn&apos;t writing the code — it&apos;s keeping it
                running. I pivot between distributed backend services and the
                platforms they run on.
              </p>
              <p
                style={{
                  color: "var(--muted2)",
                  fontSize: 16,
                  lineHeight: 1.85,
                  marginBottom: 36,
                }}
              >
                Right now building internal LLM tools and RAG systems at
                Moody&apos;s, wrapping everything in heavy observability to
                ensure we don&apos;t just ship AI — we ship it reliably.
              </p>
              <div
                ref={counterRef}
                className="uptime-card"
                style={{
                  padding: "22px 26px",
                  background: "var(--surface)",
                  border: "1px solid rgba(0,229,199,.14)",
                  borderRadius: "1.25rem",
                  boxShadow: "0 0 60px rgba(0,229,199,.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div className="uptime-card__head">
                  <span className="mono-label uptime-card__label">
                    UPTIME / TARGET
                  </span>
                  <span className="uptime-card__status">
                    <span className="uptime-card__dot" /> LIVE
                  </span>
                </div>
                <div className="uptime-card__value-row">
                  <div
                    className="about-counter-value uptime-card__value"
                    style={{
                      fontSize: 52,
                      fontWeight: 700,
                      fontFamily:
                        "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                      letterSpacing: "-.04em",
                      background:
                        "linear-gradient(135deg, var(--cyan), #6ee7ff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                      lineHeight: 1,
                    }}
                  >
                    {count.toFixed(2)}%
                  </div>
                  <div className="uptime-card__spark">
                    <UptimeSparkline
                      progress={sparkProgress}
                      active={sparkActive}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col" style={{ gap: 14 }}>
            {LOGS.map((log, i) => (
              <Reveal key={log.title} delay={i * 0.1}>
                <TiltCard
                  className="card card-hover-glow"
                  style={{ padding: "22px 26px" }}
                >
                  <div
                    className="flex items-start justify-between"
                    style={{ marginBottom: 10 }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                        fontSize: 32,
                        fontWeight: 700,
                        color: "rgba(0,229,199,.08)",
                        letterSpacing: "-.06em",
                        lineHeight: 1,
                      }}
                    >
                      {log.n}
                    </span>
                    <span className="mono-label" style={{ fontSize: 9 }}>
                      Engineering Log
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: "-.025em",
                      marginBottom: 12,
                      color: "var(--fg)",
                    }}
                  >
                    {log.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {log.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
