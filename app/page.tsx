import { Reveal } from "@/components/portfolio/Reveal";
import Image from "next/image";
import Link from "next/link";
import { createPageMetadata, heroPortraitPath, resumePath } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Home",
  description:
    "Home page for Nikhil Sai Nethi, focused on cloud infrastructure, observability, and practical AI tooling.",
  path: "/",
});

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
      <section className="grid min-h-[calc(100vh-13rem)] w-full items-center gap-10 py-8 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.12fr)] lg:gap-14 lg:py-12">
        <Reveal className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="glass-panel relative w-full max-w-[26rem] overflow-hidden rounded-[2.2rem] border border-white/75 p-5 shadow-[0_30px_80px_rgba(59,87,136,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.78),transparent_60%)]" />
            <div className="relative space-y-5">
              <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(160deg,#dbe7ff_0%,#f9fbff_45%,#f3efff_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="relative overflow-hidden rounded-[1.4rem] bg-[linear-gradient(160deg,#cadcff_0%,#eef4ff_55%,#f9f2ff_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),transparent_58%)]" />
                  <Image
                    alt="Nikhil Sai Nethi portrait"
                    className="relative aspect-[4/5] h-auto w-full object-contain p-3"
                    height={960}
                    priority
                    src={heroPortraitPath}
                    unoptimized
                    width={768}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/75 bg-white/65 px-4 py-4 shadow-[0_14px_30px_rgba(74,98,138,0.09)]">
                  <p className="mono-label text-[11px] text-accent">Location</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Charlotte, NC</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/75 bg-white/65 px-4 py-4 shadow-[0_14px_30px_rgba(74,98,138,0.09)]">
                  <p className="mono-label text-[11px] text-accent">Current</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Moody&apos;s Corporation</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/75 bg-white/65 px-4 py-4 shadow-[0_14px_30px_rgba(74,98,138,0.09)]">
                  <p className="mono-label text-[11px] text-accent">Focus</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Practical AI</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-white/80 bg-white/55 px-4 py-2 shadow-[0_12px_24px_rgba(95,118,165,0.08)]">
              <p className="mono-label text-[11px] text-accent">
                Software Engineer · Cloud Infrastructure · Observability · AI/LLM
              </p>
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
                Nikhil Sai Nethi
              </h1>
              <p className="max-w-2xl text-lg font-medium text-muted sm:text-xl">
                Software Engineer | Cloud &amp; Infrastructure | AI/LLM Enthusiast
              </p>
              <p className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-foreground sm:text-5xl lg:text-[5.3rem]">
                Building resilient{" "}
                <span className="text-accent">cloud systems</span> and practical{" "}
                <span className="text-accent">AI tooling.</span>
              </p>
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Based in Charlotte, NC. Currently building resilient systems at
                Moody&apos;s and exploring RAG workflows. I turn complex infrastructure
                challenges into observable, automated engineering systems.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                className="inline-flex items-center justify-center rounded-full bg-[var(--warm-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,138,61,0.26)] transition-all hover:-translate-y-0.5 hover:bg-[var(--warm-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--warm-accent)]"
                href={resumePath}
              >
                Download Resume
              </a>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-border bg-white/65 px-6 py-3 text-sm font-semibold text-foreground shadow-[0_12px_24px_rgba(90,106,141,0.08)] transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href="/projects"
              >
                View Projects
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
