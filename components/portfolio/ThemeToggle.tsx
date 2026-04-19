"use client";

import { useEffect, useState } from "react";
import {
  applyThemeMode,
  defaultThemeMode,
  getNextThemeMode,
  resolveThemeMode,
  type ThemeMode,
  themeStorageKey,
} from "@/lib/theme";

const STAR_POSITIONS: Array<[number, number, number]> = [
  [5, 4, 1],
  [19, 5, 0.75],
  [4, 19, 0.9],
  [20, 17, 0.65],
  [16, 3, 0.55],
];

const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(defaultThemeMode);
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    queueMicrotask(() => {
      setTheme(
        resolveThemeMode({
          rootValue: document.documentElement.dataset.mode,
          storedValue: window.localStorage.getItem(themeStorageKey),
        }),
      );
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeMode({
      root: document.documentElement,
      storage: window.localStorage,
      theme,
    });
  }, [theme, mounted]);

  const toggle = () => {
    setSpinning(true);
    setTheme((current) => getNextThemeMode(current));
    window.setTimeout(() => setSpinning(false), 600);
  };

  const iconColor = isDark ? "#00e5c7" : "#c4663e";
  const background = isDark ? "rgba(6,8,14,.92)" : "rgba(254,250,245,.96)";
  const glow = isDark
    ? "0 0 24px rgba(0,229,199,.3), 0 4px 20px rgba(0,0,0,.4)"
    : "0 0 24px rgba(196,102,62,.3), 0 4px 16px rgba(0,0,0,.15)";
  const borderColor = isDark ? "rgba(0,229,199,.25)" : "rgba(196,102,62,.3)";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      aria-label={label}
      aria-pressed={isDark}
      onClick={toggle}
      suppressHydrationWarning
      type="button"
      className="group fixed flex items-center justify-center"
      style={{
        top: 20,
        right: 24,
        zIndex: 300,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background,
        border: `1.5px solid ${borderColor}`,
        backdropFilter: "blur(20px)",
        boxShadow: glow,
        cursor: "pointer",
        transition:
          "background 500ms ease, box-shadow 500ms ease, border-color 500ms ease, transform 200ms ease",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        style={{
          transform: spinning
            ? "rotate(360deg)"
            : isDark
              ? "rotate(0deg)"
              : "rotate(90deg)",
          transition: "transform 600ms cubic-bezier(.16,1,.3,1)",
          overflow: "visible",
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="4.8"
          fill={iconColor}
          style={{ transition: "fill 500ms ease" }}
        />
        <circle
          cx="14.6"
          cy="9.4"
          r="4.5"
          fill={isDark ? background : "rgba(0,0,0,0)"}
          style={{ transition: "fill 400ms ease" }}
        />
        {SUN_RAYS.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={12 + Math.cos(rad) * 7.2}
              y1={12 + Math.sin(rad) * 7.2}
              x2={12 + Math.cos(rad) * 10}
              y2={12 + Math.sin(rad) * 10}
              stroke={iconColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{
                opacity: isDark ? 0 : 1,
                transition: `opacity 350ms ${i * 0.03}s ease`,
              }}
            />
          );
        })}
        {STAR_POSITIONS.map(([x, y, o], i) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="0.85"
            fill={iconColor}
            style={{
              opacity: isDark ? o : 0,
              transition: `opacity 400ms ${i * 0.06}s ease`,
            }}
          />
        ))}
      </svg>
    </button>
  );
}
