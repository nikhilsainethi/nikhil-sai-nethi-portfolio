"use client";

import type { ReactNode } from "react";
import { ScrambleHeading } from "./ScrambleHeading";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  scramble?: boolean;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  sub,
  scramble = false,
}: SectionHeadingProps) {
  return (
    <Reveal>
      <div style={{ marginBottom: 56 }}>
        <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
          <span
            style={{
              fontFamily:
                "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11,
              color: "var(--amber)",
              letterSpacing: ".2em",
            }}
          >
            {index}
          </span>
          <span
            aria-hidden="true"
            style={{ width: 28, height: 1, background: "var(--border2)" }}
          />
          <span className="mono-label">{eyebrow}</span>
        </div>
        <h2
          style={{
            fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
            fontWeight: 700,
            letterSpacing: "-.04em",
            lineHeight: 1.05,
            color: "var(--fg)",
            marginBottom: sub ? 14 : 0,
          }}
        >
          {scramble && typeof title === "string" ? (
            <ScrambleHeading text={title} />
          ) : (
            title
          )}
        </h2>
        {sub && (
          <p
            style={{
              color: "var(--muted2)",
              fontSize: 16,
              lineHeight: 1.75,
              maxWidth: 580,
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </Reveal>
  );
}
