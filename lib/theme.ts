export const themeStorageKey = "nsn-portfolio-theme";

export type ThemeMode = "light" | "dark";

export const defaultThemeMode: ThemeMode = "light";

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return value === "dark" ? "dark" : defaultThemeMode;
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
  return currentTheme === "light" ? "dark" : "light";
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
  root.dataset.theme = theme;
  storage?.setItem(themeStorageKey, theme);
}

export function getThemeInitializationScript() {
  return `(() => {
  const defaultTheme = "${defaultThemeMode}";
  const storageKey = "${themeStorageKey}";
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    document.documentElement.dataset.theme =
      storedTheme === "dark" || storedTheme === "light" ? storedTheme : defaultTheme;
  } catch (error) {
    document.documentElement.dataset.theme = defaultTheme;
  }
})();`;
}
