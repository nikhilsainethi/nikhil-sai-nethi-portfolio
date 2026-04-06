"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import type { ReactNode } from "react";

type ParallaxWrapperProps = {
  children: ReactNode;
  className?: string;
  /** How much the element moves relative to scroll. 0.3 = 30% of scroll distance */
  factor?: number;
};

/**
 * Moves children at a different scroll speed, creating a parallax depth effect.
 */
export function ParallaxWrapper({ children, className, factor = 0.3 }: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", `${factor * 100}%`]);
  const y = useSpring(rawY, { stiffness: 80, damping: 20 });

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
