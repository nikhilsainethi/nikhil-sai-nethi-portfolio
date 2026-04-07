import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { themeStorageKey } from "@/lib/theme";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    const storageState = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => storageState.clear(),
        getItem: (key: string) => storageState.get(key) ?? null,
        removeItem: (key: string) => storageState.delete(key),
        setItem: (key: string, value: string) => storageState.set(key, value),
      },
    });

    window.localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  it("renders as a fixed floating control in the top-right corner", () => {
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", { name: /switch to dark mode/i });

    expect(toggle).toHaveClass("fixed");
    expect(toggle).toHaveClass("h-14");
    expect(toggle).toHaveClass("w-20");
    expect(toggle).toHaveAttribute("data-theme", "light");
    expect(toggle).toHaveAttribute("data-corner", "top-right");
  });

  it("reads the stored theme on mount and syncs the root attribute", async () => {
    window.localStorage.setItem(themeStorageKey, "dark");

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(screen.getByRole("button", { name: /switch to light mode/i })).toHaveAttribute(
        "data-theme",
        "dark",
      );
    });
  });

  it("keeps a pre-applied root theme when storage is empty", async () => {
    document.documentElement.dataset.theme = "dark";

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /switch to light mode/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });

  it("toggles between light and dark while updating storage and the root attribute", async () => {
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", { name: /switch to dark mode/i });

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(window.localStorage.getItem(themeStorageKey)).toBe("dark");
      expect(screen.getByRole("button", { name: /switch to light mode/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /switch to light mode/i }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("light");
      expect(window.localStorage.getItem(themeStorageKey)).toBe("light");
      expect(screen.getByRole("button", { name: /switch to dark mode/i })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });
});
