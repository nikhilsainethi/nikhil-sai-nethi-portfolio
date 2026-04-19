"use client";

import { useEffect, useRef } from "react";

type Orb = {
  bx: number;
  by: number;
  r: number;
  rgb: string;
  a: number;
  sp: number;
  ph: number;
  py: number;
};

const ORBS: Orb[] = [
  { bx: 0.1, by: 0.1, r: 540, rgb: "0,229,199", a: 0.07, sp: 0.00016, ph: 0, py: -0.18 },
  { bx: 0.88, by: 0.18, r: 460, rgb: "248,124,46", a: 0.055, sp: 0.00021, ph: 2.0, py: 0.14 },
  { bx: 0.5, by: 0.52, r: 520, rgb: "90,70,255", a: 0.04, sp: 0.00013, ph: 4.1, py: -0.07 },
  { bx: 0.15, by: 0.83, r: 420, rgb: "0,229,199", a: 0.055, sp: 0.00019, ph: 1.2, py: 0.22 },
  { bx: 0.82, by: 0.76, r: 400, rgb: "248,124,46", a: 0.045, sp: 0.00024, ph: 3.2, py: -0.13 },
  { bx: 0.55, by: 0.9, r: 350, rgb: "100,0,255", a: 0.03, sp: 0.00017, ph: 5.5, py: 0.08 },
];

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cw = 0;
    let ch = 0;

    const resize = () => {
      cw = canvas.width = window.innerWidth;
      ch = canvas.height = window.innerHeight;
    };
    resize();

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = (t: number) => {
      ctx.clearRect(0, 0, cw, ch);
      const scroll = scrollRef.current;
      const isLight = document.documentElement.dataset.mode === "light";
      const alphaScale = isLight ? 0.15 : 1;

      for (const orb of ORBS) {
        const dx = Math.sin(t * orb.sp + orb.ph) * 0.1 * cw;
        const dy = Math.cos(t * orb.sp * 0.72 + orb.ph) * 0.08 * ch;
        const x = orb.bx * cw + dx;
        const y = orb.by * ch + dy + scroll * orb.py;
        const g = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        const a = orb.a * alphaScale;
        g.addColorStop(0, `rgba(${orb.rgb},${a})`);
        g.addColorStop(0.45, `rgba(${orb.rgb},${+(a * 0.35).toFixed(4)})`);
        g.addColorStop(1, `rgba(${orb.rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cw, ch);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 1 }}
    />
  );
}
