"use client";

import { ProjectsTrace } from "./ProjectsTrace";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

const HIGHLIGHTS = [
  { label: "RETRIEVAL", value: "Hybrid · HyDE · RRF · cross-encoder" },
  { label: "SOURCES", value: "Confluence · runbooks · postmortems" },
  { label: "OUTCOME", value: "Grounded answers for on-call" },
];

const PROBLEM_SOLUTION = [
  {
    heading: "Problem",
    body: "Engineering teams burned cycles in stale Confluence docs. Keyword search failed on context and technical synonyms, dragging incident resolution.",
  },
  {
    heading: "Solution",
    body: "Shipped a RAG search engine using pgvector, hybrid retrieval, Hypothetical Document Embeddings (HyDE), Reciprocal Rank Fusion, and cross-encoder rerankers.",
  },
  {
    heading: "Impact",
    body: "~45% lower search latency. On-call engineers now triage with a specialized assistant over runbooks and postmortems.",
  },
];

const SUPPORTING = [
  {
    code: "LOG.01",
    title: "LLM Observability Workflows",
    description:
      "Used LangChain, LangSmith, and OpenTelemetry traces to make prompt chains inspectable, grounded, and easier to debug during incident response.",
    tags: ["LangChain", "LangSmith", "OTel"],
  },
  {
    code: "LOG.02",
    title: "Service Resilience Patterns",
    description:
      "Improved runtime resilience on Amazon EKS with retries, timeouts, circuit breakers, rate limiting, and on-call operational feedback loops.",
    tags: ["EKS", "Resilience", "On-call"],
  },
  {
    code: "LOG.03",
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
          <article className="proj-flagship">
            <div className="proj-flagship__head">
              <span className="proj-flagship__tag">[ FLAGSHIP · PROJECT ]</span>
              <span className="proj-flagship__id">PROJ-001</span>
            </div>

            <div className="proj-flagship__grid">
              <div className="proj-flagship__main">
                <h3 className="proj-flagship__title">
                  Internal RAG
                  <br />
                  Search Engine
                </h3>
                {PROBLEM_SOLUTION.map((section) => (
                  <div key={section.heading} className="proj-flagship__row">
                    <p className="proj-flagship__row-label">
                      <span className="proj-flagship__row-tick" />
                      {section.heading}
                    </p>
                    <p className="proj-flagship__row-body">{section.body}</p>
                  </div>
                ))}
                <div className="proj-flagship__tags">
                  {["pgvector", "LangChain", "HyDE", "RRF", "S3", "Lambda"].map(
                    (tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <aside className="proj-flagship__side">
                <div className="proj-panel">
                  <header className="proj-panel__head">
                    <span className="proj-panel__head-dot" />
                    <span>SYSTEM HIGHLIGHTS</span>
                    <span className="proj-panel__head-spacer" />
                    <span className="proj-panel__head-id">·READY</span>
                  </header>
                  <ul className="proj-panel__list">
                    {HIGHLIGHTS.map((item) => (
                      <li key={item.label} className="proj-panel__row">
                        <span className="proj-panel__row-label">
                          {item.label}
                        </span>
                        <span className="proj-panel__row-value">
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="proj-stats">
                  <div className="proj-stat">
                    <span className="proj-stat__label">LATENCY · Δ</span>
                    <span className="proj-stat__value">~45%</span>
                    <span className="proj-stat__bar">
                      <span className="proj-stat__bar-fill proj-stat__bar-fill--cyan" />
                    </span>
                    <span className="proj-stat__note">faster after optim.</span>
                  </div>
                  <div className="proj-stat">
                    <span className="proj-stat__label">GROUNDED · OK</span>
                    <span
                      className="proj-stat__value"
                      style={{ color: "var(--amber)" }}
                    >
                      RAG
                    </span>
                    <span className="proj-stat__bar">
                      <span className="proj-stat__bar-fill proj-stat__bar-fill--amber" />
                    </span>
                    <span className="proj-stat__note">cited from sources</span>
                  </div>
                </div>
              </aside>
            </div>

            <ProjectsTrace />
          </article>
        </Reveal>

        <div className="proj-3 proj-logs">
          {SUPPORTING.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <TiltCard
                className="card card-hover-glow proj-log"
                style={{
                  padding: "22px 24px 22px 28px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span className="proj-log__edge" aria-hidden="true" />
                <header className="proj-log__head">
                  <span className="proj-log__code">[ {item.code} ]</span>
                  <span className="proj-log__pulse" aria-hidden="true" />
                </header>
                <h3 className="proj-log__title">{item.title}</h3>
                <p className="proj-log__body">{item.description}</p>
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
