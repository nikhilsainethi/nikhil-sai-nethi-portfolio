"use client";

import { useEffect, useRef } from "react";

type Orb = {
  bx: number;
  by: number;
  r: number;
  rgb: [number, number, number];
  a: number;
  sp: number;
  ph: number;
  py: number;
};

const ORBS: Orb[] = [
  { bx: 0.1, by: 0.1, r: 540, rgb: [0, 229, 199], a: 0.07, sp: 0.00016, ph: 0, py: -0.18 },
  { bx: 0.88, by: 0.18, r: 460, rgb: [248, 124, 46], a: 0.055, sp: 0.00021, ph: 2.0, py: 0.14 },
  { bx: 0.5, by: 0.52, r: 520, rgb: [90, 70, 255], a: 0.04, sp: 0.00013, ph: 4.1, py: -0.07 },
  { bx: 0.15, by: 0.83, r: 420, rgb: [0, 229, 199], a: 0.055, sp: 0.00019, ph: 1.2, py: 0.22 },
  { bx: 0.82, by: 0.76, r: 400, rgb: [248, 124, 46], a: 0.045, sp: 0.00024, ph: 3.2, py: -0.13 },
  { bx: 0.55, by: 0.9, r: 350, rgb: [100, 0, 255], a: 0.03, sp: 0.00017, ph: 5.5, py: 0.08 },
];

const SECTION_TINTS: Array<{ id: string; shift: number; warm: number }> = [
  { id: "hero", shift: 0, warm: 0 },
  { id: "about", shift: 8, warm: 0.05 },
  { id: "experience", shift: -14, warm: -0.08 },
  { id: "projects", shift: 22, warm: 0.18 },
  { id: "skills", shift: -28, warm: 0.04 },
  { id: "contact", shift: 14, warm: 0.22 },
];

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hk = ((((h % 360) + 360) % 360) / 360);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const t2c = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [
    Math.round(t2c(hk + 1 / 3) * 255),
    Math.round(t2c(hk) * 255),
    Math.round(t2c(hk - 1 / 3) * 255),
  ];
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const tintRef = useRef({ shift: 0, warm: 0 });
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

    const computeTint = () => {
      const vh = window.innerHeight;
      const center = window.scrollY + vh / 2;
      let prev = SECTION_TINTS[0];
      let next = SECTION_TINTS[0];
      let t = 0;
      for (let i = 0; i < SECTION_TINTS.length; i++) {
        const el = document.getElementById(SECTION_TINTS[i].id);
        if (!el) continue;
        const top = el.offsetTop;
        if (top <= center) {
          prev = SECTION_TINTS[i];
          const nextEntry = SECTION_TINTS[i + 1];
          if (nextEntry) {
            const nextEl = document.getElementById(nextEntry.id);
            if (nextEl) {
              const span = Math.max(1, nextEl.offsetTop - top);
              t = Math.min(1, Math.max(0, (center - top) / span));
              next = nextEntry;
            } else {
              next = prev;
            }
          } else {
            next = prev;
          }
        }
      }
      const targetShift = prev.shift + (next.shift - prev.shift) * t;
      const targetWarm = prev.warm + (next.warm - prev.warm) * t;
      tintRef.current.shift += (targetShift - tintRef.current.shift) * 0.08;
      tintRef.current.warm += (targetWarm - tintRef.current.warm) * 0.08;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = (t: number) => {
      ctx.clearRect(0, 0, cw, ch);
      const scroll = scrollRef.current;
      const isLight = document.documentElement.dataset.mode === "light";
      const alphaScale = isLight ? 0.55 : 1;
      computeTint();
      const { shift, warm } = tintRef.current;

      for (const orb of ORBS) {
        const dx = Math.sin(t * orb.sp + orb.ph) * 0.1 * cw;
        const dy = Math.cos(t * orb.sp * 0.72 + orb.ph) * 0.08 * ch;
        const x = orb.bx * cw + dx;
        const y = orb.by * ch + dy + scroll * orb.py;

        const [h, s, l] = rgbToHsl(orb.rgb[0], orb.rgb[1], orb.rgb[2]);
        const lAdj = isLight ? Math.min(0.85, l + 0.18) : l;
        const sAdj = Math.min(1, Math.max(0, s + warm * 0.25));
        const [rr, gg, bb] = hslToRgb(h + shift, sAdj, lAdj);

        const g = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        const a = orb.a * alphaScale;
        g.addColorStop(0, `rgba(${rr},${gg},${bb},${a})`);
        g.addColorStop(
          0.45,
          `rgba(${rr},${gg},${bb},${+(a * 0.35).toFixed(4)})`,
        );
        g.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
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
