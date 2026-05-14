"use client";

import { useEffect, useState } from "react";

export function HeroBoot() {
  const [phase, setPhase] = useState<"armed" | "sweeping" | "done">("armed");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot init on mount
      setPhase("done");
      return;
    }
    // Skip the boot if the user already scrolled (e.g. landed via deep link).
    if (window.scrollY > 40) {
      setPhase("done");
      return;
    }
    document.documentElement.dataset.boot = "1";
    const t1 = window.setTimeout(() => setPhase("sweeping"), 30);
    const t2 = window.setTimeout(() => {
      setPhase("done");
      delete document.documentElement.dataset.boot;
    }, 1600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      delete document.documentElement.dataset.boot;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`hero-boot hero-boot--${phase}`}
      aria-hidden="true"
    >
      <div className="hero-boot__scanline" />
      <div className="hero-boot__vignette" />
    </div>
  );
}
