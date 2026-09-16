"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { heroPortraitPath, resumePath } from "@/lib/site";
import { useInfrastructureMotion } from "./InfrastructureShell";
import { RackScene } from "./RackScene";
import { ModelLab } from "./ModelLab";
import ObservabilityStory from "./ObservabilityStory";
import { ObservabilityLab } from "./ObservabilityLab";

type Platform = "accelerator" | "arm" | "x86";
const platforms: Record<
  Platform,
  { name: string; tag: string; description: string }
> = {
  accelerator: {
    name: "Accelerator systems",
    tag: "COMPUTE / ACCELERATOR",
    description: "Compute, memory, and interconnects. One connected model.",
  },
  arm: {
    name: "ARM platforms",
    tag: "COMPUTE / ARM",
    description: "A different architecture. The same dependable foundation.",
  },
  x86: {
    name: "General-purpose compute",
    tag: "COMPUTE / X86",
    description: "Understand every component, from the chassis to the network.",
  },
};

export function HeroSection() {
  const [selected, setSelected] = useState<Platform>("accelerator");
  const enabled = useInfrastructureMotion();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const rackY = useTransform(scrollYProgress, [0, 1], [0, 105]);
  const rackRotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  const rackScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const signalY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  return (
    <section ref={hero} className="infra-hero infra-wrap" id="overview">
      <div className="infra-hero-topline">
        <span>
          <span className="infra-dot" /> INCOMING · GOOGLE
        </span>
        <span>OBSERVABILITY / MONITORING / INFRASTRUCTURE</span>
      </div>
      <div className="infra-hero-layout">
        <div className="infra-hero-copy">
          <p className="infra-eyebrow">
            NIKHIL SAI NETHI / PLATFORM INFRASTRUCTURE ENGINEER
          </p>
          <h1 className="infra-hero-title">
            <span>Make complex</span>
            <span>systems</span>
            <span>
              <em>observable.</em>
            </span>
          </h1>
          <p className="infra-hero-description">
            I connect metrics, logs, and traces to the systems behind them.
            <span className="infra-next-chapter">
              Next: observability and monitoring for Google’s UHM-M team.
            </span>
          </p>
          <div className="infra-hero-cta">
            <a href="#work" className="infra-button infra-button-primary">
              Explore my experience <span aria-hidden="true">↗</span>
            </a>
            <a href="#infrastructure-story" className="infra-text-link">
              Follow the signals <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="infra-hero-person">
            <Image src={heroPortraitPath} alt="" width={38} height={38} />
            <span>
              Production experience. A platform mindset.
              <small>Incoming Platform Infrastructure Engineer at Google</small>
            </span>
          </div>
        </div>
        <div className="infra-hero-visual">
          <div className="infra-scene-caption">
            <span className="infra-mono">FIG. 01 / BENEATH THE SIGNALS</span>
            <span className="infra-scene-mode">INTERACTIVE</span>
          </div>
          <div className="infra-hero-scene-stage">
            <motion.div
              className="infra-signal-halo"
              aria-hidden="true"
              style={enabled ? { y: signalY } : undefined}
            >
              <span>
                <i />
                metrics
              </span>
              <span>
                <i />
                logs
              </span>
              <span>
                <i />
                traces
              </span>
            </motion.div>
            <motion.div
              style={
                enabled
                  ? { y: rackY, rotate: rackRotate, scale: rackScale }
                  : undefined
              }
            >
              <RackScene
                selected={selected}
                onSelect={setSelected}
                motionEnabled={enabled}
              />
            </motion.div>
          </div>
          <div className="infra-scene-inspector">
            <span className="infra-inspector-cross" aria-hidden="true">
              +
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected}
                initial={enabled ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: enabled ? 0.18 : 0 }}
              >
                <span className="infra-mono">{platforms[selected].tag}</span>
                <strong>{platforms[selected].name}</strong>
                <p>{platforms[selected].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div
            className="infra-scene-switch"
            aria-label="Select hardware architecture"
          >
            {(Object.keys(platforms) as Platform[]).map((id, index) => (
              <button
                key={id}
                aria-pressed={selected === id}
                onClick={() => setSelected(id)}
              >
                {selected === id && (
                  <motion.span
                    layoutId="hardware-pill"
                    className="infra-selected-pill"
                  />
                )}
                <span>
                  0{index + 1} /{" "}
                  {id === "accelerator"
                    ? "Accelerator"
                    : id === "arm"
                      ? "ARM"
                      : "x86"}
                </span>
              </button>
            ))}
          </div>
          <p className="infra-scene-footnote">
            SELECT A RACK · SCROLL TO FOLLOW THE SIGNALS
          </p>
        </div>
      </div>
      <div className="infra-hero-bottom">
        <span>BUILT ON EXPERIENCE AT</span>
        <div className="infra-company-row">
          <span>Moody’s</span>
          <span>verisk</span>
          <span>NOKIA</span>
        </div>
        <a href="#infrastructure-story">
          FOLLOW THE SIGNALS <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div
        className="infra-experience-preview"
        aria-label="Experience highlights"
      >
        <a href="#work">
          <span>MOODY’S / SOFTWARE ENGINEER</span>
          <strong>Production observability</strong>
          <p>SLI/SLO dashboards · tracing · on-call</p>
          <b aria-hidden="true">↗</b>
        </a>
        <a href="#work">
          <span>NOKIA / SOFTWARE ENGINEER</span>
          <strong>Systems-level diagnosis</strong>
          <p>Packet analysis · kernel logs · network APIs</p>
          <b aria-hidden="true">↗</b>
        </a>
        <a href="#work">
          <span>VERISK / DEVELOPMENT CO-OP</span>
          <strong>Cloud platform workflows</strong>
          <p>AWS migration · CloudWatch · integration tests</p>
          <b aria-hidden="true">↗</b>
        </a>
      </div>
    </section>
  );
}

const projects = [
  {
    id: "01",
    category: "SYSTEMS & NETWORKING",
    company: "NOKIA",
    title: "Where software meets the wire.",
    description:
      "Hardware-facing APIs, network diagnostics, and subsystem integration on a Front Haul Gateway platform.",
    tags: ["Broadcom C APIs", "Python", "Layer 2/3"],
    diagram: ["C APIs", "Python tooling", "Subsystem tests"],
    challenge:
      "Working across the hardware/software boundary means failures can surface in interfaces, packet paths, or the environment around them.",
    contribution:
      "Built Python wrappers across hundreds of Broadcom C APIs and CPRI communication paths. Debugged Layer 2/3 issues with packet analysis, tcpdump, MTR, and kernel logs, and used Docker and Kubernetes for subsystem integration testing.",
    tradeoff:
      "Model only the detail a consumer needs; additional fidelity also adds maintenance and validation cost.",
    lesson: "From hardware symptoms to useful evidence",
    takeaway:
      "Component identity, interfaces, and relationships make a complex system easier to inspect. This experience is the hardware-facing foundation I bring to platform work.",
  },
  {
    id: "02",
    category: "OBSERVABILITY & PRODUCTION RELIABILITY",
    company: "MOODY’S",
    title: "From signals to a response.",
    description:
      "Built SLI/SLO dashboards, alert rules, structured logs, and distributed traces. Supported production on-call for Linux services and Amazon EKS.",
    tags: ["OpenTelemetry", "Prometheus / Grafana", "Datadog", "Amazon EKS"],
    diagram: [
      "Instrument & observe",
      "Diagnose & respond",
      "Runbooks & learning",
    ],
    challenge:
      "Keeping production services understandable requires signals that connect a symptom to the system behind it.",
    contribution:
      "Supported production on-call, incident response, root-cause analysis, runbooks, and blameless postmortems. Built SLI/SLO dashboards, alert rules, structured logs, and distributed traces with Prometheus, Grafana, Datadog, and OpenTelemetry.",
    tradeoff:
      "More telemetry is not always more clarity. Signals need a clear owner and an actionable path from detection to diagnosis.",
    lesson: "What I bring to observability infrastructure",
    takeaway:
      "A service needs both a clear contract and a way to understand when that contract is not being met. Operational feedback belongs in the engineering loop.",
  },
  {
    id: "03",
    category: "DEVELOPER EXPERIENCE",
    company: "MOODY’S",
    title: "Make troubleshooting knowledge accessible.",
    description:
      "Internal retrieval and LLM observability workflows for grounded triage steps, incident summaries, and engineering documentation.",
    tags: ["pgvector", "Hybrid retrieval", "LangChain"],
    diagram: ["Engineering question", "Retrieve + rerank", "Grounded answer"],
    challenge:
      "Keyword search struggles with technical context and terminology spread across engineering documentation.",
    contribution:
      "Built an internal RAG search engine over Confluence using pgvector, hybrid retrieval, HyDE, reciprocal rank fusion, and reranking. Added LLM observability and troubleshooting workflows with LangChain, LangSmith, and OpenTelemetry.",
    tradeoff:
      "Retrieval quality, latency, and traceability need to be considered together when a tool sits inside an engineering workflow.",
    lesson: "The connection to model consumers",
    takeaway:
      "Useful infrastructure meets people where they work. Clear tools, inspectable results, and feedback from consumers shape the platform around real use cases.",
  },
  {
    id: "04",
    category: "CLOUD WORKFLOWS",
    company: "VERISK",
    title: "Move the system. Keep the confidence.",
    description:
      "Cloud migration workflows backed by unit and integration testing.",
    tags: ["AWS", "C#", "Step Functions"],
    diagram: ["Legacy application", "Cloud workflow", "Integration tests"],
    challenge:
      "Migrating an application changes its environment and dependencies. Confidence depends on testing the connections as well as the individual pieces.",
    contribution:
      "Contributed to a legacy application migration using S3, Lambda, CloudWatch, DynamoDB, SQS, Step Functions, and Redshift with C#. Added unit and integration tests while working with cross-functional teams to strengthen migration workflows.",
    tradeoff:
      "Managed services reduce operational work but introduce boundaries that need explicit failure handling and integration tests.",
    lesson: "The connection to a modeling ecosystem",
    takeaway:
      "A platform is a network of contracts. Testing how its components work together helps consumers depend on the system as it evolves.",
  },
];

function CaseStudyBody({ project: p }: { project: (typeof projects)[number] }) {
  return (
    <>
      <div className="infra-case-diagram" aria-label="Conceptual workflow">
        {p.diagram.map((d, i) => (
          <span key={d}>
            <span>{d}</span>
            {i < 2 && <b aria-hidden="true">→</b>}
          </span>
        ))}
      </div>
      <div className="infra-case-columns">
        <div>
          <span className="infra-eyebrow">THE CHALLENGE</span>
          <p>{p.challenge}</p>
          <span className="infra-eyebrow">A TRADEOFF I THINK ABOUT</span>
          <p>{p.tradeoff}</p>
        </div>
        <div>
          <span className="infra-eyebrow">MY CONTRIBUTION</span>
          <p>{p.contribution}</p>
        </div>
      </div>
      <div className="infra-case-takeaway">
        <span>↳</span>
        <div>
          <h4>{p.lesson}</h4>
          <p>{p.takeaway}</p>
        </div>
      </div>
      <p className="infra-case-note">
        Experience summary · Employer source code and internal artifacts are not
        included.
      </p>
    </>
  );
}

export function WorkSection() {
  const [open, setOpen] = useState<string | null>("02");
  const enabled = useInfrastructureMotion();
  return (
    <section className="infra-work infra-section infra-wrap" id="work">
      <div className="infra-section-heading">
        <div>
          <p className="infra-eyebrow">02 / SELECTED ENGINEERING EXPERIENCE</p>
          <h2>
            Built from experience.
            <br />
            <span className="infra-muted">Applied to what’s next.</span>
          </h2>
        </div>
        <p>
          Production observability at Moody’s. Hardware-facing diagnosis at
          Nokia. Cloud workflows at Verisk. The foundation for my next chapter.
        </p>
      </div>
      <div className="infra-work-list">
        {[projects[1], projects[0], projects[2], projects[3]].map(
          (p, index) => (
            <motion.article
              layout={enabled}
              key={p.id}
              className={`infra-project ${open === p.id ? "is-expanded" : ""}`}
            >
              <button
                className="infra-project-trigger"
                aria-expanded={open === p.id}
                aria-controls={`case-${p.id}`}
                onClick={() => setOpen(open === p.id ? null : p.id)}
              >
                <span className="infra-project-index">/0{index + 1}</span>
                <div className="infra-project-summary">
                  <span className="infra-eyebrow">
                    {p.category} <span>· {p.company}</span>
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="infra-tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <span className="infra-project-open" aria-hidden="true">
                  {open === p.id ? "−" : "+"}
                </span>
                <span className="sr-only">
                  {open === p.id ? "Close" : "Read"} case study
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === p.id && (
                  <motion.div
                    id={`case-${p.id}`}
                    initial={{
                      height: enabled ? 0 : "auto",
                      opacity: enabled ? 0 : 1,
                    }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="infra-case-content"
                  >
                    <CaseStudyBody project={p} />
                  </motion.div>
                )}
              </AnimatePresence>
              {p.id !== "02" && (
                <noscript>
                  <div className="infra-case-content">
                    <CaseStudyBody project={p} />
                  </div>
                </noscript>
              )}
            </motion.article>
          ),
        )}
      </div>
    </section>
  );
}

const history = [
  {
    company: "Google",
    role: "Incoming Platform Infrastructure Engineer",
    date: "NEXT CHAPTER",
    description:
      "Joining the UHM-M team with a focus on observability and monitoring for hardware-modeling infrastructure.",
    incoming: true,
  },
  {
    company: "Moody’s Corporation",
    role: "Software Engineer",
    date: "AUG 2024 — PRESENT",
    description:
      "SLI/SLO dashboards, distributed tracing, structured logs, alerting, and production incident response on Linux and Amazon EKS.",
  },
  {
    company: "Verisk Analytics",
    role: "Software Development Co-op",
    date: "SEP — DEC 2023",
    description:
      "AWS migration workflows, C#, and unit and integration testing.",
  },
  {
    company: "Nokia",
    role: "Software Engineer",
    date: "SEP 2020 — DEC 2021",
    description:
      "Hardware-facing APIs, Layer 2/3 diagnostics, and subsystem integration.",
  },
];
const capabilities = [
  {
    label: "Platform foundations",
    items: ["Linux", "Kubernetes", "AWS / EKS", "Docker", "Terraform"],
  },
  {
    label: "Observability & monitoring",
    items: [
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
      "Datadog",
      "SLI / SLO dashboards",
      "Incident response",
    ],
  },
  {
    label: "Software & data",
    items: [
      "Python",
      "TypeScript",
      "Java",
      "Bash / SQL",
      "PostgreSQL",
      "Kafka / Redis",
    ],
  },
];

export function AboutSection() {
  return (
    <section className="infra-about infra-section infra-wrap" id="about">
      <div className="infra-section-heading">
        <div>
          <p className="infra-eyebrow">04 / THE ENGINEER BEHIND THE SYSTEMS</p>
          <h2>
            Curious by nature.
            <br />
            <span className="infra-muted">Reliable by design.</span>
          </h2>
        </div>
      </div>
      <div className="infra-about-grid">
        <div className="infra-profile">
          <div className="infra-portrait">
            <Image
              src={heroPortraitPath}
              alt="Nikhil Sai Nethi"
              width={580}
              height={700}
              sizes="(max-width: 760px) 90vw, 30vw"
            />
            <span className="infra-photo-corner top-left" />
            <span className="infra-photo-corner bottom-right" />
            <div>
              <span>NIKHIL SAI NETHI</span>
              <small>SOFTWARE × INFRASTRUCTURE</small>
            </div>
          </div>
          <p>
            I like turning a confusing production symptom into something an
            engineer can investigate. Good instrumentation, useful alerts, and
            clear runbooks make complex systems easier to operate.
          </p>
          <a
            className="infra-text-link"
            href={resumePath}
            target="_blank"
            rel="noreferrer"
          >
            Read my résumé <span>↗</span>
          </a>
        </div>
        <div className="infra-timeline" id="experience">
          {history.map((h, i) => (
            <article
              key={h.company}
              className={h.incoming ? "is-incoming" : ""}
            >
              <div className="infra-timeline-track">
                <span>{h.incoming ? "↗" : `0${i}`}</span>
              </div>
              <div>
                <span className="infra-eyebrow">{h.date}</span>
                <h3>{h.company}</h3>
                <h4>{h.role}</h4>
                <p>{h.description}</p>
              </div>
            </article>
          ))}
          <div className="infra-education">
            <span className="infra-eyebrow">EDUCATION</span>
            <p>
              <strong>MS, Computer Science</strong>
              <br />
              California State University, East Bay · 2022–2023
            </p>
            <p>
              <strong>B.Tech</strong>
              <br />
              Vellore Institute of Technology · 2016–2021
            </p>
          </div>
        </div>
      </div>
      <CapabilitiesSection />
    </section>
  );
}

export function CapabilitiesSection() {
  return (
    <div className="infra-capabilities" id="skills">
      <div className="infra-capability-heading">
        <span className="infra-eyebrow">THE TOOLKIT</span>
        <span>
          Tools are useful. Understanding how they fit together matters more.
        </span>
      </div>
      <div className="infra-capability-grid">
        {capabilities.map((c, i) => (
          <div key={c.label}>
            <span className="infra-capability-icon" aria-hidden="true">
              {["⌘", "⌁", "⟨/⟩"][i]}
            </span>
            <h3>{c.label}</h3>
            <p>{c.items.join(" · ")}</p>
          </div>
        ))}
      </div>
      <div className="infra-credentials">
        <span className="infra-eyebrow">CREDENTIALS</span>
        <a
          href="https://www.credly.com/badges/55e7e691-b5df-4be7-87f4-da042a70b5b2"
          target="_blank"
          rel="noreferrer"
        >
          <strong>CKA</strong>
          <span>Certified Kubernetes Administrator</span>↗
        </a>
        <a
          href="https://www.credly.com/badges/2ef43aed-5ff7-46da-acb9-bab22d26b784"
          target="_blank"
          rel="noreferrer"
        >
          <strong>AWS</strong>
          <span>Developer – Associate</span>↗
        </a>
        <a
          href="https://www.credly.com/badges/5d44ead0-d834-459c-9431-4c8546c665c8"
          target="_blank"
          rel="noreferrer"
        >
          <strong>CCNA</strong>
          <span>Cisco Certified Network Associate</span>↗
        </a>
      </div>
    </div>
  );
}

export function ContactSection() {
  return (
    <section className="infra-contact infra-section" id="contact">
      <div className="infra-wrap">
        <div className="infra-contact-top">
          <p className="infra-eyebrow">05 / LET’S CONNECT</p>
          <span className="infra-mono">
            GOOD SYSTEMS START WITH A CONVERSATION.
          </span>
        </div>
        <div className="infra-contact-main">
          <h2>
            Let’s build
            <br />
            something <em>solid.</em>
          </h2>
          <a
            href="mailto:nikhilsainethi@gmail.com"
            className="infra-contact-arrow"
            aria-label="Email Nikhil Sai Nethi"
          >
            ↗
          </a>
        </div>
        <div className="infra-contact-bottom">
          <a href="mailto:nikhilsainethi@gmail.com">
            nikhilsainethi@gmail.com <span>↗</span>
          </a>
          <div>
            <a
              href="https://github.com/nikhilsainethi"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/nikhilsai/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InfrastructurePortfolio() {
  const enabled = useInfrastructureMotion();
  return (
    <main id="main">
      <HeroSection />
      <ObservabilityStory />
      <WorkSection />
      <ObservabilityLab />
      <AboutSection />
      <div className="infra-wrap infra-foundation-wrap">
        <details className="infra-foundation">
          <summary>
            <span className="infra-eyebrow">UNDER THE HOOD</span>
            <strong>Explore the hardware-model foundation</strong>
            <span className="infra-muted">
              A separate playground for entities, relationships, validation, and
              revisions.
            </span>
            <b aria-hidden="true">＋</b>
          </summary>
          <div className="infra-foundation-content">
            <ModelLab motionEnabled={enabled} />
          </div>
        </details>
      </div>
      <ContactSection />
    </main>
  );
}

export function StandaloneSection({
  section,
}: {
  section: "work" | "about" | "skills" | "contact";
}) {
  return (
    <main id="main" className="infra-standalone">
      {section !== "skills" && (
        <h1 className="sr-only">
          {section === "work"
            ? "Selected engineering work"
            : section === "about"
              ? "About Nikhil Sai Nethi"
              : "Contact Nikhil Sai Nethi"}
        </h1>
      )}
      {section === "work" ? (
        <WorkSection />
      ) : section === "about" ? (
        <AboutSection />
      ) : section === "skills" ? (
        <section className="infra-section infra-wrap">
          <h1>Platform capabilities</h1>
          <CapabilitiesSection />
        </section>
      ) : (
        <ContactSection />
      )}
    </main>
  );
}
