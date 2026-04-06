"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const TRAIL_LENGTH = 8;

type TrailDot = { x: number; y: number; id: number };

/**
 * Premium cursor: dot + spring-lag ring + fading trail dots.
 * Ring morphs on hover over interactive elements.
 * Only on pointer:fine (desktop) devices.
 */
export function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const counterRef = useRef(0);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const ringX = useSpring(mouseX, { stiffness: 180, damping: 20 });
  const ringY = useSpring(mouseY, { stiffness: 180, damping: 20 });

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

      // Add trail dot
      counterRef.current += 1;
      const id = counterRef.current;
      setTrail((prev) => {
        const next = [{ x: e.clientX, y: e.clientY, id }, ...prev];
        return next.slice(0, TRAIL_LENGTH);
      });
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      setHovering(!!t.closest("a, button, [role='button'], input, textarea, select, label, [data-hover]"));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onOver, { passive: true });

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
      {/* Trail dots */}
      {trail.map((dot, i) => (
        <motion.div
          key={dot.id}
          className="pointer-events-none fixed z-[9997] rounded-full bg-accent hidden lg:block"
          style={{
            left: dot.x,
            top: dot.y,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, delay: i * 0.015, ease: "easeOut" }}
          // Size decreases with index
        >
          <div
            style={{
              width: Math.max(2, 6 - i * 0.5),
              height: Math.max(2, 6 - i * 0.5),
              borderRadius: "50%",
            }}
          />
        </motion.div>
      ))}

      {/* Ring — spring lag */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full border hidden lg:block"
        style={{ left: ringX, top: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 56 : 38,
          height: hovering ? 56 : 38,
          backgroundColor: hovering ? "rgba(84,80,245,0.12)" : "transparent",
          borderColor: hovering ? "rgba(84,80,245,0.7)" : "rgba(84,80,245,0.45)",
          borderWidth: hovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />

      {/* Dot — instant */}
      <motion.div
        className="pointer-events-none fixed z-[9999] h-[7px] w-[7px] rounded-full bg-accent hidden lg:block"
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
