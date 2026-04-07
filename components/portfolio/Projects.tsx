import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Reveal } from "@/components/portfolio/Reveal";
import { StaggerChildren, StaggerItem } from "@/components/portfolio/StaggerChildren";

export function Projects() {
  const systemHighlights = [
    {
      label: "Retrieval Stack",
      value: "Hybrid search, HyDE, reciprocal rank fusion, and reranking.",
    },
    {
      label: "Primary Sources",
      value: "Confluence docs, runbooks, postmortems, and incident tickets.",
    },
    {
      label: "Operational Outcome",
      value: "Faster grounded answers for on-call response and internal search.",
    },
  ];

  const supportingLogs = [
    {
      title: "LLM Observability Workflows",
      description:
        "Used LangChain, LangSmith, and OpenTelemetry traces to make prompt chains inspectable, grounded, and easier to debug during incident response.",
      tags: ["LangChain", "LangSmith", "OpenTelemetry"],
    },
    {
      title: "Service Resilience Patterns",
      description:
        "Improved runtime resilience on Linux and Amazon EKS with retries, timeouts, circuit breakers, rate limiting, and on-call operational feedback loops.",
      tags: ["EKS", "Resilience", "On-call"],
    },
    {
      title: "Release Safety Automation",
      description:
        "Automated pre-deploy validation, smoke tests, canary checks, rollback automation, and drift detection with Python, Bash, Jenkins, and Git.",
      tags: ["Python", "Jenkins", "Automation"],
    },
  ];

  return (
    <section id="projects" className="py-8 sm:py-10">
      <SectionHeading
        eyebrow="Projects"
        title="Selected Engineering Work"
        description="A flagship case study plus supporting engineering logs that highlight cloud infrastructure, observability, and AI application work grounded in production needs."
        index="01"
      />

      <Reveal>
        <article className="card-hover glass-panel rounded-[2rem] border border-border/80 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="mono-label text-[11px] text-[var(--warm-accent)]">Flagship Project</p>
                <h3 className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                  Internal RAG Search Engine
                </h3>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The Problem
                </h4>
                <p className="text-sm leading-7 text-muted">
                  Engineering teams were spending too much time digging through
                  stale or disconnected Confluence documentation. Traditional keyword
                  search failed to understand context or handle technical synonyms,
                  leading to slow incident resolution and duplicated effort.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The Solution
                </h4>
                <p className="text-sm leading-7 text-muted">
                  Designed and shipped a Retrieval-Augmented Generation (RAG) search
                  engine. Documents are ingested into a <strong>pgvector</strong> database.
                  Queries leverage hybrid retrieval, Hypothetical Document Embeddings (HyDE),
                  Reciprocal Rank Fusion (RRF), and cross-encoder rerankers to deliver
                  highly relevant results directly from internal knowledge bases.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The Impact
                </h4>
                <ul className="space-y-2 text-sm leading-7 text-muted">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--warm-accent)] shrink-0" />
                    <span>
                      Improved search latency and relevancy, cutting retrieval times by
                      roughly 45% after optimization.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--warm-accent)] shrink-0" />
                    <span>
                      Empowered on-call engineers with a specialized assistant over
                      runbooks and postmortems to rapidly diagnose issues.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {["pgvector", "LangChain", "HyDE", "RRF", "S3", "Lambda"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1 font-mono text-xs text-accent-strong shadow-sm"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.4rem] border border-border/80 bg-surface-strong p-6 shadow-[0_18px_40px_color-mix(in_srgb,var(--foreground)_10%,transparent)]">
                <p className="mono-label text-[11px] text-accent">System Highlights</p>
                <div className="mt-5 space-y-4">
                  {systemHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1rem] border border-border/70 bg-surface px-4 py-4"
                    >
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-border/80 bg-surface-strong p-6 shadow-[0_18px_40px_color-mix(in_srgb,var(--foreground)_10%,transparent)]">
                <p className="mono-label text-[11px] text-muted">Why It Worked</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-border/70 bg-surface px-4 py-4">
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      ~45%
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Faster retrieval after ranking and latency optimization.
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border/70 bg-surface px-4 py-4">
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      Grounded
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Answers tied to internal documentation instead of generic chat output.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Reveal>

      <StaggerChildren className="mt-8 grid gap-4 lg:grid-cols-3" stagger={0.12}>
        {supportingLogs.map((item) => (
          <StaggerItem key={item.title}>
            <article className="card-hover glass-panel rounded-[1.8rem] border border-border/80 p-5 shadow-[0_20px_44px_color-mix(in_srgb,var(--foreground)_10%,transparent)]">
              <p className="mono-label text-[11px] text-[var(--warm-accent)]">
                Engineering Log
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1 font-mono text-xs text-accent-strong"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}
