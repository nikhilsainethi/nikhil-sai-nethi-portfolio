export const themeStorageKey = "nsn-portfolio-theme";

export type ThemeMode = "light" | "dark";

export const defaultThemeMode: ThemeMode = "dark";

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return value === "light" ? "light" : "dark";
}

export function resolveThemeMode({
  rootValue,
  storedValue,
}: {
  rootValue?: string | null;
  storedValue?: string | null;
}): ThemeMode {
  if (storedValue === "light" || storedValue === "dark") {
    return storedValue;
  }

  if (rootValue === "light" || rootValue === "dark") {
    return rootValue;
  }

  return defaultThemeMode;
}

export function getNextThemeMode(currentTheme: ThemeMode): ThemeMode {
  return currentTheme === "dark" ? "light" : "dark";
}

export function applyThemeMode({
  root,
  storage,
  theme,
}: {
  root: Pick<HTMLElement, "dataset">;
  storage?: Pick<Storage, "setItem"> | null;
  theme: ThemeMode;
}) {
  root.dataset.mode = theme;
  storage?.setItem(themeStorageKey, theme);
}

export function getThemeInitializationScript() {
  return `(() => {
  const defaultTheme = "${defaultThemeMode}";
  const storageKey = "${themeStorageKey}";
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    document.documentElement.dataset.mode =
      storedTheme === "dark" || storedTheme === "light" ? storedTheme : defaultTheme;
  } catch (error) {
    document.documentElement.dataset.mode = defaultTheme;
  }
})();`;
}
