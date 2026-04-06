"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Background orbs that drift slowly toward the cursor,
 * each with different spring configs for a layered parallax feel.
 */
export function HeroAnimation() {
  const springA = { stiffness: 18, damping: 14 };
  const springB = { stiffness: 10, damping: 12 };
  const springC = { stiffness: 7, damping: 10 };
  const springD = { stiffness: 5, damping: 8 };

  const xA = useSpring(useMotionValue(0), springA);
  const yA = useSpring(useMotionValue(0), springA);
  const xB = useSpring(useMotionValue(0), springB);
  const yB = useSpring(useMotionValue(0), springB);
  const xC = useSpring(useMotionValue(0), springC);
  const yC = useSpring(useMotionValue(0), springC);
  const xD = useSpring(useMotionValue(0), springD);
  const yD = useSpring(useMotionValue(0), springD);

  const xARef = useRef(xA);
  const yARef = useRef(yA);
  const xBRef = useRef(xB);
  const yBRef = useRef(yB);
  const xCRef = useRef(xC);
  const yCRef = useRef(yC);
  const xDRef = useRef(xD);
  const yDRef = useRef(yD);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -60..60 px offset range
      const nx = (e.clientX / window.innerWidth - 0.5) * 120;
      const ny = (e.clientY / window.innerHeight - 0.5) * 80;
      xARef.current.set(nx * 0.8);
      yARef.current.set(ny * 0.8);
      xBRef.current.set(nx * -0.5);
      yBRef.current.set(ny * -0.5);
      xCRef.current.set(nx * 0.6);
      yCRef.current.set(ny * 0.6);
      xDRef.current.set(nx * -0.4);
      yDRef.current.set(ny * -0.4);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top-right — vibrant indigo */}
      <motion.div
        style={{ x: xA, y: yA }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 right-[5%] h-[28rem] w-[28rem] rounded-full bg-[#5450f5]/22 blur-[110px]"
      />
      {/* Left-center — warm amber */}
      <motion.div
        style={{ x: xB, y: yB }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.28, 0.48, 0.28] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute left-[3%] top-[30%] h-[26rem] w-[26rem] rounded-full bg-[#ffcc44]/40 blur-[120px]"
      />
      {/* Bottom-center — soft violet */}
      <motion.div
        style={{ x: xC, y: yC }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.40, 0.22] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[4%] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#a89dff]/40 blur-[130px]"
      />
      {/* Top-left — cyan tint */}
      <motion.div
        style={{ x: xD, y: yD }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.30, 0.18] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -top-10 left-[10%] h-[20rem] w-[20rem] rounded-full bg-[#60a5fa]/22 blur-[100px]"
      />
    </div>
  );
}
