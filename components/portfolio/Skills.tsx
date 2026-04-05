import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { FaAws, FaDocker, FaJava } from "react-icons/fa6";
import {
  SiOpenai,
  SiPython,
  SiKubernetes,
  SiTerraform,
  SiAnsible,
  SiJenkins,
  SiGit,
  SiPrometheus,
  SiGrafana,
  SiDatadog,
  SiOpentelemetry,
  SiElasticsearch,
  SiApachekafka,
  SiRabbitmq,
  SiRedis,
  SiMysql,
  SiPostgresql,
  SiJavascript,
  SiGnubash,
} from "react-icons/si";
import { TbActivityHeartbeat, TbDatabase, TbTerminal2 } from "react-icons/tb";
import type { IconType } from "react-icons";

const groups: Array<{
  title: string;
  eyebrow: string;
  icon: IconType;
  items: Array<{ name: string; icon?: IconType }>;
}> = [
  {
    title: "Languages",
    eyebrow: "Core",
    icon: SiPython,
    items: [
      { name: "Python", icon: SiPython },
      { name: "Java", icon: FaJava },
      { name: "Bash", icon: SiGnubash },
      { name: "SQL", icon: TbDatabase },
      { name: "JavaScript/TypeScript", icon: SiJavascript },
    ],
  },
  {
    title: "Cloud / Platform",
    eyebrow: "Runtime",
    icon: FaAws,
    items: [
      { name: "AWS", icon: FaAws },
      { name: "Linux", icon: TbTerminal2 },
      { name: "Docker", icon: FaDocker },
      { name: "Kubernetes (CKA)", icon: SiKubernetes },
      { name: "EKS", icon: FaAws },
      { name: "Terraform", icon: SiTerraform },
      { name: "Ansible", icon: SiAnsible },
      { name: "Jenkins", icon: SiJenkins },
      { name: "Git", icon: SiGit },
      { name: "CI/CD" },
    ],
  },
  {
    title: "Observability / Networking",
    eyebrow: "Signals",
    icon: TbActivityHeartbeat,
    items: [
      { name: "Prometheus", icon: SiPrometheus },
      { name: "Grafana", icon: SiGrafana },
      { name: "Datadog", icon: SiDatadog },
      { name: "OpenTelemetry", icon: SiOpentelemetry },
      { name: "ELK", icon: SiElasticsearch },
      { name: "LangSmith" },
      { name: "TCP/IP" },
      { name: "DNS" },
      { name: "HTTP(S)" },
      { name: "TLS/SSL" },
      { name: "L4/L7 Load Balancing" },
      { name: "Firewalls" },
      { name: "BGP fundamentals" },
    ],
  },
  {
    title: "Messaging / Data",
    eyebrow: "Storage",
    icon: TbDatabase,
    items: [
      { name: "Kafka", icon: SiApachekafka },
      { name: "RabbitMQ", icon: SiRabbitmq },
      { name: "Redis", icon: SiRedis },
      { name: "MySQL", icon: SiMysql },
      { name: "PostgreSQL/pgvector", icon: SiPostgresql },
    ],
  },
  {
    title: "AI / LLM",
    eyebrow: "Applied",
    icon: SiOpenai,
    items: [
      { name: "RAG" },
      { name: "LangChain" },
      { name: "LangGraph" },
      { name: "BM25" },
      { name: "HyDE" },
      { name: "RRF" },
      { name: "Cross-Encoder Rerankers" },
      { name: "Jinja" },
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
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <span
                      key={item.name}
                      className="flex items-center gap-2 rounded-sm border border-border bg-surface-strong px-3 py-2 text-sm text-muted shadow-sm hover:border-accent/40 hover:text-accent-strong transition-colors"
                    >
                      {ItemIcon && <ItemIcon size={14} className="text-accent" />}
                      {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
