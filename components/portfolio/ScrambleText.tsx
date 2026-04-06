"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** Number of scramble frames before each character resolves */
  frames?: number;
};

/**
 * On hover, letters scramble randomly then resolve back to the original text.
 */
export function ScrambleText({ text, className, frames = 8 }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);
  const iterRef = useRef(0);

  function scramble() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    iterRef.current = 0;

    function tick() {
      iterRef.current += 0.5;
      const resolved = Math.floor(iterRef.current);

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < resolved) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (resolved < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <span
      className={`cursor-default select-none ${className ?? ""}`}
      onMouseEnter={scramble}
      aria-label={text}
    >
      {display}
    </span>
  );
}
