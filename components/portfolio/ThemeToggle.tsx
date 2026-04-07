"use client";

import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";
import {
  applyThemeMode,
  defaultThemeMode,
  getNextThemeMode,
  resolveThemeMode,
  type ThemeMode,
  themeStorageKey,
} from "@/lib/theme";

const floatingTogglePosition = {
  bottom: "max(1rem, env(safe-area-inset-bottom))",
  left: "max(1rem, env(safe-area-inset-left))",
} as const;

function getInitialThemeMode(): ThemeMode {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return defaultThemeMode;
  }

  return resolveThemeMode({
    rootValue: document.documentElement.dataset.theme,
    storedValue: window.localStorage.getItem(themeStorageKey),
  });
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    applyThemeMode({
      root: document.documentElement,
      storage: window.localStorage,
      theme,
    });
  }, [theme]);

  const nextTheme = getNextThemeMode(theme);
  const buttonLabel = `Switch to ${nextTheme} mode`;

  return (
    <button
      aria-label={buttonLabel}
      aria-pressed={theme === "dark"}
      className="theme-toggle fixed z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      data-theme={theme}
      onClick={() => setTheme((currentTheme) => getNextThemeMode(currentTheme))}
      suppressHydrationWarning
      style={floatingTogglePosition}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle__glow" />
      <span aria-hidden="true" className="theme-toggle__core">
        <FaSun className="theme-toggle__icon theme-toggle__icon--sun" size={16} />
        <FaMoon className="theme-toggle__icon theme-toggle__icon--moon" size={15} />
      </span>
      <span className="sr-only">{buttonLabel}</span>
    </button>
  );
}
