"use client";

import { motion, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export type TimelineRole = {
  mark: string;
  label: string;
  startYear: number; // fractional year, e.g. 2024.58 for Aug 2024
  endYear: number | null; // null = current, locks to today
  current?: boolean;
};

export type ExperienceTimelineProps = {
  scrollYProgress: MotionValue<number>;
  roles: TimelineRole[];
  startYear: number;
  endYear: number;
};

function todayFractional() {
  const d = new Date();
  return d.getFullYear() + (d.getMonth() + d.getDate() / 31) / 12;
}

export function ExperienceTimeline({
  scrollYProgress,
  roles,
  startYear,
  endYear,
}: ExperienceTimelineProps) {
  const [today, setToday] = useState(() => todayFractional());

  useEffect(() => {
    const id = window.setInterval(() => setToday(todayFractional()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const range = endYear - startYear;
  const yearTicks: number[] = [];
  for (let y = Math.ceil(startYear); y <= Math.floor(endYear); y++) {
    yearTicks.push(y);
  }

  const toPct = (year: number) => ((year - startYear) / range) * 100;

  // Each role's center on the ruler (used by the playhead and DOCKED chip).
  const centersPct = roles.map((r) => {
    const end = r.endYear ?? today;
    const center = (r.startYear + end) / 2;
    return toPct(center);
  });

  // Newest role (Moody's) is index 0 → playhead starts on the right.
  // Scroll progress moves us back in time toward older roles.
  const playheadPct = useTransform(scrollYProgress, (p) => {
    const scaled = Math.min(centersPct.length - 1, p * (centersPct.length - 1));
    const i = Math.floor(scaled);
    const t = scaled - i;
    const a = centersPct[i];
    const b = centersPct[Math.min(i + 1, centersPct.length - 1)];
    return a + (b - a) * t;
  });

  const playheadLeft = useTransform(playheadPct, (v) => `${v}%`);

  // Which role is currently docked under the playhead.
  const dockedIndex = useTransform(scrollYProgress, (p) => {
    const i = Math.min(roles.length - 1, Math.floor(p * roles.length));
    return i;
  });

  return (
    <div className="exp-timeline" aria-hidden="true">
      <div className="exp-timeline__head">
        <span className="exp-timeline__label">TIMELINE</span>
        <span className="exp-timeline__divider" />
        <span className="exp-timeline__range">
          {Math.floor(startYear)} → {Math.floor(today)}
        </span>
        <span className="exp-timeline__spacer" />
        {roles.map((r, i) => (
          <DockedChip
            key={r.mark}
            index={i}
            dockedIndex={dockedIndex}
            mark={r.mark}
            label={r.label}
          />
        ))}
      </div>

      <div className="exp-timeline__ruler">
        {/* baseline */}
        <div className="exp-timeline__baseline" />

        {/* year ticks */}
        {yearTicks.map((y) => (
          <div
            key={y}
            className="exp-timeline__year"
            style={{ left: `${toPct(y)}%` }}
          >
            <span className="exp-timeline__year-tick" />
            <span className="exp-timeline__year-label">{y}</span>
          </div>
        ))}

        {/* role bars */}
        {roles.map((r) => {
          const end = r.endYear ?? today;
          const left = toPct(r.startYear);
          const width = toPct(end) - left;
          return (
            <div
              key={r.mark}
              className={`exp-timeline__role${r.current ? " is-current" : ""}`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
            >
              <span className="exp-timeline__role-mark">{r.mark}</span>
              {r.current && <span className="exp-timeline__role-edge" />}
            </div>
          );
        })}

        {/* playhead */}
        <motion.div
          className="exp-timeline__playhead"
          style={{ left: playheadLeft }}
        >
          <span className="exp-timeline__playhead-cap" />
          <span className="exp-timeline__playhead-line" />
          <span className="exp-timeline__playhead-foot" />
        </motion.div>
      </div>
    </div>
  );
}

function DockedChip({
  index,
  dockedIndex,
  mark,
  label,
}: {
  index: number;
  dockedIndex: MotionValue<number>;
  mark: string;
  label: string;
}) {
  const opacity = useTransform(dockedIndex, (d) => (d === index ? 1 : 0));
  const x = useTransform(dockedIndex, (d) => (d === index ? 0 : -4));
  return (
    <motion.span
      className="exp-timeline__docked"
      style={{ opacity, x }}
    >
      <span className="exp-timeline__docked-arrow">▸</span>
      <span className="exp-timeline__docked-status">DOCKED</span>
      <span className="exp-timeline__docked-mark">{mark}</span>
      <span className="exp-timeline__docked-label">{label}</span>
    </motion.span>
  );
}
