import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarqueeStrip } from "./MarqueeStrip";

function installMatchMedia(matchesMobile: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        (query === "(max-width: 767px)" && matchesMobile) ||
        (query === "(pointer: coarse)" && matchesMobile),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("MarqueeStrip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the looping duplicated markup on desktop", () => {
    installMatchMedia(false);

    render(<MarqueeStrip items={["AWS", "Kubernetes"]} />);

    expect(screen.getByTestId("marquee-strip")).toHaveAttribute("data-motion", "animated");
    expect(screen.getAllByText("AWS")).toHaveLength(2);
  });

  it("switches to a static lightweight strip on mobile", () => {
    installMatchMedia(true);

    render(<MarqueeStrip items={["AWS", "Kubernetes"]} />);

    expect(screen.getByTestId("marquee-strip")).toHaveAttribute("data-motion", "static");
    expect(screen.getAllByText("AWS")).toHaveLength(1);
  });
});
