import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { motionValue } from "framer-motion";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StoryCanvas } from "./DatacentreCanvas";

const createStoryScene = vi.hoisted(() => vi.fn());
vi.mock("./three/createStoryScene", () => ({ createStoryScene }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  createStoryScene.mockReset();
  delete document.documentElement.dataset.mode;
  delete document.documentElement.dataset.webgl;
});

function fakeScene() {
  return {
    setProgress: vi.fn(),
    setPointer: vi.fn(),
    setAnimated: vi.fn(),
    setVisible: vi.fn(),
    setTheme: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  };
}

function allowWebGL() {
  document.documentElement.dataset.webgl = "yes";
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

describe("story diorama canvas", () => {
  it("stays a hidden, inert layer when WebGL is unavailable", async () => {
    document.documentElement.dataset.webgl = "no";
    render(<StoryCanvas progress={motionValue(0.04)} motionEnabled />);
    const canvas = screen.getByTestId("story-canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("data-state", "idle");
    await Promise.resolve();
    expect(createStoryScene).not.toHaveBeenCalled();
  });

  it("falls back to its own check when the page has not reported WebGL support", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<StoryCanvas progress={motionValue(0.04)} motionEnabled />);
    await Promise.resolve();
    expect(createStoryScene).not.toHaveBeenCalled();
  });

  it("reveals the scene once it is ready and forwards progress to it", async () => {
    allowWebGL();
    const scene = fakeScene();
    createStoryScene.mockResolvedValue(scene);
    const progress = motionValue(0.04);
    render(<StoryCanvas progress={progress} motionEnabled />);
    await vi.waitFor(() => expect(screen.getByTestId("story-canvas")).toHaveAttribute("data-state", "ready"));
    expect(createStoryScene).toHaveBeenCalledWith(expect.objectContaining({ animated: true, progress: 0.04 }));
    progress.set(0.7);
    expect(scene.setProgress).toHaveBeenLastCalledWith(0.7);
  });

  it("pauses the animation when motion is switched off and cleans up on unmount", async () => {
    allowWebGL();
    const scene = fakeScene();
    createStoryScene.mockResolvedValue(scene);
    const progress = motionValue(0.04);
    const { rerender, unmount } = render(<StoryCanvas progress={progress} motionEnabled />);
    await vi.waitFor(() => expect(scene.setAnimated).toHaveBeenCalledWith(true));
    rerender(<StoryCanvas progress={progress} motionEnabled={false} />);
    expect(scene.setAnimated).toHaveBeenLastCalledWith(false);
    unmount();
    expect(scene.dispose).toHaveBeenCalledTimes(1);
  });

  it("re-themes the diorama when the page theme changes", async () => {
    allowWebGL();
    const scene = fakeScene();
    createStoryScene.mockResolvedValue(scene);
    render(<StoryCanvas progress={motionValue(0.04)} motionEnabled />);
    await vi.waitFor(() => expect(screen.getByTestId("story-canvas")).toHaveAttribute("data-state", "ready"));
    document.documentElement.dataset.mode = "light";
    await vi.waitFor(() => expect(scene.setTheme).toHaveBeenCalled());
  });

  it("keeps the fallback in place when the scene fails to load", async () => {
    allowWebGL();
    createStoryScene.mockRejectedValue(new Error("no model"));
    render(<StoryCanvas progress={motionValue(0.04)} motionEnabled />);
    await vi.waitFor(() => expect(screen.getByTestId("story-canvas")).toHaveAttribute("data-state", "unavailable"));
  });
});
