import { AnimatedCounter } from "@/components/portfolio/AnimatedCounter";
import { MarqueeStrip } from "@/components/portfolio/MarqueeStrip";
import { MagneticButton } from "@/components/portfolio/MagneticButton";
import { Reveal } from "@/components/portfolio/Reveal";
import { RoleCycler } from "@/components/portfolio/RoleCycler";
import { CharReveal } from "@/components/portfolio/CharReveal";
import { ScrambleText } from "@/components/portfolio/ScrambleText";
import { SplitText } from "@/components/portfolio/SplitText";
import { StackedSection } from "@/components/portfolio/StackedSection";
import { TiltCard } from "@/components/portfolio/TiltCard";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowDown,
  FaArrowRight,
  FaUpRightFromSquare,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaLocationDot,
} from "react-icons/fa6";
import { createPageMetadata, heroPortraitPath, resumePath } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Home",
  description:
    "Home page for Nikhil Sai Nethi, focused on cloud infrastructure, observability, and practical AI tooling.",
  path: "/",
});

/* ─────────────────────────────────────────────────────────────── */
/*  Static data for preview sections                               */
/* ─────────────────────────────────────────────────────────────── */

const engineeringLogs = [
  { title: "LLM Observability Workflows", tags: ["LangChain", "LangSmith", "OTel"] },
  { title: "Service Resilience Patterns", tags: ["EKS", "Resilience", "On-call"] },
  { title: "Release Safety Automation", tags: ["Python", "Jenkins", "Automation"] },
];

const experiences = [
  {
    company: "Moody's Corporation",
    role: "Software Engineer",
    period: "Aug 2024 – Present",
    location: "Charlotte, NC",
    current: true,
    tags: ["EKS", "RAG", "LangChain", "Prometheus", "OTel"],
  },
  {
    company: "Verisk Analytics",
    role: "Software Dev Co-op",
    period: "Sep – Dec 2023",
    location: "Boston, MA",
    current: false,
    tags: ["AWS", "C#", "S3", "Lambda"],
  },
  {
    company: "Nokia Solutions",
    role: "Software Engineer",
    period: "Sep 2020 – Dec 2021",
    location: "Bangalore, India",
    current: false,
    tags: ["Kubernetes", "Python", "Docker"],
  },
];

const skillGroups = [
  { eyebrow: "Languages", items: ["Python", "TypeScript", "Java", "Bash", "SQL"] },
  { eyebrow: "Cloud / Platform", items: ["AWS", "EKS", "Kubernetes", "Terraform", "Docker"] },
  { eyebrow: "Observability", items: ["Prometheus", "Grafana", "OpenTelemetry", "Datadog", "ELK"] },
  { eyebrow: "AI / LLM", items: ["RAG", "LangChain", "pgvector", "HyDE", "LangSmith"] },
  { eyebrow: "Data / Messaging", items: ["PostgreSQL", "Kafka", "Redis", "RabbitMQ", "MySQL"] },
];

const contactLinks = [
  { icon: FaEnvelope, label: "Email", value: "nikhilsainethi@gmail.com", href: "mailto:nikhilsainethi@gmail.com" },
  { icon: FaGithub, label: "GitHub", value: "github.com/nikhilsainethi", href: "https://github.com/nikhilsainethi" },
  { icon: FaLinkedin, label: "LinkedIn", value: "linkedin.com/in/nikhilsai", href: "https://www.linkedin.com/in/nikhilsai/" },
  { icon: FaLocationDot, label: "Location", value: "Charlotte, NC", href: "https://www.google.com/maps/place/Charlotte,+NC/" },
];

/* ─────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main>

      {/* ══════════════════════════════════════════ 01 · HERO ══ */}
      <StackedSection id="hero" transparent>
        <div className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <section className="grid w-full items-center gap-6 lg:grid-cols-[minmax(15rem,0.6fr)_minmax(0,1.4fr)] lg:gap-12">

              {/* Portrait */}
              <Reveal className="group order-2 flex justify-center lg:order-1 lg:justify-start" delay={0.1}>
                <TiltCard className="relative w-full max-w-[18rem] sm:max-w-[20rem]">
                  <div className="glass-panel shimmer-card relative w-full overflow-hidden rounded-[2rem] border border-white/80 p-4 shadow-[0_26px_64px_rgba(20,50,110,0.18)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.82),transparent_60%)]" />
                    <div className="relative space-y-3">
                      <div className="overflow-hidden rounded-[1.55rem] border border-white/70 bg-[linear-gradient(160deg,#c8d8ff_0%,#f0f6ff_45%,#eae4ff_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        <div className="relative overflow-hidden rounded-[1.4rem]">
                          <Image
                            alt="Nikhil Sai Nethi"
                            className="aspect-[4/5] h-auto w-full object-contain object-top bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),transparent_55%)] [clip-path:inset(0_0_0_0_round_1.4rem)] p-1 motion-safe:[animation:portrait-wipe_0.9s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]"
                            height={960}
                            priority
                            src={heroPortraitPath}
                            unoptimized
                            width={768}
                          />
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/12 to-transparent" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Location", value: "Charlotte, NC" },
                          { label: "Current", value: "Moody's" },
                          { label: "Focus", value: "Practical AI" },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-[1rem] border border-white/80 bg-white/72 px-2.5 py-2.5 shadow-[0_8px_20px_rgba(20,50,100,0.10)]">
                            <p className="mono-label text-[10px] text-accent">{label}</p>
                            <p className="mt-1 text-[11px] font-semibold leading-5 text-foreground">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>

              {/* Intro text */}
              <Reveal className="order-1 lg:order-2" delay={0}>
                <div className="space-y-5">
                  <div className="inline-flex">
                    <div className="relative inline-flex rounded-full bg-gradient-to-r from-accent/35 via-purple-400/25 to-[var(--warm-accent)]/30 p-px shadow-[0_0_28px_rgba(84,80,245,0.28)]">
                      <div className="inline-flex rounded-full border border-white/85 bg-white/65 px-4 py-1.5 backdrop-blur-sm">
                        <p className="mono-label text-[11px] text-accent">
                          Software Engineer · Cloud · Observability · AI/LLM
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Name — char-level reveal after intro wipe */}
                    <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl">
                      <CharReveal text="Nikhil Sai Nethi" introDelay={2.6} stagger={0.045} />
                    </h1>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-base font-medium text-muted sm:text-lg">
                        <RoleCycler />
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-50/70 px-3 py-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <p className="mono-label text-[10px] text-emerald-700">Open to opportunities</p>
                      </div>
                    </div>

                    <p className="max-w-3xl text-3xl font-semibold leading-[1.0] tracking-[-0.05em] text-foreground sm:text-4xl lg:text-5xl">
                      <CharReveal text="Building resilient" introDelay={2.9} stagger={0.032} />
                      {" "}
                      <CharReveal text="cloud systems" className="accent-gradient" introDelay={3.45} stagger={0.04} />
                      <CharReveal text=" and practical" introDelay={3.9} stagger={0.032} />
                      {" "}
                      <CharReveal text="AI tooling." className="accent-gradient" introDelay={4.3} stagger={0.05} />
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-6 border-y border-border/60 py-3">
                    {[
                      { value: 2, suffix: "+", label: "Yrs Experience" },
                      { value: 3, suffix: "", label: "Companies" },
                      { value: 3, suffix: "", label: "Certifications" },
                      { value: 150, suffix: "+", label: "Bugs Resolved" },
                    ].map(({ value, suffix, label }, i) => (
                      <div key={label} className="flex items-center gap-6">
                        {i > 0 && <div className="h-7 w-px bg-border/80" />}
                        <div>
                          <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            <AnimatedCounter value={value} suffix={suffix} />
                          </p>
                          <p className="mono-label mt-0.5 text-[10px] text-muted">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3">
                    <MagneticButton>
                      <a
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--warm-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,120,32,0.34)] transition-all hover:-translate-y-0.5 hover:bg-[var(--warm-accent-strong)]"
                        href={resumePath}
                      >
                        Download Resume <FaArrowRight size={11} />
                      </a>
                    </MagneticButton>
                    <MagneticButton>
                      <Link
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/70 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                        href="/experience"
                      >
                        View Experience <FaArrowRight size={11} />
                      </Link>
                    </MagneticButton>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Marquee */}
            <div className="-mx-4 mt-4 hidden border-y border-border/50 py-3 sm:-mx-6 sm:block lg:-mx-8">
              <MarqueeStrip
                items={["AWS","Kubernetes","Python","TypeScript","pgvector","LangChain","OpenTelemetry","Terraform","Jenkins","Linux","RAG","LLM Tooling","Observability","EKS","PostgreSQL"]}
                speed={48}
              />
            </div>

            {/* Scroll indicator */}
            <div className="mt-3 hidden items-center justify-center gap-2 opacity-35 sm:flex">
              <FaArrowDown size={12} className="animate-bounce text-muted" />
              <span className="mono-label text-[10px] text-muted">Scroll to explore</span>
            </div>
          </div>
        </div>
      </StackedSection>

      <div className="section-divider" />
      {/* ══════════════════════════════════════ 02 · PROJECTS ══ */}
      <StackedSection id="projects">
        <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-5">
              <div>
                <p className="mono-label text-[11px] text-[var(--warm-accent)]">02 · Projects</p>
                <h2 className="mt-1.5 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                  Selected Engineering Work
                </h2>
              </div>
              <Link
                href="/projects"
                className="hidden items-center gap-1.5 rounded-full border border-border bg-white/60 px-4 py-2 text-xs font-semibold text-muted transition-all hover:border-accent/40 hover:text-accent sm:flex"
              >
                All projects <FaUpRightFromSquare size={10} />
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Flagship */}
              <div className="card-hover glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-[0_22px_50px_rgba(72,94,138,0.11)]">
                <p className="mono-label text-[10px] text-[var(--warm-accent)]">Flagship · RAG</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
                  Internal RAG Search Engine
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
                  <li className="flex gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warm-accent)]" />
                    Hybrid retrieval (pgvector + BM25), HyDE, reciprocal rank fusion, reranking — ~45% faster
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warm-accent)]" />
                    On-call assistant grounded in runbooks, postmortems, and incident tickets
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["pgvector", "LangChain", "HyDE", "RRF", "S3", "Lambda"].map((t) => (
                    <span key={t} className="rounded-full border border-accent/22 bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] text-accent-strong">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[1rem] border border-border/60 bg-white/70 px-3 py-3">
                    <p className="text-lg font-bold tracking-[-0.04em] text-foreground">~45%</p>
                    <p className="mt-0.5 text-xs text-muted">Faster retrieval after optimization</p>
                  </div>
                  <div className="rounded-[1rem] border border-border/60 bg-white/70 px-3 py-3">
                    <p className="text-lg font-bold tracking-[-0.04em] text-foreground">Grounded</p>
                    <p className="mt-0.5 text-xs text-muted">Answers tied to internal docs</p>
                  </div>
                </div>
              </div>

              {/* Engineering logs */}
              <div className="flex flex-col gap-3">
                {engineeringLogs.map((item) => (
                  <div key={item.title} className="card-hover glass-panel rounded-[1.4rem] border border-white/70 px-5 py-4 shadow-[0_16px_36px_rgba(72,94,138,0.09)]">
                    <p className="mono-label text-[10px] text-[var(--warm-accent)]">Engineering Log</p>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{item.title}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <span key={t} className="rounded-full border border-accent/20 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <Link
                  href="/projects"
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-[1.2rem] border border-dashed border-border/80 py-3 text-xs font-semibold text-muted transition-all hover:border-accent/40 hover:text-accent sm:hidden"
                >
                  All projects <FaUpRightFromSquare size={10} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </StackedSection>

      <div className="section-divider" />
      {/* ══════════════════════════════════════ 03 · EXPERIENCE ══ */}
      <StackedSection id="experience">
        <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-5">
              <div>
                <p className="mono-label text-[11px] text-[var(--warm-accent)]">03 · Experience</p>
                <h2 className="mt-1.5 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                  Work History
                </h2>
              </div>
              <Link
                href="/experience"
                className="hidden items-center gap-1.5 rounded-full border border-border bg-white/60 px-4 py-2 text-xs font-semibold text-muted transition-all hover:border-accent/40 hover:text-accent sm:flex"
              >
                Full timeline <FaUpRightFromSquare size={10} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {experiences.map((exp) => (
                <div
                  key={exp.company}
                  className={`card-hover glass-panel rounded-[1.8rem] border p-5 shadow-[0_20px_46px_rgba(72,94,138,0.10)] ${
                    exp.current ? "border-accent/30 bg-accent-soft/40" : "border-white/70"
                  }`}
                >
                  {exp.current && (
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/70 bg-emerald-50/70 px-2.5 py-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="mono-label text-[9px] text-emerald-700">Current</span>
                    </div>
                  )}
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-foreground">{exp.company}</h3>
                  <p className="mt-0.5 text-sm text-muted">{exp.role}</p>
                  <p className="mono-label mt-2 text-[10px] text-muted/70">{exp.period}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.tags.map((t) => (
                      <span key={t} className="rounded-full border border-accent/20 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 glass-panel rounded-[1.8rem] border border-white/70 p-5 shadow-[0_20px_46px_rgba(72,94,138,0.10)]">
              <p className="mono-label text-[10px] text-accent">Moody&apos;s · Key impact</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Designed and shipped internal RAG search engine — ~45% faster retrieval",
                  "Built SLI/SLO observability with Prometheus, Grafana, OTel, and Datadog",
                  "Automated release safety: smoke tests, canary checks, rollback automation",
                ].map((b) => (
                  <div key={b} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                    <p className="text-xs leading-6 text-muted">{b}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </StackedSection>

      <div className="section-divider" />
      {/* ══════════════════════════════════════ 04 · TECH STACK ══ */}
      <StackedSection id="skills">
        <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-5">
              <div>
                <p className="mono-label text-[11px] text-[var(--warm-accent)]">04 · Tech Stack</p>
                <h2 className="mt-1.5 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                  Technical Skills
                </h2>
              </div>
              <Link
                href="/tech-stack"
                className="hidden items-center gap-1.5 rounded-full border border-border bg-white/60 px-4 py-2 text-xs font-semibold text-muted transition-all hover:border-accent/40 hover:text-accent sm:flex"
              >
                Full stack <FaUpRightFromSquare size={10} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {skillGroups.map((group) => (
                <div
                  key={group.eyebrow}
                  className="card-hover glass-panel rounded-[1.6rem] border border-white/70 p-4 shadow-[0_18px_40px_rgba(72,94,138,0.09)]"
                >
                  <p className="mono-label text-[10px] text-[var(--warm-accent)]">{group.eyebrow}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/80 bg-white/72 px-2.5 py-1 text-[12px] text-muted transition-colors hover:border-accent/30 hover:text-accent-strong"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications strip */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {[
                { code: "CKA", label: "Certified Kubernetes Administrator", issuer: "Linux Foundation" },
                { code: "AWS", label: "AWS Developer – Associate", issuer: "Amazon Web Services" },
                { code: "CCNA", label: "Cisco CCNA", issuer: "Cisco" },
              ].map((cert) => (
                <div key={cert.code} className="flex items-center gap-2.5 rounded-full border border-white/80 bg-white/70 px-4 py-2 shadow-[0_10px_22px_rgba(72,94,138,0.08)]">
                  <span className="font-mono text-[11px] font-bold text-accent">{cert.code}</span>
                  <span className="text-xs text-muted">{cert.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </StackedSection>

      <div className="section-divider" />
      {/* ══════════════════════════════════════ 05 · CONTACT ══ */}
      <StackedSection id="contact" isLast>
        <div className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <div className="mb-10 border-b border-border/60 pb-8">
              <p className="mono-label text-[11px] text-[var(--warm-accent)]">05 · Contact</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl">
                Let&apos;s build something{" "}
                <span className="accent-gradient">resilient.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Open to roles in platform engineering, observability, cloud-native delivery,
                and AI tooling that helps engineers move faster.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactLinks.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="card-hover glass-panel group rounded-[1.8rem] border border-white/75 p-6 shadow-[0_22px_48px_rgba(82,101,142,0.11)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/85 bg-white/80 text-accent shadow-[0_10px_24px_rgba(88,107,144,0.12)]">
                    <Icon size={16} />
                  </div>
                  <p className="mono-label mt-4 text-[10px] text-muted">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                </a>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticButton>
                <a
                  href={resumePath}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--warm-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,120,32,0.34)] transition-all hover:-translate-y-0.5 hover:bg-[var(--warm-accent-strong)]"
                >
                  Download Resume <FaArrowRight size={12} />
                </a>
              </MagneticButton>
              <MagneticButton>
                <a
                  href="mailto:nikhilsainethi@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  Get in Touch <FaArrowRight size={12} />
                </a>
              </MagneticButton>
            </div>

          </div>
        </div>
      </StackedSection>

    </main>
  );
}
