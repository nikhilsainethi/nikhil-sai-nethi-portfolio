"use client";

import { motion } from "framer-motion";

export function HeroAnimation() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.22, 0.34, 0.22],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 right-[6%] h-[26rem] w-[26rem] rounded-full bg-accent/18 blur-[110px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.18, 0.28, 0.18],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute left-[4%] top-[28%] h-[24rem] w-[24rem] rounded-full bg-[#fff1b8]/50 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[6%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#dcd5ff] blur-[130px]"
      />
    </div>
  );
}
