import { AnimatedCounter } from "@/components/portfolio/AnimatedCounter";
import { MarqueeStrip } from "@/components/portfolio/MarqueeStrip";
import { MagneticButton } from "@/components/portfolio/MagneticButton";
import { Reveal } from "@/components/portfolio/Reveal";
import { RoleCycler } from "@/components/portfolio/RoleCycler";
import { CharReveal } from "@/components/portfolio/CharReveal";
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
    <main className="bg-transparent text-white">

      {/* ------------------------------------------ 01 · HERO -- */}
      <StackedSection id="hero" transparent>
        <div className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <section className="grid w-full items-center gap-6 lg:grid-cols-[minmax(15rem,0.6fr)_minmax(0,1.4fr)] lg:gap-12">

              {/* Portrait */}
              <Reveal className="group order-2 flex justify-center lg:order-1 lg:justify-start" delay={1.2}>
                <TiltCard className="relative w-full max-w-[18rem] sm:max-w-[20rem]">
                  <div className="glass-panel shimmer-card relative w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/5 p-4 shadow-[0_26px_64px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),transparent_60%)]" />
                    <div className="relative space-y-3">
                      <div className="overflow-hidden rounded-[1.55rem] border border-white/20 bg-white/10 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                        <div className="relative overflow-hidden rounded-[1.4rem]">
                          <Image
                            alt="Nikhil Sai Nethi"
                            className="aspect-[4/5] h-auto w-full object-contain object-top bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),transparent_55%)] [clip-path:inset(0_0_0_0_round_1.4rem)] p-1 motion-safe:[animation:portrait-wipe_1.5s_cubic-bezier(0.16,1,0.3,1)_1.4s_both]"
                            height={960}
                            priority
                            src={heroPortraitPath}
                            unoptimized
                            width={768}
                          />
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Location", value: "Charlotte" },
                          { label: "Current", value: "Moody's" },
                          { label: "Focus", value: "Platform" },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-[1rem] border border-white/10 bg-white/5 px-2.5 py-2.5 text-center shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                            <p className="mono-label text-[9px] text-[#ffcc44]">{label}</p>
                            <p className="mt-1 text-[11px] font-semibold leading-5 text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>

              {/* Intro text */}
              <Reveal className="order-1 lg:order-2" delay={1.0}>
                <div className="space-y-6">
                  <div className="inline-flex">
                    <div className="relative inline-flex rounded-full bg-gradient-to-r from-accent/50 via-purple-400/30 to-[#ff7820]/40 p-[1px] shadow-[0_0_28px_rgba(84,80,245,0.4)]">
                      <div className="inline-flex rounded-full bg-black/60 px-5 py-2 backdrop-blur-md">
                        <p className="mono-label text-[11px] text-[#a89dff]">
                          Software Engineer · Cloud · Observability · AI/LLM
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Name — char-level reveal after intro wipe */}
                    <h1 className="text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                      <CharReveal text="Nikhil" introDelay={1.4} stagger={0.06} />
                      <br />
                      <CharReveal text="Sai Nethi." introDelay={1.8} stagger={0.06} />
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <p className="text-xl text-white/70">Building</p>
                      <RoleCycler />
                      <p className="text-xl text-white/70">systems.</p>
                    </div>

                    <p className="max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                      Specializing in deep observability, reliable Kubernetes platforms, and practical AI integrations that make engineering teams faster and systems harder to break.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 pt-4">
                    <MagneticButton>
                      <a
                        href="#experience"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                      >
                        Explore Work <FaArrowDown size={12} />
                      </a>
                    </MagneticButton>
                    <MagneticButton>
                      <a
                        href={resumePath}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10"
                      >
                        Resume <FaUpRightFromSquare size={12} />
                      </a>
                    </MagneticButton>
                  </div>
                </div>
              </Reveal>

            </section>

          </div>
        </div>
      </StackedSection>

      <div className="section-divider opacity-30" />

      {/* ------------------------------------------ 02 · ABOUT -- */}
      <StackedSection id="about">
        <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">

            <Reveal delay={0.1}>
              <div className="sticky top-24 space-y-6">
                <p className="mono-label text-[11px] text-[#ff7820]">02 · The Philosophy</p>
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  Code is easy.<br/>
                  <span className="accent-gradient">Operations</span> is hard.
                </h2>
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-accent to-transparent" />
                <p className="text-lg leading-relaxed text-white/70">
                  I started out building features, but quickly realized that the real challenge isn&apos;t writing the code—it&apos;s keeping it running. I pivot between writing distributed backend services and constructing the platforms they run on.
                </p>
                <p className="text-lg leading-relaxed text-white/70">
                  Right now, I&apos;m building internal LLM tools and RAG systems at Moody&apos;s, wrapping them in heavy observability (Prometheus, OTel) to ensure we don&apos;t just ship AI, but ship it reliably.
                </p>
              </div>
            </Reveal>

            <div className="space-y-6">
              {engineeringLogs.map((log, i) => (
                <Reveal key={log.title} delay={0.1 + i * 0.1}>
                  <div className="card-hover glass-panel group rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl transition-all hover:border-white/30 hover:bg-white/10">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-[#a89dff]">
                          0{i + 1}
                        </span>
                        <p className="font-mono text-xs text-white/50">Engineering Log</p>
                      </div>
                      <FaArrowRight className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{log.title}</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {log.tags.map(tag => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}

              <Reveal delay={0.4}>
                <div className="card-hover glass-panel flex flex-col items-center justify-center rounded-[2rem] border border-[#ff7820]/30 bg-gradient-to-br from-[#ff7820]/10 to-transparent p-8 text-center shadow-2xl">
                  <AnimatedCounter value={99.99} suffix="%" />
                  <p className="mt-2 font-mono text-sm text-[#ffcc44]">Target Uptime</p>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </StackedSection>

      {/* Marquee Strip injected here for visual break */}
      <div className="my-10 border-y border-white/10 bg-black/40 py-6">
        <MarqueeStrip items={["EKS", "OTel", "RAG", "LangChain", "Resilience", "Automation"]} speed={40} className="opacity-80" />
      </div>

      {/* -------------------------------------- 03 · EXPERIENCE -- */}
      <StackedSection id="experience">
        <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-6">
              <div>
                <p className="mono-label text-[11px] text-[#ff7820]">03 · Experience</p>
                <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                  Work History
                </h2>
              </div>
              <Link
                href="/experience"
                className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 sm:flex"
              >
                Full timeline <FaUpRightFromSquare size={12} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {experiences.map((exp, i) => (
                <Reveal key={exp.company} delay={0.1 * i} className="h-full">
                  <div className={`card-hover glass-panel flex h-full flex-col rounded-[2rem] border p-6 shadow-2xl ${
                    exp.current ? "border-accent/50 bg-accent/10" : "border-white/10 bg-white/5"
                  }`}>
                    {exp.current && (
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 w-fit">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="mono-label text-[10px] text-emerald-400">Current</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                    <p className="mt-1 font-mono text-sm text-[#a89dff]">{exp.role}</p>
                    <p className="mt-2 text-sm text-white/50">{exp.period}</p>
                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map((t) => (
                          <span key={t} className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/70">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </div>
      </StackedSection>

      <div className="section-divider opacity-30" />
      {/* -------------------------------------- 04 · TECH STACK -- */}
      <StackedSection id="skills">
        <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">

            <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-6">
              <div>
                <p className="mono-label text-[11px] text-[#ff7820]">04 · Tech Stack</p>
                <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                  Capabilities
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {skillGroups.map((group, i) => (
                <Reveal key={group.eyebrow} delay={i * 0.05}>
                  <div className="card-hover glass-panel h-full rounded-[1.6rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
                    <p className="mono-label mb-4 text-[10px] text-[#ffcc44]">{group.eyebrow}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-accent/50 hover:bg-accent/20 hover:text-white"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </div>
      </StackedSection>

      <div className="section-divider opacity-30" />
      {/* ----------------------------------------- 05 · CONTACT -- */}
      <StackedSection id="contact" isLast>
        <div className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto w-full max-w-6xl text-center">

            <Reveal delay={0.1}>
              <p className="mono-label mb-6 text-[11px] text-[#ff7820]">05 · Next Steps</p>
              <h2 className="text-5xl font-black tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
                Ready to scale?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
                Open to roles in platform engineering, observability, cloud-native delivery,
                and AI tooling that helps engineers move faster.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-12 flex flex-wrap justify-center gap-6">
                <MagneticButton>
                  <a
                    href="mailto:nikhilsainethi@gmail.com"
                    className="inline-flex h-16 items-center gap-3 rounded-full bg-white px-8 text-lg font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-transform hover:scale-105"
                  >
                    Start a Conversation <FaArrowRight />
                  </a>
                </MagneticButton>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-20 flex flex-wrap justify-center gap-4">
                {contactLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                    aria-label={label}
                  >
                    <Icon size={20} className="transition-transform group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </StackedSection>

    </main>
  );
}
