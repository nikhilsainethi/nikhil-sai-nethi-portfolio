"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

const SAMPLES = 96;

function generateWave(seed: number): number[] {
  // Produce a noisy but bounded waveform suggesting steady-state uptime with
  // small dips — the operator's eye should read "near-100%, occasional micro-dip."
  const out: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLES;
    const slow = Math.sin(t * Math.PI * 1.4 + seed) * 0.08;
    const fast = Math.sin(t * Math.PI * 14 + seed * 2.3) * 0.03;
    const noise = (Math.sin(seed * 7.3 + i * 1.91) * 43758.5453) % 1;
    const dip = i === Math.floor(SAMPLES * 0.62) ? -0.22 : 0;
    out.push(0.5 + slow + fast + noise * 0.015 + dip);
  }
  return out;
}

export type UptimeSparklineProps = {
  /** Draws progress 0–1. Used by parent to drive trace reveal in sync with counter. */
  progress: number;
  /** Whether the trace should be live-pulsing after reveal. */
  active: boolean;
};

export function UptimeSparkline({ progress, active }: UptimeSparklineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [wave] = useState(() => generateWave(7));

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const points: Point[] = wave.map((y, i) => ({
    x: (i / (SAMPLES - 1)) * w,
    y: h - 6 - y * (h - 18),
  }));

  const traceCount = Math.max(1, Math.floor(SAMPLES * progress));
  const visible = points.slice(0, traceCount);
  const d = visible
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const head = visible[visible.length - 1];

  return (
    <div ref={wrapperRef} className="uptime-spark" aria-hidden="true">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="uptime-spark__svg"
      >
        {/* baseline */}
        <line
          x1={0}
          x2={w}
          y1={h - 6}
          y2={h - 6}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1}
        />
        {/* fill under trace */}
        {visible.length > 1 && (
          <path
            d={`${d} L${head.x.toFixed(2)},${h - 6} L0,${h - 6} Z`}
            fill="url(#spark-fill)"
            opacity={0.45}
          />
        )}
        {/* trace */}
        {visible.length > 1 && (
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* moving head */}
        {head && (
          <g>
            <circle
              cx={head.x}
              cy={head.y}
              r={3.5}
              fill="currentColor"
              className={active ? "uptime-spark__head" : undefined}
            />
            {active && (
              <circle
                cx={head.x}
                cy={head.y}
                r={3.5}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                className="uptime-spark__halo"
              />
            )}
          </g>
        )}
        <defs>
          <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
