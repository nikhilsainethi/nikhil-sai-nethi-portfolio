"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function TiltCard({ children, className, style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldSimplify = useShouldSimplifyMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldSimplify) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    el.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-4px)`;
    el.style.boxShadow = `${-x * 2}px ${y * 2}px 50px rgba(0,0,0,.4), 0 0 40px rgba(0,229,199,.07)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: "transform .35s ease, box-shadow .35s ease",
        willChange: "transform",
        ...style,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
