import { Reveal } from "@/components/portfolio/Reveal";
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-14 lg:px-8">
      <section className="grid w-full items-center gap-10 py-8 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.12fr)] lg:gap-14 lg:py-12">
        {/* Portrait card */}
        <Reveal className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="glass-panel relative w-full max-w-[26rem] overflow-hidden rounded-[2.2rem] border border-white/75 p-5 shadow-[0_30px_80px_rgba(59,87,136,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.78),transparent_60%)]" />
            <div className="relative space-y-5">
              <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(160deg,#dbe7ff_0%,#f9fbff_45%,#f3efff_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="relative overflow-hidden rounded-[1.4rem]">
                  <Image
                    alt="Nikhil Sai Nethi"
                    className="aspect-[4/5] h-auto w-full object-cover object-top"
                    height={960}
                    priority
                    src={heroPortraitPath}
                    unoptimized
                    width={768}
                  />
                  {/* Subtle vignette at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-white/75 bg-white/65 px-3 py-3 shadow-[0_10px_24px_rgba(74,98,138,0.08)]">
                  <p className="mono-label text-[10px] text-accent">Location</p>
                  <p className="mt-1.5 text-xs font-semibold text-foreground">Charlotte, NC</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/75 bg-white/65 px-3 py-3 shadow-[0_10px_24px_rgba(74,98,138,0.08)]">
                  <p className="mono-label text-[10px] text-accent">Current</p>
                  <p className="mt-1.5 text-xs font-semibold text-foreground">Moody&apos;s Corp</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/75 bg-white/65 px-3 py-3 shadow-[0_10px_24px_rgba(74,98,138,0.08)]">
                  <p className="mono-label text-[10px] text-accent">Focus</p>
                  <p className="mt-1.5 text-xs font-semibold text-foreground">Practical AI</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Intro text */}
        <Reveal className="order-1 lg:order-2">
          <div className="space-y-7">
            {/* Badge pill with gradient glow */}
            <div className="inline-flex">
              <div className="relative inline-flex rounded-full bg-gradient-to-r from-accent/30 via-purple-400/20 to-[var(--warm-accent)]/25 p-px shadow-[0_0_28px_rgba(108,99,255,0.22)]">
                <div className="inline-flex rounded-full border border-white/80 bg-white/60 px-4 py-2 backdrop-blur-sm">
                  <p className="mono-label text-[11px] text-accent">
                    Software Engineer · Cloud Infrastructure · Observability · AI/LLM
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <h1 className="text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
                Nikhil Sai Nethi
              </h1>

              {/* Open to opportunities badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/60 px-3 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-950/30">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="mono-label text-[11px] text-emerald-700 dark:text-emerald-400">
                  Open to opportunities
                </p>
              </div>

              {/* Hero headline with gradient accent */}
              <p className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-foreground sm:text-5xl lg:text-[5.3rem]">
                Building resilient{" "}
                <span className="accent-gradient">cloud systems</span> and practical{" "}
                <span className="accent-gradient">AI tooling.</span>
              </p>

              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Based in Charlotte, NC. Currently building resilient systems at
                Moody&apos;s and exploring RAG workflows. I turn complex infrastructure
                challenges into observable, automated engineering systems.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 border-y border-border/60 py-4">
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">2+</p>
                <p className="mono-label mt-0.5 text-[10px] text-muted">Yrs Experience</p>
              </div>
              <div className="h-8 w-px bg-border/80" />
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">3</p>
                <p className="mono-label mt-0.5 text-[10px] text-muted">Companies</p>
              </div>
              <div className="h-8 w-px bg-border/80" />
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">3</p>
                <p className="mono-label mt-0.5 text-[10px] text-muted">Certifications</p>
              </div>
              <div className="h-8 w-px bg-border/80" />
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">150+</p>
                <p className="mono-label mt-0.5 text-[10px] text-muted">Bugs Resolved</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                className="inline-flex items-center gap-2 justify-center rounded-full bg-[var(--warm-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,138,61,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[var(--warm-accent-strong)] hover:shadow-[0_20px_40px_rgba(255,138,61,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--warm-accent)]"
                href={resumePath}
              >
                Download Resume
                <FaArrowRight size={12} />
              </a>
              <Link
                className="inline-flex items-center gap-2 justify-center rounded-full border border-border bg-white/65 px-6 py-3 text-sm font-semibold text-foreground shadow-[0_12px_24px_rgba(90,106,141,0.08)] transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href="/experience"
              >
                View Experience
                <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Scroll indicator */}
      <div className="flex justify-center pb-4 pt-2 opacity-50">
        <div className="animate-bounce text-muted">
          <FaArrowDown size={14} />
        </div>
      </div>
    </main>
  );
}
