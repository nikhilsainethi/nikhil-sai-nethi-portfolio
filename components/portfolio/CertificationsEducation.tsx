import { IdentityMark } from "@/components/portfolio/IdentityMark";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { FaAws, FaGraduationCap } from "react-icons/fa6";
import { SiCisco, SiKubernetes } from "react-icons/si";
import type { IconType } from "react-icons";

const certifications: Array<{
  code: string;
  title: string;
  subtitle: string;
  issuer: string;
  link: string;
  icon: IconType;
}> = [
  {
    code: "CKA",
    title: "Certified Kubernetes Administrator",
    subtitle: "CKA · Jun 2024",
    issuer: "Linux Foundation",
    link: "https://www.credly.com/badges/55e7e691-b5df-4be7-87f4-da042a70b5b2/linked_in_profile",
    icon: SiKubernetes,
  },
  {
    code: "AWS",
    title: "AWS Certified Developer - Associate",
    subtitle: "AWS · Mar 2024",
    issuer: "Amazon Web Services",
    link: "https://www.credly.com/badges/2ef43aed-5ff7-46da-acb9-bab22d26b784/linked_in_profile",
    icon: FaAws,
  },
  {
    code: "CCNA",
    title: "Cisco Certified Network Associate",
    subtitle: "CCNA · Dec 2025",
    issuer: "Cisco",
    link: "https://www.credly.com/badges/5d44ead0-d834-459c-9431-4c8546c665c8/linked_in_profile",
    icon: SiCisco,
  },
];

const education = [
  {
    degree: "MS in Computer Science",
    school: "California State University East Bay",
    mark: "CS",
    logoPath: "/logos/csueb-seal.svg" as const,
    location: "Hayward, California, USA",
    period: "Jan 2022 - Dec 2023",
  },
  {
    degree: "B.Tech",
    school: "Vellore Institute of Technology",
    mark: "VIT",
    logoPath: "/logos/vit-seal.svg" as const,
    location: "Vellore, India",
    period: "2016 - 2021",
  },
];

export function CertificationsEducation() {
  return (
    <section className="py-8 sm:py-10">
      <SectionHeading
        eyebrow="Credentials"
        title="Certifications & Education"
        description="Foundational credentials spanning cloud platforms, Kubernetes operations, networking, and formal computer science training."
        index="02"
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[2rem] border border-border/80 p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4 border-b border-border/75 pb-5">
            <div>
              <p className="mono-label text-[11px] text-muted">Certifications</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                Active Credentials
              </p>
            </div>
            <span className="rounded-full border border-border/75 bg-surface-strong px-3 py-1 font-mono text-xs text-muted">
              {certifications.length} total
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {certifications.map((certification) => {
              const Icon = certification.icon;

              return (
                <a
                  key={certification.title}
                  className="card-hover block rounded-[1.4rem] border border-border/80 bg-surface-strong p-5 shadow-[0_14px_34px_color-mix(in_srgb,var(--foreground)_10%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  href={certification.link}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-border/70 bg-surface text-accent">
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent-strong">
                      {certification.code}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold leading-6 text-foreground">
                    {certification.title}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    {certification.subtitle}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted">{certification.issuer}</p>
                    <span className="link-underline text-xs font-medium text-accent">
                      View badge
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-border/80 p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 border-b border-border/75 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-border/70 bg-surface-strong text-accent">
              <FaGraduationCap size={18} />
            </div>
            <div>
              <p className="mono-label text-[11px] text-muted">Education</p>
              <p className="text-lg font-semibold text-foreground">Academic Path</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {education.map((item) => (
              <article
                key={item.school}
                className="rounded-[1.4rem] border border-border/80 bg-surface-strong p-5 shadow-[0_14px_34px_color-mix(in_srgb,var(--foreground)_10%,transparent)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <IdentityMark
                      label={item.school}
                      logoPath={item.logoPath}
                      mark={item.mark}
                      className="h-14 w-14 rounded-[1rem] p-1.5"
                    />
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {item.degree}
                      </p>
                      <p className="mt-1 text-sm text-muted">{item.school}</p>
                      <p className="mt-2 text-sm text-muted">{item.location}</p>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-muted shrink-0">{item.period}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
