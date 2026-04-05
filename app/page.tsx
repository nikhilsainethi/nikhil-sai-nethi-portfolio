import { CertificationsEducation } from "@/components/portfolio/CertificationsEducation";
import { Contact } from "@/components/portfolio/Contact";
import { EngineeringLogs } from "@/components/portfolio/EngineeringLogs";
import { ExperienceTimeline } from "@/components/portfolio/ExperienceTimeline";
import { Header } from "@/components/portfolio/Header";
import { Reveal } from "@/components/portfolio/Reveal";
import { Skills } from "@/components/portfolio/Skills";
import { resumePath } from "@/lib/site";

export default function Home() {
  return (
    <div className="grain-overlay min-h-screen">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-10 sm:px-8 lg:px-12">
        <section
          id="about"
          className="grid gap-10 border-b border-border pb-16 pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-16 lg:pb-24"
        >
          <Reveal className="space-y-8">
            <div className="space-y-4">
              <p className="mono-label text-xs text-muted">Software Engineer</p>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                Nikhil Sai Nethi
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Software Engineer | Cloud &amp; Infrastructure | AI/LLM Enthusiast
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-sm border border-accent bg-accent px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(199,116,52,0.18)] hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href="#experience"
              >
                View My Work
              </a>
              <a
                className="inline-flex items-center justify-center rounded-sm border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href={resumePath}
              >
                Download Resume
              </a>
            </div>

            <div className="grid gap-4 border-t border-border pt-6 text-sm text-muted sm:grid-cols-3">
              <div>
                <p className="mono-label mb-2 text-[11px] text-muted">Focus</p>
                <p>Cloud infrastructure</p>
              </div>
              <div>
                <p className="mono-label mb-2 text-[11px] text-muted">Current</p>
                <p>Moody&apos;s Corporation</p>
              </div>
              <div>
                <p className="mono-label mb-2 text-[11px] text-muted">Location</p>
                <p>Charlotte, NC</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="glass-panel relative overflow-hidden rounded-[1.75rem] border border-border p-7 shadow-[0_18px_50px_rgba(17,24,39,0.06)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            <p className="mono-label text-xs text-accent">About Me</p>
            <div className="mt-5 space-y-5 text-base leading-8 text-muted">
              <p>
                Based in Charlotte, NC. Currently building resilient systems at
                Moody&apos;s and exploring RAG workflows.
              </p>
              <p>
                Passionate about turning complex infrastructure challenges into
                observable, automated solutions.
              </p>
              <p>
                My work sits at the intersection of platform reliability,
                deep diagnostics, and practical AI tooling for engineering teams.
              </p>
            </div>
          </Reveal>
        </section>

        <ExperienceTimeline />
        <Skills />
        <EngineeringLogs />
        <CertificationsEducation />
        <Contact />
      </main>
    </div>
  );
}
