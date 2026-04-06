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
    <section id="tech-stack" className="py-4 sm:py-10">
      <SectionHeading
        eyebrow="Tech Stack"
        title="Tech Stack"
        description="Grouped strengths across cloud platforms, AI application layers, programming languages, and the networking fundamentals that keep production systems observable and dependable."
        index="01"
      />

      <div className="grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <div
              key={group.title}
              className="card-hover glass-panel flex min-h-0 flex-col rounded-[1.75rem] border border-white/75 p-5 shadow-[0_18px_42px_rgba(82,101,142,0.10)] sm:min-h-[18rem] sm:rounded-[2rem] sm:p-6 sm:shadow-[0_22px_54px_rgba(82,101,142,0.11)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/80 text-accent shadow-[0_10px_24px_rgba(88,107,144,0.12)] sm:h-12 sm:w-12">
                  <Icon size={17} />
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

              <div className="mt-4 flex flex-wrap content-start gap-2.5 sm:mt-5">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <span
                      key={item.name}
                      className="flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-2 text-[13px] text-muted shadow-[0_10px_22px_rgba(89,108,144,0.08)] transition-colors hover:border-accent/30 hover:text-accent-strong sm:text-sm"
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
