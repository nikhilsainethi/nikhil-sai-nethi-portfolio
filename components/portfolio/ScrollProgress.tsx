"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const distance = doc.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? (window.scrollY / distance) * 100 : 0;
      bar.style.width = `${progress}%`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed left-0 top-0 h-[2px] pointer-events-none"
      style={{
        zIndex: 1000,
        width: 0,
        background: "linear-gradient(90deg, var(--cyan), var(--amber))",
        boxShadow: "0 0 8px var(--cyan)",
        transition: "width 100ms linear",
      }}
    />
  );
}
