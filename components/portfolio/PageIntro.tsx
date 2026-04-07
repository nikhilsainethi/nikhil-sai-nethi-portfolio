"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageIntro() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Only set window dimensions after initial render
    const updateDims = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDims();

    let needsIntro = false;
    if (typeof sessionStorage !== "undefined") {
      if (!sessionStorage.getItem("intro-shown-awwwards")) {
        needsIntro = true;
        sessionStorage.setItem("intro-shown-awwwards", "1");
      }
    }

    if (needsIntro) {
      const showTimer = setTimeout(() => setVisible(true), 0);
      // Auto-hide the intro after a delay
      const hideTimer = setTimeout(() => setVisible(false), 2500);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setTimeout(() => setDone(true), 0);
    }
  }, []);

  if (!visible && done) return null;

  const text = "NIKHIL SAI NETHI";

  // SVG Path animation for the fluid black blob
  const initialPath = `M0 0 L${windowDimensions.width} 0 L${windowDimensions.width} ${windowDimensions.height} Q${windowDimensions.width/2} ${windowDimensions.height} 0 ${windowDimensions.height}  L0 0`;
  const targetPath = `M0 0 L${windowDimensions.width} 0 L${windowDimensions.width} ${windowDimensions.height} Q${windowDimensions.width/2} ${windowDimensions.height + 300} 0 ${windowDimensions.height}  L0 0`;
  const exitPath = `M0 0 L${windowDimensions.width} 0 L${windowDimensions.width} 0 Q${windowDimensions.width/2} 0 0 0  L0 0`;

  return (
    <AnimatePresence onExitComplete={() => setDone(true)}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {/* Black Blob SVG Background */}
          {windowDimensions.width > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox={`0 0 ${windowDimensions.width} ${windowDimensions.height}`}>
              <motion.path
                fill="#0a0a0a"
                initial={{ d: initialPath }}
                animate={{ d: targetPath }}
                exit={{ d: exitPath }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
              />
            </svg>
          )}

          {/* 3D Cylindrical Text Container */}
          <div className="relative z-10 flex overflow-hidden py-10" style={{ perspective: "1000px" }}>
            {text.split("").map((char, i) => (
              <motion.span
                key={i}
                className="text-white font-mono text-[6vw] md:text-[4vw] font-bold tracking-widest inline-block whitespace-pre"
                initial={{ rotateX: 90, y: 100, opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                exit={{ rotateX: -90, y: -100, opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + (i * 0.04),
                  ease: [0.33, 1, 0.68, 1]
                }}
                style={{ transformOrigin: "50% 50% -80px" }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
