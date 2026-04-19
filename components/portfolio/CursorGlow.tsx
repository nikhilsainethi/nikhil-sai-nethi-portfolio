"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!window.matchMedia?.("(pointer: fine)").matches) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.opacity = "1";
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed hidden lg:block"
      style={{
        width: 380,
        height: 380,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--cyan) 14%, transparent), transparent 65%)",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
        opacity: 0,
        transition: "left .15s ease-out, top .15s ease-out, opacity 400ms ease",
        left: "-9999px",
        top: "-9999px",
      }}
    />
  );
}
