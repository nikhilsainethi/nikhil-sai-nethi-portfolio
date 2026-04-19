"use client";

import { useCounter } from "./useCounter";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

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

export function AboutSection() {
  const [counterRef, count] = useCounter<HTMLDivElement>(99.99, 2);

  return (
    <section
      id="about"
      className="above"
      style={{ background: "var(--sec1)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: "90px 32px" }}
      >
        <SectionHeading
          index="02 ·"
          eyebrow="Philosophy"
          title={
            <>
              Code is easy.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, var(--cyan), #6ee7ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Operations
              </span>{" "}
              is hard.
            </>
          }
        />

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
            <div style={{ position: "sticky", top: 100 }}>
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
                style={{
                  padding: "28px 32px",
                  background: "var(--surface)",
                  border: "1px solid rgba(0,229,199,.14)",
                  borderRadius: "1.75rem",
                  boxShadow: "0 0 60px rgba(0,229,199,.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 700,
                    fontFamily:
                      "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                    letterSpacing: "-.04em",
                    background: "linear-gradient(135deg, var(--cyan), #6ee7ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                    lineHeight: 1,
                  }}
                >
                  {count.toFixed(2)}%
                </div>
                <p className="mono-label" style={{ marginTop: 10 }}>
                  Target Uptime
                </p>
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
