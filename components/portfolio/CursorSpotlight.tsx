"use client";

import { useEffect, useRef } from "react";

export function CursorSpotlight() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      el.style.setProperty("--mouse-x", `${e.clientX}px`);
      el.style.setProperty("--mouse-y", `${e.clientY}px`);
      el.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed inset-0 z-20 hidden opacity-0 transition-opacity duration-300 lg:block"
      style={{
        background:
          "radial-gradient(650px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(84,80,245,0.08), transparent 50%)",
      }}
    />
  );
}
