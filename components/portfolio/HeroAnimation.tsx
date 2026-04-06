"use client";

import { motion } from "framer-motion";

export function HeroAnimation() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top-right — vibrant indigo */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 right-[5%] h-[28rem] w-[28rem] rounded-full bg-[#5450f5]/22 blur-[110px] "
      />
      {/* Left-center — warm amber */}
      <motion.div
        animate={{ scale: [1, 1.14, 1], opacity: [0.28, 0.45, 0.28] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute left-[3%] top-[30%] h-[26rem] w-[26rem] rounded-full bg-[#ffcc44]/40 blur-[120px]"
      />
      {/* Bottom-center — soft violet */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.38, 0.22] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[4%] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#a89dff]/40 blur-[130px]"
      />
      {/* Extra — top-left cyan tint */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -top-10 left-[10%] h-[20rem] w-[20rem] rounded-full bg-[#60a5fa]/22 blur-[100px]"
      />
    </div>
  );
}
