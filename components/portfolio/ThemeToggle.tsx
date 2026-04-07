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
      className="theme-toggle fixed right-4 top-[4.75rem] z-[70] inline-flex h-[3.75rem] w-[5.75rem] items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:right-5 sm:top-5 lg:right-6 lg:top-6"
      data-corner="top-right"
      data-theme={theme}
      onClick={() => setTheme((currentTheme) => getNextThemeMode(currentTheme))}
      suppressHydrationWarning
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle__glow" />
      <span aria-hidden="true" className="theme-toggle__track">
        <FaSun className="theme-toggle__icon theme-toggle__icon--sun" size={18} />
        <FaMoon className="theme-toggle__icon theme-toggle__icon--moon" size={18} />
        <span className="theme-toggle__thumb" />
      </span>
      <span className="sr-only">{buttonLabel}</span>
    </button>
  );
}
