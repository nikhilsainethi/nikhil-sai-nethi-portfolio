"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useReveal } from "./useReveal";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type ScrambleHeadingProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

export function ScrambleHeading({ text, className, style }: ScrambleHeadingProps) {
  const [ref, visible] = useReveal<HTMLSpanElement>(0.1);
  const [display, setDisplay] = useState(text);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!visible || reduceMotion) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const id = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " " || char === "." || char === "!") return char;
            if (i < frame / 1.5) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      if (++frame > text.length * 2.5) {
        setDisplay(text);
        clearInterval(id);
      }
    }, 24);

    return () => clearInterval(id);
  }, [visible, text, reduceMotion]);

  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {display}
    </span>
  );
}
