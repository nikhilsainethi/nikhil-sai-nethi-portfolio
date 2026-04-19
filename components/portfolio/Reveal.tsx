"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "./useReveal";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
  style?: CSSProperties;
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  style,
}: RevealProps) {
  const [ref, visible] = useReveal<HTMLDivElement>();
  const base = direction === "left" ? "reveal-left" : "reveal";
  const composed = `${base}${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`;

  return (
    <div
      ref={ref}
      className={composed}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}
