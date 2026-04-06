"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type CharRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Wait for this many ms before starting (for sequencing after page intro) */
  introDelay?: number;
};

/**
 * Character-level clip-mask reveal.
 * Each char slides up from behind a clip-path bottom mask with spring physics.
 * Far more expressive than word-level stagger.
 */
export function CharReveal({
  text,
  className,
  delay = 0,
  stagger = 0.035,
  introDelay = 0,
}: CharRevealProps) {
  const reduceMotion = useReducedMotion();
  const shouldSimplify = useShouldSimplifyMotion();

  if (reduceMotion || shouldSimplify) {
    return <span className={className}>{text}</span>;
  }

  const chars = text.split("");

  return (
    <span className={`inline ${className ?? ""}`} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ verticalAlign: "bottom" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0, rotateZ: char === " " ? 0 : 3 }}
            animate={{ y: "0%", opacity: 1, rotateZ: 0 }}
            transition={{
              duration: 0.65,
              delay: introDelay + delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
