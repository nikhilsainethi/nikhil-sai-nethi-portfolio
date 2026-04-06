"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type Props = {
  children: ReactNode;
  id?: string;
  /** Last section — no scale-out, no sticky height constraint */
  isLast?: boolean;
  /** Keep section background transparent (e.g. hero — lets blobs show through) */
  transparent?: boolean;
};

/**
 * Sticky stacked-card scroll effect.
 *
 * Each section pins to the top of the viewport while the user scrolls through
 * the outer scroll zone (h-[160vh]). As they scroll, the card scales down
 * (1 → 0.88), gains rounded corners (0 → 20px), and dims (overlay 0 → 0.5).
 * The next section then slides up over it.
 *
 * On mobile / coarse-pointer devices the effect is disabled and sections render
 * as normal document-flow blocks.
 */
export function StackedSection({ children, id, isLast = false, transparent = false }: Props) {
  const shouldSimplify = useShouldSimplifyMotion();
  const outerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end start"],
  });

  const rawScale = useTransform(
    scrollYProgress,
    [0, 1],
    isLast || shouldSimplify ? [1, 1] : [1, 0.88]
  );
  const scale = useSpring(rawScale, { stiffness: 150, damping: 35 });

  const borderRadius = useTransform(
    scrollYProgress,
    [0, 1],
    isLast || shouldSimplify ? ["0px", "0px"] : ["0px", "20px"]
  );

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 1],
    isLast || shouldSimplify ? [0, 0] : [0, 0.5]
  );

  const bgClass = transparent ? "" : "bg-background";

  if (shouldSimplify) {
    return (
      <section id={id} className={bgClass}>
        {children}
      </section>
    );
  }

  return (
    <div ref={outerRef} className={isLast ? undefined : "h-[160vh]"}>
      <motion.section
        id={id}
        style={{ scale, borderRadius }}
        className={`relative origin-top overflow-hidden ${bgClass} ${
          isLast ? "min-h-screen" : "sticky top-24 h-[calc(100vh-6rem)]"
        }`}
      >
        {children}

        {/* Dimming overlay that fades in as card recedes */}
        {!isLast && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-foreground"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </motion.section>
    </div>
  );
}
