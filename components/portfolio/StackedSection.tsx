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
 * Full-viewport section with a scroll-triggered entrance.
 * When the section enters the viewport it scales up from 0.96 → 1 and
 * fades in, creating a clean "card rising into view" feel with no
 * overlays, dead space, or sticky pinning artifacts.
 */
export function StackedSection({ children, id, transparent = false, isLast = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const shouldSimplify = useShouldSimplifyMotion();
  const isInView = useInView(ref, { once: true, margin: "-8% 0px" });

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
      className={`relative min-h-screen ${bgClass}`}
      initial={{ opacity: 0, scale: 0.96, y: 40 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
