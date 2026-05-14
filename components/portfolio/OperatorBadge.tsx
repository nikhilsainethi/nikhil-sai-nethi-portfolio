"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { heroPortraitPath } from "@/lib/site";

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "hero", label: "HERO" },
  { id: "about", label: "ABOUT" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "projects", label: "PROJECTS" },
  { id: "skills", label: "CAPABILITIES" },
  { id: "contact", label: "CONTACT" },
];

type Phase = "scanning" | "locked";

export function OperatorBadge() {
  const [section, setSection] = useState<string>("hero");
  const [phase, setPhase] = useState<Phase>("locked");
  const [docked, setDocked] = useState(false);
  const lastSection = useRef<string>("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const update = () => {
      let active = "hero";
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top <= 140) {
          active = sec.id;
        }
      }
      if (active !== section) setSection(active);

      // Dock once the user has scrolled past 70% of the hero pin range.
      // The hero pin is 220vh tall; "docked" engages around 60vh of scroll.
      setDocked(window.scrollY > window.innerHeight * 0.65);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [section]);

  useEffect(() => {
    if (section === lastSection.current) return;
    lastSection.current = section;

    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    // Reactive transition: the effect deliberately exists to fire on each
    // section change. eslint-disable-next-line is the honest answer here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("scanning");
    timers.current.push(
      window.setTimeout(() => setPhase("locked"), 650),
    );
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, [section]);

  const label = SECTIONS.find((s) => s.id === section)?.label ?? section.toUpperCase();

  return (
    <div
      className={`operator-badge operator-badge--${phase}${docked ? " is-docked" : " is-pre-dock"}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="operator-badge__bracket">[</span>

      <span className="operator-badge__avatar" aria-hidden="true">
        <span className="operator-badge__avatar-ring" />
        <Image
          src={heroPortraitPath}
          alt=""
          width={28}
          height={28}
          unoptimized
          className="operator-badge__avatar-img"
        />
      </span>

      <span className="operator-badge__id">NSN</span>

      <span className="operator-badge__separator">▸</span>

      <span className="operator-badge__status">
        {phase === "scanning" ? "SCANNING" : "LOCKED"}
      </span>

      <span className="operator-badge__dot" />

      <span className="operator-badge__section">{label}</span>

      <span className="operator-badge__bracket">]</span>
    </div>
  );
}
