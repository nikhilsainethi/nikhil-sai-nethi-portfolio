import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { motionValue } from "framer-motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ANCHORS, LAST_STOP, nearestStill } from "@/lib/world-path";
import { LAB_SCENARIO_EVENT, WorldCanvas } from "./WorldCanvas";

const createWorldScene = vi.hoisted(() => vi.fn());
vi.mock("./three/world/createWorldScene", () => ({ createWorldScene }));

function fakeScene() {
  return {
    setProgress: vi.fn(),
    setJourney: vi.fn(),
    setPointer: vi.fn(),
    setAnimated: vi.fn(),
    setVisible: vi.fn(),
    setAlert: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  };
}

/** Lay out one landmark element per anchor, 1000px apart, as the page would. */
function addLandmarks() {
  const names = [...new Set(ANCHORS.map(({ anchor }) => anchor))];
  const elements = names.map((name, i) => {
    const element = document.createElement("section");
    element.dataset.worldAnchor = name;
    document.body.append(element);
    vi.spyOn(element, "getBoundingClientRect").mockImplementation(
      () => new DOMRect(0, i * 1000 - window.scrollY, 1000, 1000),
    );
    return element;
  });
  return () => elements.forEach((element) => element.remove());
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  window.dispatchEvent(new Event("scroll"));
}

let removeLandmarks = () => {};

beforeEach(() => {
  document.documentElement.dataset.webgl = "yes";
  document.documentElement.dataset.mode = "dark";
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  scrollTo(0);
  removeLandmarks = addLandmarks();
});

afterEach(() => {
  cleanup();
  removeLandmarks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  createWorldScene.mockReset();
  for (const key of ["webgl", "mode", "world"]) delete document.documentElement.dataset[key];
});

async function mount(motionEnabled = true) {
  const scene = fakeScene();
  createWorldScene.mockResolvedValue(scene);
  const progress = motionValue(0.28);
  const view = render(<WorldCanvas progress={progress} motionEnabled={motionEnabled} />);
  await vi.waitFor(() => expect(document.documentElement.dataset.world).toBeDefined());
  await vi.waitFor(() => expect(scene.setJourney).toHaveBeenCalled());
  return { scene, progress, ...view };
}

describe("world canvas", () => {
  it("does nothing, and loads nothing, when the page reported no WebGL", async () => {
    document.documentElement.dataset.webgl = "no";
    render(<WorldCanvas progress={motionValue(0.28)} motionEnabled />);
    await Promise.resolve();
    expect(createWorldScene).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.world).toBeUndefined();
    expect(screen.getByTestId("world-canvas").parentElement).toHaveAttribute("data-state", "idle");
  });

  it("runs the journey behind the whole page in the dark theme", async () => {
    const { scene } = await mount();
    expect(document.documentElement.dataset.world).toBe("on");
    expect(screen.getByTestId("world-canvas").parentElement).toHaveAttribute("data-state", "ready");
    expect(scene.setJourney).toHaveBeenLastCalledWith(0);
  });

  it("moves the camera along the route as the page scrolls", async () => {
    const { scene } = await mount();
    scrollTo(1e7);
    await vi.waitFor(() => expect(scene.setJourney).toHaveBeenLastCalledWith(LAST_STOP));
    scrollTo(0);
    await vi.waitFor(() => expect(scene.setJourney).toHaveBeenLastCalledWith(0));
  });

  it("keeps the world to the hero in the light theme and resumes the journey in the dark one", async () => {
    const { scene } = await mount();
    scrollTo(1e7);
    await vi.waitFor(() => expect(scene.setJourney).toHaveBeenLastCalledWith(LAST_STOP));
    document.documentElement.dataset.mode = "light";
    await vi.waitFor(() => expect(document.documentElement.dataset.world).toBe("hero"));
    await vi.waitFor(() => expect(scene.setJourney).toHaveBeenLastCalledWith(0));
    document.documentElement.dataset.mode = "dark";
    await vi.waitFor(() => expect(document.documentElement.dataset.world).toBe("on"));
    await vi.waitFor(() => expect(scene.setJourney).toHaveBeenLastCalledWith(LAST_STOP));
  });

  it("cuts between stills instead of flying when motion is off", async () => {
    const { scene } = await mount(false);
    expect(createWorldScene).toHaveBeenCalledWith(expect.objectContaining({ animated: false }));
    scrollTo(1e7);
    await vi.waitFor(() => expect(scene.setJourney).toHaveBeenLastCalledWith(nearestStill(LAST_STOP)));
    for (const [u] of scene.setJourney.mock.calls) expect(Number.isInteger(u)).toBe(true);
  });

  it("forwards the hero scrubber and the signal lab's incident to the world", async () => {
    const { scene, progress } = await mount();
    progress.set(0.6);
    expect(scene.setProgress).toHaveBeenLastCalledWith(0.6);
    window.dispatchEvent(new CustomEvent(LAB_SCENARIO_EVENT, { detail: "slow-lookup" }));
    expect(scene.setAlert).toHaveBeenLastCalledWith(true);
    window.dispatchEvent(new CustomEvent(LAB_SCENARIO_EVENT, { detail: "healthy" }));
    expect(scene.setAlert).toHaveBeenLastCalledWith(false);
  });

  it("returns the page to its plain layout when the world fails or is torn down", async () => {
    createWorldScene.mockRejectedValue(new Error("no model"));
    const failed = render(<WorldCanvas progress={motionValue(0.28)} motionEnabled />);
    await vi.waitFor(() => expect(document.documentElement.dataset.webgl).toBe("no"));
    expect(document.documentElement.dataset.world).toBeUndefined();
    failed.unmount();

    document.documentElement.dataset.webgl = "yes";
    const { scene, unmount } = await mount();
    unmount();
    expect(scene.dispose).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.world).toBeUndefined();
  });
});
