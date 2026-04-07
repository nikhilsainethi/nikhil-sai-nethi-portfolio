import {
  applyThemeMode,
  defaultThemeMode,
  getNextThemeMode,
  getThemeInitializationScript,
  parseThemeMode,
  resolveThemeMode,
  themeStorageKey,
} from "./theme";

describe("theme helpers", () => {
  it("defaults to light mode", () => {
    expect(defaultThemeMode).toBe("light");
  });

  it("parses supported theme values", () => {
    expect(parseThemeMode("light")).toBe("light");
    expect(parseThemeMode("dark")).toBe("dark");
  });

  it("normalizes invalid theme values back to light", () => {
    expect(parseThemeMode("sepia")).toBe("light");
    expect(parseThemeMode(null)).toBe("light");
    expect(parseThemeMode(undefined)).toBe("light");
  });

  it("prefers a stored manual theme over the current root attribute", () => {
    expect(resolveThemeMode({ rootValue: "light", storedValue: "dark" })).toBe("dark");
  });

  it("falls back to the current root attribute when storage is empty", () => {
    expect(resolveThemeMode({ rootValue: "dark", storedValue: null })).toBe("dark");
  });

  it("cycles manually between light and dark", () => {
    expect(getNextThemeMode("light")).toBe("dark");
    expect(getNextThemeMode("dark")).toBe("light");
  });

  it("applies the selected mode to the root and storage", () => {
    const storage = {
      setItem: vi.fn(),
    };
    const root = {
      dataset: {},
    } as unknown as HTMLElement;

    applyThemeMode({ root, storage, theme: "dark" });

    expect(root.dataset.theme).toBe("dark");
    expect(storage.setItem).toHaveBeenCalledWith(themeStorageKey, "dark");
  });

  it("publishes an initialization script that restores the stored theme", () => {
    const script = getThemeInitializationScript();

    expect(script).toContain(themeStorageKey);
    expect(script).toContain("document.documentElement.dataset.theme");
    expect(script).toContain(defaultThemeMode);
  });
});
