import { describe, expect, it } from "vitest";
import {
  AISLE,
  datacentreView,
  parseSlotName,
  pixelRatioFor,
} from "./datacentre-scene";

describe("data-centre camera", () => {
  it("walks forward down the aisle as the scene progresses", () => {
    let previous = datacentreView(0).position[2];
    for (let step = 1; step <= 20; step += 1) {
      const { position } = datacentreView(step / 20);
      expect(position[2]).toBeLessThan(previous);
      previous = position[2];
    }
  });

  it("always looks ahead, towards the far end of the aisle", () => {
    for (const progress of [0, 0.28, 0.62, 1]) {
      const { position, target } = datacentreView(progress);
      expect(target[2]).toBeLessThan(position[2] - 3);
    }
  });

  it("never leaves the walkway or the cabinet rows, even at the pointer extremes", () => {
    for (const progress of [0, 0.5, 1])
      for (const x of [-1, 1])
        for (const y of [-1, 1]) {
          const { position } = datacentreView(progress, { x, y });
          expect(Math.abs(position[0])).toBeLessThan(AISLE.halfWidth - 0.45);
          expect(position[1]).toBeGreaterThan(1);
          expect(position[1]).toBeLessThan(AISLE.rackHeight - 0.3);
          expect(position[2]).toBeLessThan(AISLE.rowStartZ);
          expect(position[2]).toBeGreaterThan(AISLE.rowEndZ + 2);
        }
  });

  it("shifts the viewpoint with the pointer and clamps wild pointer values", () => {
    const left = datacentreView(0.28, { x: -1, y: 0 });
    const right = datacentreView(0.28, { x: 1, y: 0 });
    expect(right.position[0]).toBeGreaterThan(left.position[0]);
    expect(datacentreView(0.28, { x: 40, y: -40 })).toEqual(
      datacentreView(0.28, { x: 1, y: -1 }),
    );
  });

  it("returns a finite pose for invalid input", () => {
    const view = datacentreView(Number.NaN, { x: Number.NaN, y: Infinity });
    for (const value of [...view.position, ...view.target])
      expect(Number.isFinite(value)).toBe(true);
    expect(view.progress).toBe(0.28);
  });

  it("carries the story values that drive routes, investigation and recovery", () => {
    expect(datacentreView(1).telemetry).toBe(1);
    expect(datacentreView(0.62).investigation).toBe(1);
    expect(datacentreView(1).recovery).toBe(1);
    expect(datacentreView(0.28).investigation).toBe(0);
  });
});

describe("cabinet slots exported from Blender", () => {
  it("reads side, position and variant from a sanitised node name", () => {
    expect(parseSlotName("SlotR07A")).toEqual({
      side: "R",
      index: 7,
      variant: "A",
    });
    expect(parseSlotName("SlotL15C")).toEqual({
      side: "L",
      index: 15,
      variant: "C",
    });
  });

  it("ignores every other node", () => {
    for (const name of ["RackA", "Floor", "SlotX01A", "SlotR1A", "SlotR01D", ""])
      expect(parseSlotName(name)).toBeNull();
  });
});

describe("render resolution", () => {
  it("caps dense displays and never drops below one device pixel", () => {
    expect(pixelRatioFor(3, 0)).toBe(1.75);
    expect(pixelRatioFor(1, 0)).toBe(1);
    expect(pixelRatioFor(3, 1)).toBe(1.25);
    expect(pixelRatioFor(3, 9)).toBe(1);
    expect(pixelRatioFor(0.5, 0)).toBe(1);
    expect(pixelRatioFor(Number.NaN, 0)).toBe(1);
  });
});
