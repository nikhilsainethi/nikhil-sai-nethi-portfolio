import { Reveal } from "@/components/portfolio/Reveal";
import { SectionHeading } from "@/components/portfolio/SectionHeading";

const experiences = [
  {
    company: "Moody's Corporation",
    domain: "moodys.com",
    role: "Software Engineer",
    period: "Aug 2024 - Present",
    location: "Charlotte, NC",
    highlights: [
      "EKS",
      "Prometheus",
      "OpenTelemetry",
      "RAG",
      "LangChain",
      "LangSmith",
    ],
    bullets: [
      "Supported on-call for production services on Linux and Amazon EKS, handling incident response, root-cause analysis, and follow-through via structured runbooks and blameless postmortems.",
      "Designed and shipped an internal RAG search engine over Confluence using pgvector, hybrid retrieval, HyDE, reciprocal rank fusion, and reranking, improving latency by roughly 45% after optimization.",
      "Improved service resilience on Linux and Amazon EKS with timeouts, retries, circuit breakers, idempotency, and rate limiting across production-facing services.",
      "Built observability using Prometheus, Grafana, Datadog, and OpenTelemetry, including SLI/SLO dashboards, alert rules, structured JSON logs, correlation IDs, and distributed tracing.",
      "Automated release safety and operational workflows using Python, Bash, Jenkins, and Git, including pre-deploy validation, smoke tests, canary checks, rollback automation, and configuration drift detection.",
      "Troubleshot DNS, TLS, HTTP routing, L4/L7 load balancers, and firewall path issues using curl, dig, traceroute, tcpdump, and Wireshark.",
      "Built LLM observability and troubleshooting workflows with LangChain, LangSmith, and OpenTelemetry to generate grounded triage steps and incident summaries.",
      "Built a domain-specific RAG assistant over runbooks, postmortems, and tickets using LangChain and Jinja to standardize prompts, citations, and remediation outputs for on-call use.",
    ],
  },
  {
    company: "Verisk Analytics",
    domain: "verisk.com",
    role: "Software Development Co-op",
    period: "Sep 2023 - Dec 2023",
    location: "Boston, MA",
    highlights: ["AWS Migration", "C#", "S3", "Lambda"],
    bullets: [
      "Contributed to a legacy application migration using S3, Lambda, CloudWatch, DynamoDB, SQS, Step Functions, and Redshift with C#.",
      "Added unit and integration tests while partnering with cross-functional teams to strengthen migration workflows and release confidence.",
    ],
  },
  {
    company: "Nokia Solutions & Networks",
    domain: "nokia.com",
    role: "Software Engineer",
    period: "Sep 2020 - Dec 2021",
    location: "Bangalore, India",
    highlights: ["Kubernetes", "Python", "Automation", "Docker"],
    bullets: [
      "Built Python wrappers across hundreds of Broadcom C APIs and CPRI communication paths on Nokia's Front Haul Gateway platform.",
      "Debugged and resolved 150+ Layer 2/3 networking bugs using packet analysis, tcpdump, MTR, kernel logs, and network statistics across telecom infrastructure.",
      "Deployed Docker-based test environments and managed Kubernetes pods across 18 subsystems for integration and regression testing.",
      "Automated testing and deployment workflows with Pytest, Robot Framework, Jenkins, Docker, Kubernetes, and Ansible.",
      "Documented and tracked 100+ defects in Jira, improving debugging handoffs and release readiness across telecom subsystems.",
    ],
  },
];

export function ExperienceTimeline() {
  return (
    <section id="experience" className="section-rule py-16 sm:py-20">
      <SectionHeading
        eyebrow="Experience"
        title="Experience"
        description="A focused timeline of infrastructure, observability, and platform work spanning production reliability, cloud migration, and AI-enabled engineering workflows."
      />

      <ol className="relative ml-2 border-l border-border pl-7">
        {experiences.map((experience, index) => (
          <li key={experience.company} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[2.05rem] top-5 h-4 w-4 rounded-sm border border-accent bg-accent-soft" />
            <Reveal delay={index * 0.06}>
              <article className="card-hover rounded-[1.5rem] border border-border bg-surface p-6 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    {experience.domain && (
                      <img
                        src={`https://logo.clearbit.com/${experience.domain}`}
                        alt={`${experience.company} logo`}
                        className="h-12 w-12 rounded bg-white object-contain p-1 border border-border shadow-sm hidden sm:block"
                      />
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {experience.domain && (
                          <img
                            src={`https://logo.clearbit.com/${experience.domain}`}
                            alt={`${experience.company} logo`}
                            className="h-8 w-8 rounded bg-white object-contain p-0.5 border border-border shadow-sm block sm:hidden"
                          />
                        )}
                        <p className="mono-label text-[11px] text-muted">
                          {experience.period}
                        </p>
                      </div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                        {experience.company}
                      </h3>
                      <p className="text-sm leading-6 text-muted">
                        {experience.role} · {experience.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {experience.highlights.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 font-mono text-xs text-accent-strong shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <ul
                  className={`mt-6 grid gap-x-6 gap-y-3 text-sm leading-7 text-muted sm:text-[15px] ${
                    experience.bullets.length > 4 ? "xl:grid-cols-2" : ""
                  }`}
                >
                  {experience.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
