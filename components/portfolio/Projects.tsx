import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { Reveal } from "@/components/portfolio/Reveal";

export function Projects() {
  return (
    <section id="projects" className="section-rule py-16 sm:py-20">
      <SectionHeading
        eyebrow="Featured Project"
        title="Internal RAG Search Engine"
        description="A specialized Confluence search experience leveraging modern vector databases and hybrid retrieval for accurate, grounded internal documentation search."
      />

      <Reveal>
        <article className="card-hover rounded-[1.4rem] border border-border bg-surface p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
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

            <div className="rounded-[1rem] border border-border bg-surface-strong p-4 shadow-sm flex items-center justify-center min-h-[300px]">
              <svg
                viewBox="0 0 600 400"
                className="w-full h-auto text-muted"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Confluence/Data Source */}
                <rect x="40" y="160" width="80" height="80" rx="8" className="fill-surface stroke-border" strokeWidth="2" />
                <path d="M60 180 h40 M60 200 h30 M60 220 h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <text x="80" y="265" textAnchor="middle" className="text-xs fill-foreground font-mono">Confluence</text>

                {/* S3 Storage */}
                <path d="M220 160 c0 -10, 60 -10, 60 0 v80 c0 10, -60 10, -60 0 z" className="fill-surface stroke-border" strokeWidth="2" />
                <ellipse cx="250" cy="160" rx="30" ry="10" className="stroke-border" strokeWidth="2" />
                <text x="250" y="265" textAnchor="middle" className="text-xs fill-foreground font-mono">S3 (Raw)</text>

                {/* Lambda / Processing */}
                <rect x="380" y="160" width="80" height="80" rx="8" className="fill-accent/10 stroke-accent" strokeWidth="2" />
                <path d="M410 185 l15 -10 v20 l-15 10 z M410 205 l15 10 v-20 l-15 -10 z" className="stroke-accent fill-accent" strokeWidth="1" />
                <text x="420" y="265" textAnchor="middle" className="text-xs fill-foreground font-mono">Lambda (Chunking)</text>

                {/* pgvector / DB */}
                <path d="M520 160 c0 -10, 60 -10, 60 0 v80 c0 10, -60 10, -60 0 z" className="fill-surface stroke-border" strokeWidth="2" />
                <ellipse cx="550" cy="160" rx="30" ry="10" className="stroke-border" strokeWidth="2" />
                <ellipse cx="550" cy="175" rx="30" ry="10" className="stroke-border" strokeWidth="1" strokeDasharray="4 2" />
                <ellipse cx="550" cy="190" rx="30" ry="10" className="stroke-border" strokeWidth="1" strokeDasharray="4 2" />
                <text x="550" y="265" textAnchor="middle" className="text-xs fill-foreground font-mono">pgvector</text>

                {/* Connecting Arrows */}
                <path d="M120 200 L210 200" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <polygon points="210,200 200,195 200,205" fill="currentColor" />

                <path d="M280 200 L370 200" stroke="currentColor" strokeWidth="2" />
                <polygon points="370,200 360,195 360,205" fill="currentColor" />

                <path d="M460 200 L510 200" stroke="currentColor" strokeWidth="2" />
                <polygon points="510,200 500,195 500,205" fill="currentColor" />

                {/* Query Flow */}
                <rect x="250" y="320" width="100" height="40" rx="4" className="fill-surface stroke-border" strokeWidth="2" />
                <text x="300" y="345" textAnchor="middle" className="text-sm fill-foreground font-semibold">User Query</text>

                <path d="M350 340 L540 340 L540 250" stroke="currentColor" strokeWidth="2" fill="none" />
                <polygon points="540,250 535,260 545,260" fill="currentColor" />

                <text x="445" y="330" textAnchor="middle" className="text-[10px] fill-muted font-mono">Embed & Retrieve</text>
              </svg>
            </div>
          </div>
        </article>
      </Reveal>
    </section>
  );
}
