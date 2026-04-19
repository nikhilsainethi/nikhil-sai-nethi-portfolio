"use client";

import type { CSSProperties } from "react";
import { useCounter } from "./useCounter";

type AnimatedCounterProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
};

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  duration = 1700,
  className,
  style,
}: AnimatedCounterProps) {
  const [ref, count] = useCounter<HTMLSpanElement>(value, decimals, duration);
  const displayed = decimals > 0 ? count.toFixed(decimals) : Math.round(count);
  return (
    <span ref={ref} className={className} style={style}>
      {displayed}
      {suffix}
    </span>
  );
}
