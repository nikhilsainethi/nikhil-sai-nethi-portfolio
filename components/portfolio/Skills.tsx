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
  shape: string;
  items: Array<{ name: string; icon?: IconType }>;
}> = [
  {
    title: "Languages",
    eyebrow: "Core",
    icon: SiPython,
    shape: "rounded-[42%_58%_54%_46%/38%_42%_58%_62%]",
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
    shape: "rounded-[50%_50%_46%_54%/46%_42%_58%_54%]",
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
    shape: "rounded-[44%_56%_48%_52%/58%_42%_58%_42%]",
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
    shape: "rounded-[48%_52%_60%_40%/44%_42%_58%_56%]",
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
    shape: "rounded-[56%_44%_52%_48%/44%_54%_46%_56%]",
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
    <section id="tech-stack" className="py-8 sm:py-10">
      <SectionHeading
        eyebrow="Tech Stack"
        title="Tech Stack"
        description="Grouped strengths across cloud platforms, AI application layers, programming languages, and the networking fundamentals that keep production systems observable and dependable."
      />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <div
              key={group.title}
              className={`card-hover glass-panel min-h-[19rem] border border-white/75 p-6 shadow-[0_22px_54px_rgba(82,101,142,0.11)] ${group.shape}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/80 text-accent shadow-[0_10px_24px_rgba(88,107,144,0.12)]">
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
                      className="flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-2 text-sm text-muted shadow-[0_10px_22px_rgba(89,108,144,0.08)] transition-colors hover:border-accent/30 hover:text-accent-strong"
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
