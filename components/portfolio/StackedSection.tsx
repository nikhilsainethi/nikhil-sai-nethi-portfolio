"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type Props = {
  children: ReactNode;
  id?: string;
  transparent?: boolean;
  isLast?: boolean;
};

/**
 * Full-viewport section with an extreme Awwwards-style entrance.
 * Uses clip-path unmasking and deep vertical reveals for dramatic
 * scroll-driven appearances.
 */
export function StackedSection({ children, id, transparent = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const shouldSimplify = useShouldSimplifyMotion();
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const bgClass = transparent ? "" : "bg-background";

  if (shouldSimplify) {
    return (
      <section ref={ref} id={id} className={`min-h-screen ${bgClass}`}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative min-h-screen ${bgClass} overflow-hidden`}
      initial={{
        clipPath: "inset(20% 10% 20% 10% round 30px)",
        opacity: 0,
        y: 100,
        scale: 0.9
      }}
      animate={isInView ? {
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        opacity: 1,
        y: 0,
        scale: 1
      } : {}}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Very snappy custom easing
        opacity: { duration: 0.8 }
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.section>
  );
}
