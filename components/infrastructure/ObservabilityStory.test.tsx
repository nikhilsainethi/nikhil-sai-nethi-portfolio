import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ObservabilityStory from "./ObservabilityStory";

const motionPreference = vi.hoisted(() => ({ enabled: true }));
vi.mock("./DatacentreCanvas", () => ({
  StoryCanvas: () => <canvas aria-hidden="true" />,
}));
vi.mock("./InfrastructureShell", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./InfrastructureShell")>();
  return { ...actual, useInfrastructureMotion: () => motionPreference.enabled };
});

let reducedMotion = true;
let compactViewport = false;
const defaultIntersectionObserver = globalThis.IntersectionObserver;

beforeEach(() => {
  window.history.replaceState({}, "", "/");
  motionPreference.enabled = true;
  reducedMotion = true;
  compactViewport = false;
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : compactViewport,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  globalThis.IntersectionObserver = defaultIntersectionObserver;
  window.history.replaceState({}, "", "/");
  document.documentElement.style.scrollPaddingTop = "";
});

describe("initial fragment navigation", () => {
  function setupFrames() {
    const callbacks = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callbacks.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => { callbacks.delete(id); });
    return async () => {
      await act(async () => {
        const queued = [...callbacks.values()];
        callbacks.clear();
        queued.forEach((callback) => callback(0));
      });
    };
  }

  it("restores an initial below-story fragment once after desktop pinning, respecting scroll padding", async () => {
    reducedMotion = false;
    window.history.replaceState({}, "", "/#work");
    document.documentElement.style.scrollPaddingTop = "108px";
    const flush = setupFrames();
    const originalBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.id !== "work") return originalBounds.call(this);
      return { x: 0, y: 1897, top: 1897, bottom: 2097, left: 0, right: 1200, width: 1200, height: 200, toJSON: () => ({}) };
    });
    const view = <><ObservabilityStory /><section id="work">My work</section></>;
    const { rerender } = render(view);
    await flush();

    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 1789, behavior: "instant" });
    rerender(view);
    window.dispatchEvent(new Event("resize"));
    await flush();
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("waits for compact server markup to hydrate into desktop geometry before restoring the fragment", async () => {
    reducedMotion = false;
    window.history.replaceState({}, "", "/#work");
    document.documentElement.style.scrollPaddingTop = "108px";
    const flush = setupFrames();
    const originalBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.id !== "work") return originalBounds.call(this);
      const top = document.querySelector("#infrastructure-story")?.getAttribute("data-pinned") === "on" ? 1897 : 108;
      return { x: 0, y: top, top, bottom: top + 200, left: 0, right: 1200, width: 1200, height: 200, toJSON: () => ({}) };
    });
    const view = <><ObservabilityStory /><section id="work">My work</section></>;
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = renderToString(view);
    expect(container.querySelector("#infrastructure-story")).toHaveAttribute("data-pinned", "off");
    const recoverableErrors: unknown[] = [];
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, view, { onRecoverableError: (error) => { recoverableErrors.push(error); } });
      });
      await flush();
      expect(recoverableErrors).toEqual([]);
      expect(container.querySelector("#infrastructure-story")).toHaveAttribute("data-pinned", "on");
      expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 1789, behavior: "instant" });
    } finally {
      await act(async () => { root?.unmount(); });
      container.remove();
    }
  });

  it.each(["no hash", "target before story", "user input", "late hash", "late desktop resize"] as const)("does not correct the fragment for %s", async (scenario) => {
    reducedMotion = false;
    compactViewport = scenario === "late desktop resize";
    if (scenario !== "no hash" && scenario !== "late hash") window.history.replaceState({}, "", "/#work");
    const flush = setupFrames();
    const view = (renderCount: number) => <div data-render-count={renderCount}>{scenario === "target before story"
      ? <><section id="work">My work</section><ObservabilityStory /></>
      : <><ObservabilityStory /><section id="work">My work</section></>}</div>;
    const { rerender } = render(view(0));
    if (scenario === "user input") window.dispatchEvent(new Event("wheel"));
    await flush();
    if (scenario === "late hash") window.history.replaceState({}, "", "/#work");
    if (scenario === "late desktop resize") compactViewport = false;
    rerender(view(1));
    await flush();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

describe("observability story access", () => {
  it("lets a keyboard reader select correlation and recovery without scrolling when motion is reduced", async () => {
    const user = userEvent.setup();
    render(<ObservabilityStory />);
    const correlation = screen.getByRole("button", { name: "03 Correlation" });
    correlation.focus();
    await user.keyboard("{Enter}");

    expect(correlation).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Find the slow dependency." })).toBeVisible();
    expect(screen.getByText(/OpenTelemetry/)).toBeVisible();
    expect(document.querySelector("#infrastructure-story")).toHaveAttribute("data-scroll", "off");
    expect(window.scrollTo).not.toHaveBeenCalled();

    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Close the loop." })).toBeVisible();
    expect(screen.getByRole("link", { name: /Explore my observability work/ })).toHaveAttribute("href", "#work");
  });

  it("keeps a narrow viewport compact and directly selectable even when motion is enabled", async () => {
    reducedMotion = false;
    compactViewport = true;
    const user = userEvent.setup();
    render(<ObservabilityStory />);
    await user.click(screen.getByRole("button", { name: "02 Instrumentation" }));

    expect(screen.getByRole("heading", { name: "Make the signals useful." })).toBeVisible();
    expect(document.querySelector("#infrastructure-story")).toHaveAttribute("data-scroll", "off");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("scrubs rack and telemetry layers with native scroll and stops scheduling frames outside the viewport", async () => {
    reducedMotion = false;
    let storyTop = 86;
    const storyHeight = 2320;
    let nextFrame = 0;
    let onIntersection: IntersectionObserverCallback | undefined;
    const frames = new Map<number, FrameRequestCallback>();
    const originalBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.id !== "infrastructure-story") return originalBounds.call(this);
      return { x: 0, y: storyTop, top: storyTop, bottom: storyTop + storyHeight, left: 0, right: 1200, width: 1200, height: storyHeight, toJSON: () => ({}) };
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => { frames.delete(id); });
    globalThis.IntersectionObserver = class implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) { onIntersection = callback; }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
    };
    const flushFrames = async () => {
      await act(async () => {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(0));
      });
    };
    const { container } = render(<ObservabilityStory />);
    await flushFrames();
    expect(container.querySelector("section")).toHaveAttribute("data-scroll", "on");
    const scene = container.querySelector<HTMLDivElement>("[data-stage]")!;
    expect(scene.style.getPropertyValue("--signals")).toBe("0.000");

    storyTop = 86 - 0.64 * (storyHeight - (window.innerHeight - 86));
    window.dispatchEvent(new Event("scroll"));
    await flushFrames();

    expect(screen.getByRole("heading", { name: "Find the slow dependency." })).toBeVisible();
    expect(scene.style.getPropertyValue("--signals")).toBe("1.000");
    expect(scene.style.getPropertyValue("--trace")).toBe("1.000");
    expect(scene.style.getPropertyValue("--rack-scale")).toBe("0.850");
    expect(window.scrollTo).not.toHaveBeenCalled();

    act(() => {
      onIntersection?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    window.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(0);
  });

  it("hydrates the SVG without replacing its server markup when the browser prefers reduced motion", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    container.innerHTML = renderToString(<ObservabilityStory />);
    const serverSvg = container.querySelector("svg");
    const errors: unknown[] = [];
    let root: Root | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <ObservabilityStory />, {
          onRecoverableError: (error) => { errors.push(error); },
        });
      });
      expect(errors).toEqual([]);
      expect(container.querySelector("svg")).toBe(serverSvg);
      expect(container.querySelector("title")).toHaveTextContent("Synthetic infrastructure observability: racks, telemetry, a slow model lookup, and recovery");
      expect(container.querySelector("section")).toHaveAttribute("data-scroll", "off");
    } finally {
      await act(async () => { root?.unmount(); });
      container.remove();
    }
  });

  it.each(["manual", "system"] as const)("preserves the pinned layout and visible correlation stage when %s motion is paused mid-story", async (preference) => {
    reducedMotion = false;
    let storyTop = 86;
    const storyHeight = 2320;
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    const originalBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.id !== "infrastructure-story") return originalBounds.call(this);
      return { x: 0, y: storyTop, top: storyTop, bottom: storyTop + storyHeight, left: 0, right: 1200, width: 1200, height: storyHeight, toJSON: () => ({}) };
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => { frames.delete(id); });
    const flushFrames = async () => {
      await act(async () => {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(0));
      });
    };
    const user = userEvent.setup();
    const { container, rerender } = render(<ObservabilityStory />);
    await flushFrames();
    storyTop = 86 - 0.64 * (storyHeight - (window.innerHeight - 86));
    window.dispatchEvent(new Event("scroll"));
    await flushFrames();
    const scene = container.querySelector<HTMLDivElement>("[data-stage]")!;
    const frozenStyle = scene.getAttribute("style");
    expect(screen.getByRole("heading", { name: "Find the slow dependency." })).toBeVisible();

    if (preference === "manual") motionPreference.enabled = false;
    else reducedMotion = true;
    rerender(<ObservabilityStory />);

    expect(container.querySelector("section")).toHaveAttribute("data-scroll", "off");
    expect(container.querySelector("section")).toHaveAttribute("data-pinned", "on");
    expect(screen.getByRole("heading", { name: "Find the slow dependency." })).toBeVisible();
    expect(scene.getAttribute("style")).toBe(frozenStyle);
    expect(window.scrollTo).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(0);

    await user.click(screen.getByRole("button", { name: "04 Recovery" }));
    expect(screen.getByRole("heading", { name: "Close the loop." })).toBeVisible();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
