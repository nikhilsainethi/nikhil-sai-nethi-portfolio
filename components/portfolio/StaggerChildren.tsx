"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type StaggerChildrenProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
};

const containerVariants = (stagger: number, delay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Wrap a list of items — each direct child staggers in when the container
 * scrolls into view.
 */
export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: StaggerChildrenProps) {
  const reduceMotion = useReducedMotion();
  const shouldSimplify = useShouldSimplifyMotion();

  if (reduceMotion || shouldSimplify) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Each direct child of StaggerChildren should be wrapped in this.
 */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
