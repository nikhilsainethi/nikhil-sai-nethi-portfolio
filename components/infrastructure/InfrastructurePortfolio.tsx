"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { heroPortraitPath, resumePath } from "@/lib/site";
import { CubeMark, useInfrastructureMotion } from "./InfrastructureShell";
import { RackScene } from "./RackScene";
import { ModelLab } from "./ModelLab";

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
  return (
    <section className="infra-hero infra-wrap" id="overview">
      <div className="infra-hero-topline">
        <span>
          <span className="infra-dot" /> INCOMING · GOOGLE
        </span>
        <span>ENGINEERING THE FOUNDATION</span>
      </div>
      <div className="infra-hero-layout">
        <div className="infra-hero-copy">
          <p className="infra-eyebrow">
            NIKHIL SAI NETHI / PLATFORM INFRASTRUCTURE ENGINEER
          </p>
          <h1 className="infra-hero-title">
            <span>Behind every</span>
            <span>great system</span>
            <span>
              is a <em>foundation.</em>
            </span>
          </h1>
          <p className="infra-hero-description">
            I build reliable platforms for complex systems.
            <br className="desktop-only" /> My next chapter: infrastructure that
            brings hardware models to life.
          </p>
          <div className="infra-hero-cta">
            <a href="#model-lab" className="infra-button infra-button-primary">
              Explore the model lab <span aria-hidden="true">↗</span>
            </a>
            <a href="#work" className="infra-text-link">
              Selected work <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="infra-hero-person">
            <Image src={heroPortraitPath} alt="" width={38} height={38} />
            <span>
              Software. Hardware. Everything between.
              <small>Incoming Platform Infrastructure Engineer at Google</small>
            </span>
          </div>
        </div>
        <div className="infra-hero-visual">
          <div className="infra-scene-caption">
            <span className="infra-mono">FIG. 01 / THE PHYSICAL LAYER</span>
            <span className="infra-scene-mode">INTERACTIVE</span>
          </div>
          <RackScene
            selected={selected}
            onSelect={setSelected}
            motionEnabled={enabled}
          />
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
            SYNTHETIC HARDWARE · SELECT A RACK TO EXPLORE
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
        <a href="#model-lab">
          SCROLL TO THE SYSTEM <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}

const lifecycle = [
  {
    label: "Design",
    title: "Make the machine understandable.",
    body: "Describe components, containment, and connections in a shared model. Choose the fidelity that helps a consumer answer a real question.",
    input: "Hardware definition",
    output: "Component graph",
    detail: "IDENTITY → RELATIONSHIPS",
    nodes: ["Chassis", "Compute", "Network"],
  },
  {
    label: "Validate",
    title: "Find the mismatch before it travels.",
    body: "Check references and structural constraints before a model is consumed. A useful failure points to the exact entity and explains what needs to change.",
    input: "Candidate revision",
    output: "Validation report",
    detail: "CONSTRAINTS → CONFIDENCE",
    nodes: ["References", "Containment", "Slot allocation"],
  },
  {
    label: "Serve",
    title: "Give every consumer a stable contract.",
    body: "Version the model so tools can agree on a specific revision. Clear interfaces let independent consumers build on the same foundation.",
    input: "Verified model",
    output: "Versioned contract",
    detail: "ONE MODEL → MANY CONSUMERS",
    nodes: ["Design tools", "Deployment", "Diagnostics"],
  },
  {
    label: "Repair",
    title: "Connect intended state to the next action.",
    body: "Use component identity and relationships to reason about a replacement. Preserve revision history so a change remains explainable.",
    input: "Component change",
    output: "Traceable revision",
    detail: "CHANGE → VALIDATE → REUSE",
    nodes: ["Identify", "Replace", "Revalidate"],
  },
];

export function LifecycleSection() {
  const [step, setStep] = useState(0);
  const enabled = useInfrastructureMotion();
  const item = lifecycle[step];
  return (
    <section
      className="infra-lifecycle infra-section infra-wrap"
      id="lifecycle"
    >
      <div className="infra-section-heading">
        <div>
          <p className="infra-eyebrow">02 / THE INFRASTRUCTURE LIFECYCLE</p>
          <h2>
            One model.
            <br />
            <span className="infra-muted">An entire lifecycle.</span>
          </h2>
        </div>
        <p>
          How a shared hardware model can connect the people and systems that
          build, deploy, and maintain machines.
        </p>
      </div>
      <div
        className="infra-lifecycle-tabs"
        aria-label="Explore model lifecycle"
      >
        {lifecycle.map((s, i) => (
          <button
            key={s.label}
            aria-pressed={step === i}
            onClick={() => setStep(i)}
          >
            <span className="infra-step-number">0{i + 1}</span>
            {s.label}
            <span aria-hidden="true">{step === i ? "↙" : "↗"}</span>
            {step === i && (
              <motion.span
                className="infra-step-indicator"
                layoutId="lifecycle-step"
              />
            )}
          </button>
        ))}
      </div>
      <div className="infra-lifecycle-body">
        <div className="infra-lifecycle-graphic">
          <div className="infra-graphic-top">
            <span className="infra-dot" />
            {item.detail}
          </div>
          <div className="infra-model-flow">
            <motion.div
              className="infra-model-input"
              key={`input-${step}`}
              initial={enabled ? { x: -12, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
            >
              <span className="infra-mono">INPUT</span>
              <strong>{item.input}</strong>
            </motion.div>
            <div className="infra-flow-connector" />
            <div className="infra-model-cube">
              <CubeMark />
              <span>machine.model</span>
            </div>
            <div className="infra-flow-connector" />
            <motion.div
              key={`output-${step}`}
              className="infra-model-output"
              initial={enabled ? { x: 12, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
            >
              <span className="infra-mono">OUTPUT</span>
              <strong>{item.output}</strong>
            </motion.div>
          </div>
          <div className="infra-consumer-nodes">
            {item.nodes.map((n, i) => (
              <motion.span
                key={n}
                initial={enabled ? { y: 12, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: enabled ? i * 0.06 : 0 }}
              >
                <span aria-hidden="true">◇</span>
                {n}
              </motion.span>
            ))}
          </div>
          <span className="infra-graphic-note">
            CONCEPTUAL WORKFLOW / SYNTHETIC EXAMPLE
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="infra-lifecycle-description"
            initial={enabled ? { y: 14, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: enabled ? 0.2 : 0 }}
          >
            <span className="infra-large-number">0{step + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <button
              className="infra-text-link"
              onClick={() => setStep((step + 1) % lifecycle.length)}
            >
              Next: {lifecycle[(step + 1) % lifecycle.length].label}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </AnimatePresence>
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
    lesson: "The connection to infrastructure modeling",
    takeaway:
      "Component identity, interfaces, and relationships make a complex system easier to inspect. This experience is the hardware-facing foundation I bring to platform work.",
  },
  {
    id: "02",
    category: "PLATFORMS & RELIABILITY",
    company: "MOODY’S",
    title: "Built to run. Ready to recover.",
    description:
      "Production operations and observability for Linux services and Kubernetes platforms.",
    tags: ["Amazon EKS", "OpenTelemetry", "Prometheus"],
    diagram: ["Services", "Telemetry", "On-call workflows"],
    challenge:
      "Keeping production services understandable requires signals that connect a symptom to the system behind it.",
    contribution:
      "Supported production on-call, incident response, root-cause analysis, runbooks, and blameless postmortems. Built SLI/SLO dashboards, alert rules, structured logs, and distributed traces with Prometheus, Grafana, Datadog, and OpenTelemetry.",
    tradeoff:
      "More telemetry is not always more clarity. Signals need a clear owner and an actionable path from detection to diagnosis.",
    lesson: "The connection to reliable model services",
    takeaway:
      "A service needs both a clear contract and a way to understand when that contract is not being met. Operational feedback belongs in the engineering loop.",
  },
  {
    id: "03",
    category: "DEVELOPER EXPERIENCE",
    company: "MOODY’S",
    title: "Make knowledge easier to find.",
    description:
      "An internal retrieval system that connects engineering questions to runbooks and documentation.",
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
  const [open, setOpen] = useState<string | null>(null);
  const enabled = useInfrastructureMotion();
  return (
    <section className="infra-work infra-section infra-wrap" id="work">
      <div className="infra-section-heading">
        <div>
          <p className="infra-eyebrow">03 / SELECTED ENGINEERING WORK</p>
          <h2>
            Experience below
            <br />
            <span className="infra-muted">the surface.</span>
          </h2>
        </div>
        <p>
          From network interfaces to production platforms. The work that shapes
          how I think about infrastructure.
        </p>
      </div>
      <div className="infra-work-list">
        {projects.map((p) => (
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
              <span className="infra-project-index">/{p.id}</span>
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
            <noscript>
              <div className="infra-case-content">
                <CaseStudyBody project={p} />
              </div>
            </noscript>
          </motion.article>
        ))}
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
      "Moving into infrastructure for hardware modeling and the systems that create and consume models.",
    incoming: true,
  },
  {
    company: "Moody’s Corporation",
    role: "Software Engineer",
    date: "AUG 2024 — PRESENT",
    description:
      "Production reliability, Kubernetes, observability, and internal engineering tools.",
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
    label: "Visibility & reliability",
    items: [
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
      "Datadog",
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
            I like understanding what happens beneath an abstraction—and
            building tools that make that complexity useful to someone else.
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
      <div className="infra-lab-wrap infra-wrap">
        <ModelLab motionEnabled={enabled} />
      </div>
      <LifecycleSection />
      <WorkSection />
      <AboutSection />
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
