"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen intro wipe. Two panels (top + bottom) slide apart
 * revealing the site on first load. Only runs once per session.
 */
export function PageIntro() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Only show on first visit per session
    let needsIntro = false;
    if (typeof sessionStorage !== "undefined") {
      if (!sessionStorage.getItem("intro-shown")) {
        needsIntro = true;
        sessionStorage.setItem("intro-shown", "1");
      }
    }
    if (needsIntro) {
      setTimeout(() => setVisible(true), 0);
    }
  }, []);

  if (!visible || done) return null;

  return (
    <AnimatePresence onExitComplete={() => setDone(true)}>
      {visible && (
        <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden">
          {/* Name text that shows briefly before panels open */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, times: [0, 0.2, 0.65, 1], ease: "easeInOut" }}
          >
            <p className="font-mono text-[clamp(1rem,3vw,1.5rem)] tracking-[0.5em] text-white/90 uppercase select-none">
              Nikhil Sai Nethi
            </p>
          </motion.div>

          {/* Top panel */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-[#040c1c]"
            initial={{ y: "0%" }}
            animate={{ y: "-100%" }}
            transition={{ duration: 0.9, delay: 1.6, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setVisible(false)}
          />

          {/* Bottom panel */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[#040c1c]"
            initial={{ y: "0%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 0.9, delay: 1.6, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Thin accent line that appears between panels as they split */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-accent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, times: [0, 0.3, 0.7, 1], delay: 1.4, ease: "easeInOut" }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
