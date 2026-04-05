import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Reveal } from "@/components/portfolio/Reveal";

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

  return (
    <section id="projects" className="section-rule py-16 sm:py-20">
      <SectionHeading
        eyebrow="Featured Project"
        title="Internal RAG Search Engine"
        description="A specialized Confluence search experience leveraging modern vector databases and hybrid retrieval for accurate, grounded internal documentation search."
      />

      <Reveal>
        <article className="card-hover rounded-[1.4rem] border border-border bg-surface p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The Problem
                </h3>
                <p className="text-sm leading-7 text-muted">
                  Engineering teams were spending too much time digging through
                  stale or disconnected Confluence documentation. Traditional keyword
                  search failed to understand context or handle technical synonyms,
                  leading to slow incident resolution and duplicated effort.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The Solution
                </h3>
                <p className="text-sm leading-7 text-muted">
                  Designed and shipped a Retrieval-Augmented Generation (RAG) search
                  engine. Documents are ingested into a <strong>pgvector</strong> database.
                  Queries leverage hybrid retrieval, Hypothetical Document Embeddings (HyDE),
                  Reciprocal Rank Fusion (RRF), and cross-encoder rerankers to deliver
                  highly relevant results directly from internal knowledge bases.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  The Impact
                </h3>
                <ul className="space-y-2 text-sm leading-7 text-muted">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    <span>
                      Improved search latency and relevancy, cutting retrieval times by
                      roughly 45% after optimization.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
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
                      className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 font-mono text-xs text-accent-strong shadow-sm"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.2rem] border border-border bg-surface-strong p-6 shadow-sm">
                <p className="mono-label text-[11px] text-accent">System Highlights</p>
                <div className="mt-5 space-y-4">
                  {systemHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1rem] border border-border bg-white px-4 py-4"
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

              <div className="rounded-[1.2rem] border border-border bg-surface-strong p-6 shadow-sm">
                <p className="mono-label text-[11px] text-muted">Why It Worked</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-border bg-white px-4 py-4">
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      ~45%
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Faster retrieval after ranking and latency optimization.
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border bg-white px-4 py-4">
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
    </section>
  );
}
