"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type MarqueeStripProps = {
  items: string[];
  speed?: number; // px per second
  className?: string;
};

const SEPARATOR = "·";

export function MarqueeStrip({ items, speed = 55, className }: MarqueeStripProps) {
  const shouldSimplifyMotion = useShouldSimplifyMotion();

  if (shouldSimplifyMotion) {
    return <StaticMarqueeStrip items={items} className={className} />;
  }

  return <AnimatedMarqueeStrip items={items} speed={speed} className={className} />;
}

function AnimatedMarqueeStrip({
  items,
  speed = 55,
  className,
}: MarqueeStripProps) {
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    const inner = innerRef.current;
    if (!inner) return;
    const halfWidth = inner.scrollWidth / 2;
    let next = baseX.get() - (speed * delta) / 1000;
    if (next <= -halfWidth) next += halfWidth;
    baseX.set(next);
  });

  // Duplicate items so the marquee loops seamlessly
  const allItems = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className ?? ""}`}
      aria-hidden
      data-motion="animated"
      data-testid="marquee-strip"
    >
      <motion.div
        ref={innerRef}
        style={{ x: baseX }}
        className="flex min-w-max items-center gap-0 whitespace-nowrap"
      >
        {allItems.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/55">
              {item}
            </span>
            <span className="text-accent/40 text-xs">{SEPARATOR}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function StaticMarqueeStrip({
  items,
  className,
}: Pick<MarqueeStripProps, "items" | "className">) {
  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      data-motion="static"
      data-testid="marquee-strip"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
        {items.map((item) => (
          <span key={item} className="flex items-center">
            <span className="px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
