"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { withBasePath } from "@/lib/site";
import {
  ExperienceTimeline,
  type TimelineRole,
} from "./ExperienceTimeline";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

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
  const shouldSimplify = useShouldSimplifyMotion();
  return shouldSimplify ? <VerticalExperience /> : <PinnedExperience />;
}

/* ─── Pinned horizontal variant (desktop) ───────────────────── */

function PinnedExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Start: first card flush with left gutter.
  // End: last card flush with right edge.
  // With 3 cards the translation is roughly the track width minus one viewport.
  const xRaw = useTransform(scrollYProgress, [0.05, 0.95], ["0vw", "-132vw"]);
  const x = useSpring(xRaw, { stiffness: 140, damping: 28, mass: 0.4 });

  // Watermark parallax: positive counter-translate so watermarks lag the cards.
  const watermarkX = useTransform(scrollYProgress, [0.05, 0.95], ["0vw", "44vw"]);

  const timelineRoles: TimelineRole[] = [
    { mark: "MO", label: "MOODY'S", startYear: 2024 + 7 / 12, endYear: null, current: true },
    { mark: "VE", label: "VERISK", startYear: 2023 + 8 / 12, endYear: 2023 + 11 / 12 },
    { mark: "NK", label: "NOKIA", startYear: 2020 + 8 / 12, endYear: 2021 + 11 / 12 },
  ];

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="above"
      style={{
        background: "var(--sec2)",
        backdropFilter: "blur(4px)",
        height: "320vh",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="mx-auto w-full"
          style={{ maxWidth: 1400, padding: "90px 32px 28px" }}
        >
          <div className="exp-heading-row">
            <SectionHeading
              index="03 ·"
              eyebrow="Experience · Horizontal scroll"
              title="Work History"
              scramble
              sub="Scroll to pan across roles. Infrastructure, observability, and platform work spanning production reliability, cloud migration, and AI-enabled engineering."
            />
            <div className="exp-console-chip" aria-hidden="true">
              <span className="exp-console-chip__bracket">[</span>
              <span className="exp-console-chip__dot" />
              <span className="exp-console-chip__label">TIMELINE</span>
              <span className="exp-console-chip__divider" />
              <span className="exp-console-chip__range">
                {Math.floor(timelineRoles[timelineRoles.length - 1].startYear)} →{" "}
                {new Date().getFullYear()}
              </span>
              <span className="exp-console-chip__bracket">]</span>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              x,
              display: "flex",
              gap: "2.5vw",
              paddingLeft: "3vw",
              paddingRight: "3vw",
              alignItems: "stretch",
            }}
          >
            {EXPERIENCES.map((exp, i) => (
              <HorizontalCard
                key={exp.company}
                exp={exp}
                index={i}
                watermarkX={watermarkX}
              />
            ))}
          </motion.div>
        </div>

        <div className="mx-auto w-full" style={{ maxWidth: 1400, padding: "0 32px 28px" }}>
          <ExperienceTimeline
            scrollYProgress={scrollYProgress}
            roles={timelineRoles}
            startYear={2020}
            endYear={new Date().getFullYear() + 0.6}
          />
        </div>
      </div>
    </section>
  );
}

function HorizontalCard({
  exp,
  index,
  watermarkX,
}: {
  exp: ExperienceEntry;
  index: number;
  watermarkX: MotionValue<string>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, {
    margin: "0px -38% 0px -38%",
    once: false,
  });

  return (
    <div
      ref={cardRef}
      className={`exp-card-shell${inView ? " is-centered" : ""}`}
      style={{ flexShrink: 0 }}
    >
      <TiltCard
        className="card exp-card"
        style={{
          width: "72vw",
          maxWidth: 1080,
          minWidth: 560,
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          borderColor: exp.current ? "rgba(0,229,199,.22)" : undefined,
          boxShadow: exp.current ? "0 0 60px rgba(0,229,199,.06)" : undefined,
        }}
      >
        <span className="exp-card__edge" aria-hidden="true" />
        <motion.div
          aria-hidden="true"
          className="section-watermark-mark absolute pointer-events-none select-none"
          style={{
            x: watermarkX,
            right: 24,
            top: "50%",
            y: "-50%",
            fontFamily:
              "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
            fontSize: "clamp(96px, 14vw, 220px)",
            fontWeight: 800,
            color: "var(--watermark)",
            letterSpacing: "-.1em",
            lineHeight: 1,
          }}
        >
          {exp.mark}
        </motion.div>

      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          left: 24,
          top: 20,
          fontFamily:
            "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: ".22em",
          color: "var(--amber)",
          textTransform: "uppercase",
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(EXPERIENCES.length).padStart(2, "0")}
      </div>

      <div
        className="flex flex-wrap items-start justify-between"
        style={{ marginTop: 20, marginBottom: 18, gap: 12 }}
      >
        <div className="flex items-start" style={{ gap: 16 }}>
          <div
            className="flex flex-shrink-0 items-center justify-center overflow-hidden"
            style={{
              width: 112,
              height: 64,
              borderRadius: "0.9rem",
              padding: 10,
              background: "rgba(255,255,255,0.94)",
              border: `1px solid ${
                exp.current ? "rgba(0,229,199,.22)" : "rgba(255,255,255,0.16)"
              }`,
              boxShadow:
                "0 10px 24px color-mix(in srgb, var(--fg) 10%, transparent)",
            }}
          >
            <Image
              src={withBasePath(exp.logo)}
              alt={`${exp.company} logo`}
              width={200}
              height={70}
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
                      animation: "ping-slow 1.4s cubic-bezier(0,0,.2,1) infinite",
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
                fontSize: 22,
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
          <p style={{ fontSize: 13, color: "var(--muted2)" }}>
            {exp.location}
          </p>
        </div>
      </div>

      <div
        className="exp-card__tags flex flex-wrap"
        style={{ gap: 6, marginBottom: 18, position: "relative", zIndex: 1 }}
      >
        {exp.tags.map((tag, ti) => (
          <span
            key={tag}
            className="exp-card__tag tag"
            style={{ ["--ti" as string]: ti }}
          >
            {tag}
          </span>
        ))}
      </div>

      <ul
        className="exp-card__bullets"
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
            className="exp-card__bullet"
            style={{
              ["--bi" as string]: j,
              fontSize: 13,
              lineHeight: 1.75,
              color: "var(--muted2)",
            }}
          >
            <span className="exp-card__bullet-dash" aria-hidden="true" />
            <span className="exp-card__bullet-text">{bullet}</span>
          </li>
        ))}
      </ul>
      </TiltCard>
    </div>
  );
}

/* ─── Fallback vertical variant (mobile / reduced motion) ──── */

function VerticalExperience() {
  return (
    <section
      id="experience"
      className="above"
      style={{ background: "var(--sec2)", backdropFilter: "blur(4px)" }}
    >
      <div className="nsn-section">
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
                  padding: "24px 26px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  className="flex flex-wrap items-start justify-between"
                  style={{ marginBottom: 16, gap: 12 }}
                >
                  <div className="flex items-start" style={{ gap: 14 }}>
                    <div
                      className="flex flex-shrink-0 items-center justify-center overflow-hidden"
                      style={{
                        width: 92,
                        height: 56,
                        borderRadius: "0.9rem",
                        padding: 8,
                        background: "rgba(255,255,255,0.94)",
                        border: "1px solid rgba(255,255,255,0.14)",
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
                          style={{ gap: 6, marginBottom: 6 }}
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
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: "-.03em",
                          marginBottom: 3,
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
                  <div>
                    <p className="mono-label" style={{ marginBottom: 4 }}>
                      {exp.period}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--muted2)" }}>
                      {exp.location}
                    </p>
                  </div>
                </div>
                <div
                  className="flex flex-wrap"
                  style={{ gap: 6, marginBottom: 14 }}
                >
                  {exp.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <ul style={{ display: "grid", gap: 6 }}>
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
