"use client";

import Image from "next/image";
import { withBasePath } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

type ExperienceEntry = {
  company: string;
  mark: string;
  logo: `/${string}`;
  role: string;
  period: string;
  location: string;
  current: boolean;
  tags: string[];
  bullets: string[];
};

const EXPERIENCES: ExperienceEntry[] = [
  {
    company: "Moody's Corporation",
    mark: "MO",
    logo: "/logos/moodys-wordmark.svg",
    role: "Software Engineer",
    period: "Aug 2024 – Present",
    location: "Charlotte, NC",
    current: true,
    tags: ["EKS", "RAG", "LangChain", "Prometheus", "OTel"],
    bullets: [
      "Supported on-call for production services on Linux and Amazon EKS, handling incident response, root-cause analysis, and follow-through via structured runbooks and blameless postmortems.",
      "Designed and shipped an internal RAG search engine over Confluence using pgvector, hybrid retrieval, HyDE, reciprocal rank fusion, and reranking — improving latency by ~45%.",
      "Built observability with Prometheus, Grafana, Datadog, and OpenTelemetry, including SLI/SLO dashboards, alert rules, structured logs, and distributed tracing.",
      "Built LLM observability and troubleshooting workflows with LangChain, LangSmith, and OTel to generate grounded triage steps and incident summaries.",
    ],
  },
  {
    company: "Verisk Analytics",
    mark: "VE",
    logo: "/logos/verisk-wordmark.svg",
    role: "Software Dev Co-op",
    period: "Sep – Dec 2023",
    location: "Boston, MA",
    current: false,
    tags: ["AWS", "C#", "S3", "Lambda"],
    bullets: [
      "Contributed to a legacy application migration using S3, Lambda, CloudWatch, DynamoDB, SQS, Step Functions, and Redshift with C#.",
      "Added unit and integration tests while partnering with cross-functional teams to strengthen migration workflows and release confidence.",
    ],
  },
  {
    company: "Nokia Solutions & Networks",
    mark: "NK",
    logo: "/logos/nokia-brand.svg",
    role: "Software Engineer",
    period: "Sep 2020 – Dec 2021",
    location: "Bangalore, India",
    current: false,
    tags: ["Kubernetes", "Python", "Docker", "Automation"],
    bullets: [
      "Built Python wrappers across hundreds of Broadcom C APIs and CPRI communication paths on Nokia's Front Haul Gateway platform.",
      "Debugged and resolved 150+ Layer 2/3 networking bugs using packet analysis, tcpdump, MTR, and kernel logs.",
      "Deployed Docker-based test environments and managed Kubernetes pods across 18 subsystems for integration testing.",
    ],
  },
];

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="above"
      style={{ background: "var(--sec2)", backdropFilter: "blur(4px)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1200, padding: "90px 32px" }}>
        <SectionHeading
          index="03 ·"
          eyebrow="Experience"
          title="Work History"
          scramble
          sub="A focused timeline of infrastructure, observability, and platform work spanning production reliability, cloud migration, and AI-enabled engineering."
        />

        <div className="flex flex-col" style={{ gap: 20 }}>
          {EXPERIENCES.map((exp, i) => (
            <Reveal key={exp.company} delay={i * 0.07}>
              <TiltCard
                className="card card-hover-glow"
                style={{
                  padding: "28px 32px",
                  position: "relative",
                  overflow: "hidden",
                  ...(exp.current
                    ? {
                        borderColor: "rgba(0,229,199,.16)",
                        boxShadow: "0 0 60px rgba(0,229,199,.05)",
                      }
                    : {}),
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none select-none"
                  style={{
                    right: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily:
                      "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 88,
                    fontWeight: 800,
                    color: "var(--watermark)",
                    letterSpacing: "-.1em",
                    lineHeight: 1,
                  }}
                >
                  {exp.mark}
                </div>

                <div
                  className="flex flex-wrap items-start justify-between"
                  style={{ marginBottom: 18, gap: 12 }}
                >
                  <div className="flex items-start" style={{ gap: 16 }}>
                    <div
                      className="flex flex-shrink-0 items-center justify-center overflow-hidden"
                      style={{
                        width: 92,
                        height: 56,
                        borderRadius: "0.9rem",
                        padding: 8,
                        background: "rgba(255,255,255,0.92)",
                        border: `1px solid ${
                          exp.current
                            ? "rgba(0,229,199,.22)"
                            : "rgba(255,255,255,0.14)"
                        }`,
                        boxShadow:
                          "0 8px 22px color-mix(in srgb, var(--fg) 10%, transparent)",
                      }}
                    >
                      <Image
                        src={withBasePath(exp.logo)}
                        alt={`${exp.company} logo`}
                        width={160}
                        height={60}
                        unoptimized
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div>
                      {exp.current && (
                        <div
                          className="flex items-center"
                          style={{ gap: 6, marginBottom: 7 }}
                        >
                          <span
                            aria-hidden="true"
                            className="relative inline-flex items-center justify-center"
                            style={{ width: 7, height: 7 }}
                          >
                            <span
                              className="absolute"
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                background: "#22c55e",
                                animation:
                                  "ping-slow 1.4s cubic-bezier(0,0,.2,1) infinite",
                              }}
                            />
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#22c55e",
                                display: "block",
                                boxShadow: "0 0 8px #22c55e",
                              }}
                            />
                          </span>
                          <span
                            className="mono-label"
                            style={{ color: "#22c55e", fontSize: 9 }}
                          >
                            Current
                          </span>
                        </div>
                      )}
                      <h3
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          letterSpacing: "-.03em",
                          marginBottom: 4,
                          color: "var(--fg)",
                        }}
                      >
                        {exp.company}
                      </h3>
                      <p
                        style={{
                          fontFamily:
                            "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                          fontSize: 12,
                          color: "var(--cyan)",
                        }}
                      >
                        {exp.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mono-label" style={{ marginBottom: 4 }}>
                      {exp.period}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--muted2)",
                      }}
                    >
                      {exp.location}
                    </p>
                  </div>
                </div>

                <div
                  className="flex flex-wrap"
                  style={{ gap: 6, marginBottom: 20 }}
                >
                  {exp.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <ul
                  className="exp-ul"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      exp.bullets.length > 2
                        ? "repeat(auto-fit, minmax(280px, 1fr))"
                        : "1fr",
                    gap: "8px 24px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {exp.bullets.map((bullet, j) => (
                    <li
                      key={j}
                      className="flex"
                      style={{
                        gap: 10,
                        fontSize: 13,
                        lineHeight: 1.75,
                        color: "var(--muted2)",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          color: "var(--amber)",
                          marginTop: 7,
                          flexShrink: 0,
                          fontSize: 5,
                        }}
                      >
                        ◆
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
