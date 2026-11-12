import { describe, expect, it } from "vitest";
import {
  rackGroupPoint,
  STORY_GROUP_ORIGIN,
  storyFrame,
  storyViewport,
} from "./observability-story";

describe("story timeline", () => {
  it("reveals signals, then the trace, then recovery, in that order", () => {
    expect(storyFrame(0.04)).toMatchObject({ signals: 0, trace: 0, recovery: 0 });
    expect(storyFrame(0.36)).toMatchObject({ signals: 1, trace: 0, recovery: 0 });
    expect(storyFrame(0.64)).toMatchObject({ signals: 1, trace: 1, recovery: 0 });
    expect(storyFrame(0.96)).toMatchObject({ signals: 1, trace: 1, recovery: 1 });
  });

  it("investigates only while the trace is open and recovery is not yet verified", () => {
    expect(storyFrame(0.36).investigation).toBe(0);
    expect(storyFrame(0.64).investigation).toBe(1);
    expect(storyFrame(0.96).investigation).toBe(0);
  });

  it("stays finite and bounded for invalid progress", () => {
    for (const value of [Number.NaN, -4, 9, Infinity])
      for (const layer of Object.values(storyFrame(value)))
        expect(Number.isFinite(layer)).toBe(true);
    expect(storyFrame(-4).progress).toBe(0);
    expect(storyFrame(9).progress).toBe(1);
  });
});

describe("rack group placement", () => {
  it("leaves the racks untouched before any signal appears", () => {
    expect(rackGroupPoint(storyFrame(0), 202, 414)).toEqual({ x: 202, y: 414 });
  });

  it("shrinks around the group origin and moves down to make room for the signal cards", () => {
    const frame = storyFrame(0.36);
    const origin = rackGroupPoint(frame, STORY_GROUP_ORIGIN.x, STORY_GROUP_ORIGIN.y);
    expect(origin.x).toBeCloseTo(STORY_GROUP_ORIGIN.x - 18);
    expect(origin.y).toBeCloseTo(STORY_GROUP_ORIGIN.y + 44);
    const top = rackGroupPoint(frame, 392, 165);
    expect(top.y).toBeGreaterThan(165);
  });
});

describe("drawing viewport", () => {
  it("fits the whole drawing, letterboxing whichever axis has room to spare", () => {
    expect(storyViewport(820, 610)).toEqual({ scale: 1, unitsWide: 820, unitsHigh: 610 });
    const wide = storyViewport(1000, 500);
    expect(wide.scale).toBeCloseTo(500 / 610);
    expect(wide.unitsHigh).toBeCloseTo(610);
    expect(wide.unitsWide).toBeGreaterThan(820);
    const tall = storyViewport(410, 610);
    expect(tall.scale).toBeCloseTo(0.5);
    expect(tall.unitsWide).toBeCloseTo(820);
  });

  it("falls back to the native size for unusable element sizes", () => {
    expect(storyViewport(0, Number.NaN).scale).toBe(1);
  });
});
