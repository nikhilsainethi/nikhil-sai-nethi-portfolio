import { AnimatedCounter } from "@/components/portfolio/AnimatedCounter";
import { MarqueeStrip } from "@/components/portfolio/MarqueeStrip";
import { MagneticButton } from "@/components/portfolio/MagneticButton";
import { Reveal } from "@/components/portfolio/Reveal";
import { RoleCycler } from "@/components/portfolio/RoleCycler";
import { SplitText } from "@/components/portfolio/SplitText";
import { TiltCard } from "@/components/portfolio/TiltCard";
import Image from "next/image";
import Link from "next/link";
import { FaArrowDown, FaArrowRight } from "react-icons/fa6";
import { createPageMetadata, heroPortraitPath, resumePath } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Home",
  description:
    "Home page for Nikhil Sai Nethi, focused on cloud infrastructure, observability, and practical AI tooling.",
  path: "/",
});

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-14 lg:px-8">
      <section className="grid w-full items-center gap-7 py-4 sm:gap-10 sm:py-8 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.12fr)] lg:gap-14 lg:py-12">

        {/* ── Portrait card with 3-D tilt ── */}
        <Reveal className="group order-2 flex justify-center lg:order-1 lg:justify-start" delay={0.1}>
          <TiltCard className="relative w-full max-w-[22rem] sm:max-w-[26rem]">
            <div className="glass-panel shimmer-card relative w-full overflow-hidden rounded-[2rem] border border-white/80 p-4 shadow-[0_26px_64px_rgba(20,50,110,0.18)] sm:rounded-[2.2rem] sm:p-5 sm:shadow-[0_30px_80px_rgba(20,50,110,0.22)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.82),transparent_60%)]" />
              <div className="relative space-y-3 sm:space-y-4">
                {/* Photo — clip-path wipe reveal */}
                <div className="overflow-hidden rounded-[1.55rem] border border-white/70 bg-[linear-gradient(160deg,#c8d8ff_0%,#f0f6ff_45%,#eae4ff_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:rounded-[1.8rem] sm:p-2">
                  <div className="relative overflow-hidden rounded-[1.4rem]">
                    <Image
                      alt="Nikhil Sai Nethi"
                      className="aspect-[4/5] h-auto w-full object-contain object-top bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),transparent_55%)] [clip-path:inset(0_0_0_0_round_1.4rem)] p-1 motion-safe:[animation:portrait-wipe_0.9s_cubic-bezier(0.22,1,0.36,1)_0.2s_both] sm:p-2"
                      height={960}
                      priority
                      src={heroPortraitPath}
                      unoptimized
                      width={768}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/12 to-transparent" />
                  </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Location", value: "Charlotte, NC" },
                    { label: "Current", value: "Moody's" },
                    { label: "Focus", value: "Practical AI" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-[1rem] border border-white/80 bg-white/72 px-2.5 py-3 shadow-[0_8px_20px_rgba(20,50,100,0.10)] sm:rounded-[1.2rem] sm:px-3"
                    >
                      <p className="mono-label text-[10px] text-accent">{label}</p>
                      <p className="mt-1.5 text-[11px] font-semibold leading-5 text-foreground sm:text-xs">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        {/* ── Intro text ── */}
        <Reveal className="order-1 lg:order-2" delay={0}>
          <div className="space-y-6 sm:space-y-7">

            {/* Badge pill with gradient glow */}
            <div className="inline-flex">
              <div className="relative inline-flex rounded-full bg-gradient-to-r from-accent/35 via-purple-400/25 to-[var(--warm-accent)]/30 p-px shadow-[0_0_28px_rgba(84,80,245,0.28)]">
                <div className="inline-flex rounded-full border border-white/85 bg-white/65 px-4 py-2 backdrop-blur-sm">
                  <p className="mono-label text-[11px] text-accent">
                    Software Engineer · Cloud · Observability · AI/LLM
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
                Nikhil Sai Nethi
              </h1>

              {/* Cycling role + open badge */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
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

              {/* Hero headline — word-by-word reveal */}
              <p className="max-w-3xl text-[2.85rem] font-semibold leading-[0.98] tracking-[-0.07em] text-foreground sm:text-5xl lg:text-[5.3rem]">
                <SplitText
                  text="Building resilient"
                  delay={0.1}
                  stagger={0.07}
                />
                {" "}
                <SplitText
                  text="cloud systems"
                  className="accent-gradient"
                  delay={0.38}
                  stagger={0.08}
                />
                <SplitText
                  text=" and practical"
                  delay={0.6}
                  stagger={0.07}
                />
                {" "}
                <SplitText
                  text="AI tooling."
                  className="accent-gradient"
                  delay={0.82}
                  stagger={0.09}
                />
              </p>

              <p className="max-w-2xl text-[15px] leading-7 text-muted sm:text-lg sm:leading-8">
                Based in Charlotte, NC. Currently building resilient systems at
                Moody&apos;s and exploring RAG workflows. I turn complex infrastructure
                challenges into observable, automated engineering systems.
              </p>
            </div>

            {/* Stats row */}
            <div
              className="grid w-full grid-cols-2 gap-3 rounded-[1.6rem] border border-white/65 bg-white/42 p-4 shadow-[0_18px_36px_rgba(48,72,116,0.10)] sm:flex sm:flex-wrap sm:items-center sm:gap-6 sm:rounded-none sm:border-x-0 sm:border-y sm:border-border/60 sm:bg-transparent sm:p-0 sm:py-4 sm:shadow-none"
              data-testid="hero-stats"
            >
              {[
                { value: 2, suffix: "+", label: "Yrs Experience" },
                { value: 3, suffix: "", label: "Companies" },
                { value: 3, suffix: "", label: "Certifications" },
                { value: 150, suffix: "+", label: "Bugs Resolved" },
              ].map(({ value, suffix, label }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-6 rounded-[1rem] border border-white/70 bg-white/70 px-3 py-3 shadow-[0_10px_22px_rgba(48,72,116,0.08)] sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none"
                >
                  {i > 0 && <div className="hidden h-8 w-px bg-border/80 sm:block" />}
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      <AnimatedCounter value={value} suffix={suffix} />
                    </p>
                    <p className="mono-label mt-0.5 text-[10px] text-muted">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <MagneticButton>
                <a
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--warm-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,120,32,0.34)] transition-all hover:-translate-y-0.5 hover:bg-[var(--warm-accent-strong)] hover:shadow-[0_22px_44px_rgba(255,120,32,0.44)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--warm-accent)] sm:w-auto"
                  href={resumePath}
                >
                  Download Resume
                  <FaArrowRight size={12} />
                </a>
              </MagneticButton>
              <MagneticButton>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-semibold text-foreground shadow-[0_12px_24px_rgba(20,50,100,0.10)] transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
                  href="/experience"
                >
                  View Experience
                  <FaArrowRight size={12} />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Marquee tech strip */}
      <div className="-mx-4 mt-2 hidden w-full max-w-none border-y border-border/50 px-0 py-3 sm:-mx-6 sm:block lg:-mx-8">
        <MarqueeStrip
          items={[
            "AWS", "Kubernetes", "Python", "TypeScript", "pgvector",
            "LangChain", "OpenTelemetry", "Terraform", "Jenkins", "Linux",
            "RAG", "LLM Tooling", "Observability", "EKS", "PostgreSQL",
          ]}
          speed={48}
        />
      </div>

      {/* Scroll indicator */}
      <div className="hidden justify-center pb-4 pt-4 opacity-40 sm:flex">
        <div className="animate-bounce text-muted">
          <FaArrowDown size={14} />
        </div>
      </div>
    </main>
  );
}
