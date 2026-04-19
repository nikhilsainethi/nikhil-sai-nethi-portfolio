"use client";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

const HIGHLIGHTS = [
  {
    label: "Retrieval Stack",
    value: "Hybrid search · HyDE · RRF · reranking",
  },
  {
    label: "Primary Sources",
    value: "Confluence · runbooks · postmortems · tickets",
  },
  {
    label: "Operational Outcome",
    value: "Grounded, fast answers for on-call response",
  },
];

const STAT_BOXES = [
  {
    value: "~45%",
    detail: "Faster retrieval after optimization",
    color: "var(--cyan)",
  },
  {
    value: "RAG",
    detail: "Grounded answers from internal docs",
    color: "var(--amber)",
  },
];

const PROBLEM_SOLUTION = [
  {
    heading: "The Problem",
    body: "Engineering teams spending too much time in stale Confluence docs. Traditional keyword search failed on context and technical synonyms, slowing incident resolution.",
  },
  {
    heading: "The Solution",
    body: "Designed and shipped a RAG search engine using pgvector, hybrid retrieval, Hypothetical Document Embeddings (HyDE), Reciprocal Rank Fusion (RRF), and cross-encoder rerankers.",
  },
  {
    heading: "The Impact",
    body: "Improved search latency by ~45%. Empowered on-call engineers with a specialized assistant over runbooks and postmortems for rapid diagnosis.",
  },
];

const SUPPORTING = [
  {
    title: "LLM Observability Workflows",
    description:
      "Used LangChain, LangSmith, and OpenTelemetry traces to make prompt chains inspectable, grounded, and easier to debug during incident response.",
    tags: ["LangChain", "LangSmith", "OTel"],
  },
  {
    title: "Service Resilience Patterns",
    description:
      "Improved runtime resilience on Amazon EKS with retries, timeouts, circuit breakers, rate limiting, and on-call operational feedback loops.",
    tags: ["EKS", "Resilience", "On-call"],
  },
  {
    title: "Release Safety Automation",
    description:
      "Automated pre-deploy validation, smoke tests, canary checks, rollback automation, and drift detection using Python, Bash, Jenkins, and Git.",
    tags: ["Python", "Jenkins", "Automation"],
  },
];

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="above"
      style={{ background: "var(--sec1)", backdropFilter: "blur(4px)" }}
    >
      <div className="nsn-section">
        <SectionHeading
          index="04 ·"
          eyebrow="Projects"
          title="Selected Engineering Work"
          scramble
          sub="A flagship case study plus supporting engineering logs spanning observability, resilience, and AI applications grounded in production needs."
        />

        <Reveal>
          <TiltCard
            className="card"
            style={{
              padding: "32px 36px",
              marginBottom: 20,
              borderColor: "rgba(0,229,199,.13)",
              boxShadow: "0 0 80px rgba(0,229,199,.05)",
            }}
          >
            <div
              className="proj-main"
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr .9fr",
                gap: 44,
                alignItems: "start",
              }}
            >
              <div>
                <span
                  className="tag-amber"
                  style={{
                    fontSize: 10,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    marginBottom: 18,
                    display: "inline-flex",
                    padding: "3px 10px",
                  }}
                >
                  Flagship Project
                </span>
                <h3
                  style={{
                    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                    fontWeight: 700,
                    letterSpacing: "-.04em",
                    lineHeight: 1.1,
                    marginTop: 12,
                    marginBottom: 28,
                    color: "var(--fg)",
                  }}
                >
                  Internal RAG
                  <br />
                  Search Engine
                </h3>
                {PROBLEM_SOLUTION.map((section) => (
                  <div key={section.heading} style={{ marginBottom: 18 }}>
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "var(--fg)",
                      }}
                    >
                      {section.heading}
                    </h4>
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.78,
                        color: "var(--muted2)",
                      }}
                    >
                      {section.body}
                    </p>
                  </div>
                ))}
                <div
                  className="flex flex-wrap"
                  style={{ gap: 6, marginTop: 22 }}
                >
                  {["pgvector", "LangChain", "HyDE", "RRF", "S3", "Lambda"].map(
                    (tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col" style={{ gap: 12 }}>
                <div
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "1.25rem",
                    padding: "20px 24px",
                  }}
                >
                  <p
                    className="mono-label"
                    style={{ color: "var(--cyan)", marginBottom: 16 }}
                  >
                    System Highlights
                  </p>
                  {HIGHLIGHTS.map((item, i) => (
                    <div
                      key={item.label}
                      style={{
                        padding: "10px 0",
                        borderBottom:
                          i < HIGHLIGHTS.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                      }}
                    >
                      <p
                        className="mono-label"
                        style={{ fontSize: 9, marginBottom: 5 }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "var(--fg)",
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {STAT_BOXES.map((box) => (
                    <div
                      key={box.value}
                      style={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                        borderRadius: "1.25rem",
                        padding: 16,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 26,
                          fontWeight: 700,
                          fontFamily:
                            "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                          color: box.color,
                          letterSpacing: "-.04em",
                          lineHeight: 1,
                        }}
                      >
                        {box.value}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        {box.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        <div
          className="proj-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {SUPPORTING.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <TiltCard
                className="card card-hover-glow h-full"
                style={{
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  className="tag-amber"
                  style={{
                    fontSize: 9,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                    display: "inline-flex",
                    padding: "3px 10px",
                    alignSelf: "flex-start",
                  }}
                >
                  Engineering Log
                </span>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: "-.025em",
                    marginBottom: 10,
                    color: "var(--fg)",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: "var(--muted2)",
                    marginBottom: 16,
                    flex: 1,
                  }}
                >
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
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
    </section>
  );
}
