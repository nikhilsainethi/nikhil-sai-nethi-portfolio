import { Reveal } from "@/components/portfolio/Reveal";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { sortUpdatesByDate } from "@/lib/sort-updates";
import updates from "@/data/updates.js";

const sortedUpdates = sortUpdatesByDate(updates);

export function EngineeringLogs() {
  return (
    <section id="updates" className="section-rule py-16 sm:py-20">
      <SectionHeading
        eyebrow="Updates"
        title="Recent Engineering Logs"
        description="A compact feed of recent work, certifications, and shipping milestones pulled from structured portfolio data."
      />

      <div className="grid gap-4">
        {sortedUpdates.map((entry, index) => (
          <Reveal key={`${entry.date}-${entry.title}`} delay={index * 0.05}>
            <article className="card-hover rounded-[1.4rem] border border-border bg-surface p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-sm border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-strong">
                      {entry.type}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {entry.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                    {entry.title}
                  </h3>
                  <p className="max-w-3xl text-sm leading-7 text-muted">
                    {entry.description}
                  </p>
                </div>

                <a
                  className="link-underline w-fit shrink-0 text-sm font-medium text-accent hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  href={entry.link}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open reference
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
