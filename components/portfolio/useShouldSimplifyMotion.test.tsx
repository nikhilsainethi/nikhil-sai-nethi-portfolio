import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useShouldSimplifyMotion } from "./useShouldSimplifyMotion";

type MatchMediaConfig = {
  maxWidthMobile?: boolean;
  coarsePointer?: boolean;
};

function installMatchMedia({
  maxWidthMobile = false,
  coarsePointer = false,
}: MatchMediaConfig = {}) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        (query === "(max-width: 767px)" && maxWidthMobile) ||
        (query === "(pointer: coarse)" && coarsePointer),
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

describe("useShouldSimplifyMotion", () => {
  beforeEach(() => {
    installMatchMedia();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays off for desktop-like environments", () => {
    const { result } = renderHook(() => useShouldSimplifyMotion());

    expect(result.current).toBe(false);
  });

  it("turns on for narrow mobile screens", () => {
    installMatchMedia({ maxWidthMobile: true });

    const { result } = renderHook(() => useShouldSimplifyMotion());

    expect(result.current).toBe(true);
  });

  it("turns on for coarse pointer devices", () => {
    installMatchMedia({ coarsePointer: true });

    const { result } = renderHook(() => useShouldSimplifyMotion());

    expect(result.current).toBe(true);
  });
});
