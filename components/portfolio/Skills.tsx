import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { FaAws } from "react-icons/fa6";
import { SiOpenai, SiPython } from "react-icons/si";
import { TbActivityHeartbeat, TbDatabase } from "react-icons/tb";
import type { IconType } from "react-icons";

const groups: Array<{
  title: string;
  eyebrow: string;
  icon: IconType;
  items: string[];
}> = [
  {
    title: "Languages",
    eyebrow: "Core",
    icon: SiPython,
    items: ["Python", "Java", "Bash", "SQL", "JavaScript/TypeScript"],
  },
  {
    title: "Cloud / Platform",
    eyebrow: "Runtime",
    icon: FaAws,
    items: [
      "AWS",
      "Linux",
      "Docker",
      "Kubernetes (CKA)",
      "EKS",
      "Terraform",
      "Ansible",
      "Jenkins",
      "Git",
      "CI/CD",
    ],
  },
  {
    title: "Observability / Networking",
    eyebrow: "Signals",
    icon: TbActivityHeartbeat,
    items: [
      "Prometheus",
      "Grafana",
      "Datadog",
      "OpenTelemetry",
      "ELK",
      "LangSmith",
      "TCP/IP",
      "DNS",
      "HTTP(S)",
      "TLS/SSL",
      "L4/L7 Load Balancing",
      "Firewalls",
      "BGP fundamentals",
    ],
  },
  {
    title: "Messaging / Data",
    eyebrow: "Storage",
    icon: TbDatabase,
    items: ["Kafka", "RabbitMQ", "Redis", "MySQL", "PostgreSQL/pgvector"],
  },
  {
    title: "AI / LLM",
    eyebrow: "Applied",
    icon: SiOpenai,
    items: [
      "RAG",
      "LangChain",
      "LangGraph",
      "BM25",
      "HyDE",
      "RRF",
      "Cross-Encoder Rerankers",
      "Jinja",
    ],
  },
];

export function Skills() {
  return (
    <section id="tech-stack" className="section-rule py-16 sm:py-20">
      <SectionHeading
        eyebrow="Tech Stack"
        title="Tech Stack"
        description="Grouped strengths across cloud platforms, AI application layers, programming languages, and the networking fundamentals that keep production systems observable and dependable."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <div
              key={group.title}
              className="rounded-[1.5rem] border border-border bg-surface p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-strong text-accent">
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <p className="mono-label text-[11px] text-muted">
                    {group.eyebrow}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {group.title}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-sm border border-border bg-surface-strong px-3 py-2 text-sm text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
