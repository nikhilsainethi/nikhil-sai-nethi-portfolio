"use client";

import Image from "next/image";
import { withBasePath } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

type SkillGroup = { label: string; items: string[] };

const GROUPS: SkillGroup[] = [
  { label: "Languages", items: ["Python", "TypeScript", "Java", "Bash", "SQL"] },
  {
    label: "Cloud / Platform",
    items: ["AWS", "EKS", "Kubernetes", "Terraform", "Docker"],
  },
  {
    label: "Observability",
    items: ["Prometheus", "Grafana", "OpenTelemetry", "Datadog", "ELK"],
  },
  {
    label: "AI / LLM",
    items: ["RAG", "LangChain", "pgvector", "HyDE", "LangSmith"],
  },
  {
    label: "Data / Messaging",
    items: ["PostgreSQL", "Kafka", "Redis", "RabbitMQ", "MySQL"],
  },
];

const CERTS = [
  {
    code: "CKA",
    title: "Certified Kubernetes Administrator",
    issuer: "Linux Foundation",
    date: "Jun 2024",
    href: "https://www.credly.com/badges/55e7e691-b5df-4be7-87f4-da042a70b5b2",
  },
  {
    code: "AWS",
    title: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services",
    date: "Mar 2024",
    href: "https://www.credly.com/badges/2ef43aed-5ff7-46da-acb9-bab22d26b784",
  },
  {
    code: "CCNA",
    title: "Cisco Certified Network Associate",
    issuer: "Cisco",
    date: "Dec 2025",
    href: "https://www.credly.com/badges/5d44ead0-d834-459c-9431-4c8546c665c8",
  },
];

const EDUCATION: Array<{
  degree: string;
  school: string;
  logo: `/${string}`;
  location: string;
  period: string;
}> = [
  {
    degree: "MS in Computer Science",
    school: "Cal State University East Bay",
    logo: "/logos/csueb-seal.svg",
    location: "Hayward, CA",
    period: "Jan 2022 – Dec 2023",
  },
  {
    degree: "B.Tech",
    school: "Vellore Institute of Technology",
    logo: "/logos/vit-seal.svg",
    location: "Vellore, India",
    period: "2016 – 2021",
  },
];

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="above"
      style={{ background: "var(--sec2)", backdropFilter: "blur(4px)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1200, padding: "90px 32px" }}>
        <SectionHeading
          index="05 ·"
          eyebrow="Tech Stack"
          title="Capabilities"
          scramble
        />

        <div
          className="skills-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 10,
            marginBottom: 56,
          }}
        >
          {GROUPS.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.06}>
              <TiltCard
                className="card card-hover-glow h-full"
                style={{ padding: 20 }}
              >
                <p
                  className="mono-label"
                  style={{ color: "var(--amber)", marginBottom: 14 }}
                >
                  {group.label}
                </p>
                <div className="flex flex-col" style={{ gap: 7 }}>
                  {group.items.map((item) => (
                    <SkillPill key={item} label={item} />
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div
          className="cred-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr .9fr",
            gap: 20,
          }}
        >
          <Reveal>
            <div className="card" style={{ padding: "26px 28px" }}>
              <div
                className="flex items-center justify-between"
                style={{
                  marginBottom: 20,
                  paddingBottom: 18,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--fg)",
                  }}
                >
                  Active Credentials
                </p>
                <span
                  className="tag-dim"
                  style={{
                    fontSize: 10,
                    padding: "3px 11px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontFamily:
                      "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
                  }}
                >
                  {CERTS.length} total
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {CERTS.map((cert) => (
                  <a
                    key={cert.code}
                    href={cert.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "1.25rem",
                      padding: 16,
                      transition: "border-color .18s, background .18s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(0,229,199,.2)";
                      e.currentTarget.style.background = "var(--bg2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "var(--bg)";
                    }}
                  >
                    <span
                      className="tag"
                      style={{
                        marginBottom: 12,
                        fontSize: 10,
                        display: "inline-flex",
                      }}
                    >
                      {cert.code}
                    </span>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: 1.5,
                        marginBottom: 6,
                        color: "var(--fg)",
                      }}
                    >
                      {cert.title}
                    </p>
                    <p className="mono-label" style={{ fontSize: 9 }}>
                      {cert.issuer} · {cert.date}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--cyan)",
                        marginTop: 8,
                      }}
                    >
                      View badge ↗
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card" style={{ padding: "26px 28px" }}>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 20,
                  paddingBottom: 18,
                  borderBottom: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              >
                Academic Path
              </p>
              <div className="flex flex-col" style={{ gap: 12 }}>
                {EDUCATION.map((item) => (
                  <div
                    key={item.school}
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "1.25rem",
                      padding: 16,
                    }}
                  >
                    <div className="flex items-start" style={{ gap: 12 }}>
                      <div
                        className="flex flex-shrink-0 items-center justify-center overflow-hidden"
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: ".85rem",
                          background: "rgba(255,255,255,0.96)",
                          border: "1px solid rgba(255,255,255,0.16)",
                          boxShadow:
                            "0 8px 20px color-mix(in srgb, var(--fg) 10%, transparent)",
                          padding: 4,
                        }}
                      >
                        <Image
                          src={withBasePath(item.logo)}
                          alt={`${item.school} logo`}
                          width={52}
                          height={52}
                          unoptimized
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            marginBottom: 3,
                            color: "var(--fg)",
                          }}
                        >
                          {item.degree}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--muted2)",
                            marginBottom: 2,
                          }}
                        >
                          {item.school}
                        </p>
                        <p className="mono-label" style={{ fontSize: 9 }}>
                          {item.location} · {item.period}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SkillPill({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: "var(--muted2)",
        padding: "6px 10px",
        borderRadius: ".5rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        cursor: "default",
        transition: "color .15s, border-color .15s, background .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--cyan)";
        e.currentTarget.style.borderColor = "rgba(0,229,199,.22)";
        e.currentTarget.style.background = "rgba(0,229,199,.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--muted2)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface)";
      }}
    >
      {label}
    </div>
  );
}
