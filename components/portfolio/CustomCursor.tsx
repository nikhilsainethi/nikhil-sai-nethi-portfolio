"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom dot + ring cursor.
 * - Dot: 8px, follows instantly
 * - Ring: 36px, follows with spring lag
 * - On hover over interactive elements: ring expands + fills, dot hides
 * - Hidden on touch/mobile (requires pointer: fine)
 */
export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { stiffness: 200, damping: 22, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      setIsTouchDevice(false);
    }
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      setHovering(!!t.closest("a, button, [role='button'], input, textarea, select, label"));
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onOver);
    };
  }, [isTouchDevice, mouseX, mouseY]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Ring — spring lag */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full border hidden lg:block"
        style={{ left: ringX, top: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 52 : 36,
          height: hovering ? 52 : 36,
          backgroundColor: hovering ? "rgba(84,80,245,0.10)" : "transparent",
          borderColor: hovering ? "rgba(84,80,245,0.65)" : "rgba(84,80,245,0.40)",
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />

      {/* Dot — instant */}
      <motion.div
        className="pointer-events-none fixed z-[9999] h-2 w-2 rounded-full bg-accent hidden lg:block"
        style={{ left: mouseX, top: mouseY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          opacity: hovering ? 0 : visible ? 1 : 0,
          scale: hovering ? 0 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
    </>
  );
}
