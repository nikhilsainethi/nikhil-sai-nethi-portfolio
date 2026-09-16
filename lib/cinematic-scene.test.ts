import { describe, expect, it } from "vitest";
import { cinematicFrame, projectPoint, SCENE_CAMERA } from "./cinematic-scene";

describe("cinematic scene perspective", () => {
  it("converges distant infrastructure toward the vanishing point", () => {
    const near = projectPoint({ x: 1.6, y: 0, z: 3 });
    const far = projectPoint({ x: 1.6, y: 0, z: 12 });
    expect(near.x).toBeGreaterThan(far.x);
    expect(far.x).toBeGreaterThan(SCENE_CAMERA.x);
    expect(near.y).toBeGreaterThan(far.y);
    expect(far.y).toBeGreaterThan(SCENE_CAMERA.y);
    const ceiling = projectPoint({ x: 1.6, y: 3, z: 3 });
    expect(ceiling.y).toBeLessThan(SCENE_CAMERA.y);
  });

  it("rejects points behind the camera rather than emitting invalid SVG coordinates", () => {
    expect(() => projectPoint({ x: 1, y: 1, z: 0 })).toThrow(RangeError);
    expect(() => projectPoint({ x: Number.NaN, y: 1, z: 2 })).toThrow(RangeError);
  });
});

describe("cinematic timeline", () => {
  it("keeps unbounded or invalid input within a finite renderable pose", () => {
    expect(cinematicFrame(-3).progress).toBe(0);
    expect(cinematicFrame(4).progress).toBe(1);
    expect(cinematicFrame(Number.NaN).progress).toBe(0.28);
    for (const value of Object.values(cinematicFrame(Number.POSITIVE_INFINITY))) expect(Number.isFinite(value)).toBe(true);
  });

  it("starts with visible infrastructure and reveals routes before the investigation and recovery", () => {
    const initial = cinematicFrame(0.28);
    expect(initial.scale).toBeGreaterThanOrEqual(1);
    expect(initial.telemetry).toBeGreaterThan(0);
    expect(cinematicFrame(0.62).investigation).toBeGreaterThan(initial.investigation);
    expect(cinematicFrame(1).investigation).toBe(0);
    expect(cinematicFrame(1).telemetry).toBe(1);
    expect(cinematicFrame(1).recovery).toBe(1);
  });
});
