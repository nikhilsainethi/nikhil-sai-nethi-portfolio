"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function MagneticButton({
  children,
  className,
  strength = 0.2,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldSimplify = useShouldSimplifyMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldSimplify) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: "inline-block",
        transition: "transform .4s cubic-bezier(.16,1,.3,1)",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
