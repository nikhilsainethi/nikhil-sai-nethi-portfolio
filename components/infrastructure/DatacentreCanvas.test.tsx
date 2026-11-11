import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { motionValue } from "framer-motion";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatacentreCanvas } from "./DatacentreCanvas";

const createDatacentreScene = vi.hoisted(() => vi.fn());
vi.mock("./three/createDatacentreScene", () => ({ createDatacentreScene }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  createDatacentreScene.mockReset();
});

function fakeScene() {
  return {
    setProgress: vi.fn(),
    setPointer: vi.fn(),
    setAnimated: vi.fn(),
    setVisible: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  };
}

function allowWebGL() {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    {} as never,
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

describe("WebGL data-centre canvas", () => {
  it("stays a hidden, inert layer when WebGL is unavailable", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(<DatacentreCanvas progress={motionValue(0.28)} motionEnabled />);
    const canvas = screen.getByTestId("datacentre-canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("data-state", "idle");
    await Promise.resolve();
    expect(createDatacentreScene).not.toHaveBeenCalled();
  });

  it("reveals the scene once it is ready and forwards progress to it", async () => {
    allowWebGL();
    const scene = fakeScene();
    createDatacentreScene.mockResolvedValue(scene);
    const progress = motionValue(0.28);
    render(<DatacentreCanvas progress={progress} motionEnabled />);
    await vi.waitFor(() =>
      expect(screen.getByTestId("datacentre-canvas")).toHaveAttribute(
        "data-state",
        "ready",
      ),
    );
    expect(createDatacentreScene).toHaveBeenCalledWith(
      expect.objectContaining({ animated: true, progress: 0.28 }),
    );
    progress.set(0.7);
    expect(scene.setProgress).toHaveBeenLastCalledWith(0.7);
  });

  it("pauses the animation when motion is switched off and cleans up on unmount", async () => {
    allowWebGL();
    const scene = fakeScene();
    createDatacentreScene.mockResolvedValue(scene);
    const progress = motionValue(0.28);
    const { rerender, unmount } = render(
      <DatacentreCanvas progress={progress} motionEnabled />,
    );
    await vi.waitFor(() => expect(scene.setAnimated).toHaveBeenCalledWith(true));
    rerender(<DatacentreCanvas progress={progress} motionEnabled={false} />);
    expect(scene.setAnimated).toHaveBeenLastCalledWith(false);
    unmount();
    expect(scene.dispose).toHaveBeenCalledTimes(1);
  });

  it("keeps the fallback in place when the scene fails to load", async () => {
    allowWebGL();
    createDatacentreScene.mockRejectedValue(new Error("no model"));
    render(<DatacentreCanvas progress={motionValue(0.28)} motionEnabled />);
    await vi.waitFor(() =>
      expect(screen.getByTestId("datacentre-canvas")).toHaveAttribute(
        "data-state",
        "unavailable",
      ),
    );
  });
});
