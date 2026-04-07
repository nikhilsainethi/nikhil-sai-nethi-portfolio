"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

/**
 * Advanced Awwwards-style Parallax Hero Animation.
 * Deep mouse interaction, huge blur orbs that react intensely to cursor,
 * and background text that scrolls with scroll velocity/parallax.
 */
export function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  const springConfig = { stiffness: 40, damping: 20, mass: 1 };
  const mouseX = useSpring(useMotionValue(0), springConfig);
  const mouseY = useSpring(useMotionValue(0), springConfig);

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, 400]);
  const yParallaxFast = useTransform(scrollY, [0, 1000], [0, 800]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 100;
      const y = (e.clientY / innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 overflow-hidden bg-[#040c1c]">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />

      {/* Massive glowing orbs driven by mouse parallax */}
      <motion.div
        style={{ x: useTransform(mouseX, x => x * -2), y: useTransform(mouseY, y => y * -2) }}
        className="absolute -top-32 -left-32 h-[40vw] w-[40vw] rounded-full bg-gradient-to-br from-[#5450f5]/30 to-transparent blur-[120px]"
      />
      <motion.div
        style={{ x: useTransform(mouseX, x => x * 1.5), y: useTransform(mouseY, y => y * 1.5) }}
        className="absolute top-1/2 -right-32 h-[35vw] w-[35vw] -translate-y-1/2 rounded-full bg-gradient-to-bl from-[#ff5e62]/20 to-transparent blur-[140px]"
      />
      <motion.div
        style={{ x: useTransform(mouseX, x => x * 0.8), y: useTransform(mouseY, y => y * 0.8) }}
        className="absolute -bottom-32 left-1/3 h-[45vw] w-[45vw] rounded-full bg-gradient-to-tr from-[#3b82f6]/20 to-transparent blur-[150px]"
      />

      {/* Background Typography Parallax */}
      <motion.div
        style={{ y: yParallaxFast, x: useTransform(mouseX, x => x * 0.5) }}
        className="absolute top-1/4 left-0 right-0 flex justify-center pointer-events-none opacity-[0.03]"
      >
        <span className="text-[18vw] font-black leading-none whitespace-nowrap tracking-tighter text-white">ENGINEER</span>
      </motion.div>
      <motion.div
        style={{ y: yParallax, x: useTransform(mouseX, x => x * -0.5) }}
        className="absolute top-2/3 left-0 right-0 flex justify-center pointer-events-none opacity-[0.03]"
      >
        <span className="text-[18vw] font-black leading-none whitespace-nowrap tracking-tighter text-white">OBSERVABILITY</span>
      </motion.div>
    </div>
  );
}
