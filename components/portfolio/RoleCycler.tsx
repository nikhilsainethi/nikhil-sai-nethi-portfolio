"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

const roles = [
  "Software Engineer",
  "Cloud Architect",
  "AI/LLM Builder",
  "Platform Engineer",
  "DevOps Practitioner",
];

export function RoleCycler() {
  const shouldSimplifyMotion = useShouldSimplifyMotion();

  if (shouldSimplifyMotion) {
    return <span className="accent-gradient">{roles[0]}</span>;
  }

  return <AnimatedRoleCycler />;
}

function AnimatedRoleCycler() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % roles.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="relative inline-flex overflow-hidden"
      style={{ minWidth: "19ch", height: "1.35em", verticalAlign: "bottom" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[idx]}
          className="accent-gradient absolute inset-0 flex items-center"
          initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -22, filter: "blur(6px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {roles[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
