"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type MagneticButtonProps = {
  children: ReactNode;
};

export function MagneticButton({ children }: MagneticButtonProps) {
  const shouldSimplifyMotion = useShouldSimplifyMotion();

  if (shouldSimplifyMotion) {
    return <div className="inline-flex">{children}</div>;
  }

  return <AnimatedMagneticButton>{children}</AnimatedMagneticButton>;
}

function AnimatedMagneticButton({ children }: MagneticButtonProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 18 });
  const y = useSpring(rawY, { stiffness: 280, damping: 18 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left - rect.width / 2) * 0.38);
    rawY.set((e.clientY - rect.top - rect.height / 2) * 0.38);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      style={{ x, y, display: "inline-flex" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}
