import { describe, expect, it } from "vitest";
import {
  ANCHORS,
  LAST_STOP,
  STILLS,
  STOPS,
  journeyAt,
  nearestStill,
  stopIndex,
  worldPose,
  zoneLabel,
} from "./world-path";
import {
  CORE_CENTRE_Z,
  FIRST_TIER,
  LAST_TIER,
  PLATFORMS,
  TUNNEL_END_Z,
  TUNNEL_START_Z,
  WORLD,
  corePoint,
  sectorHasRacks,
  sectorIsOpen,
} from "./world-layout";

const radiusFromSpine = (p: number[]) => Math.hypot(p[0], p[2] - CORE_CENTRE_Z);

describe("world layout", () => {
  it("places the core directly beyond the end of the tunnel", () => {
    expect(TUNNEL_START_Z).toBeCloseTo(-10.2);
    expect(TUNNEL_END_Z).toBeCloseTo(-28.2);
    expect(CORE_CENTRE_Z).toBeCloseTo(-38.8);
    const mouth = corePoint(WORLD.core.radius, 0, 0);
    expect(mouth[0]).toBeCloseTo(0);
    expect(mouth[2]).toBeCloseTo(TUNNEL_END_Z);
  });

  it("opens the railing only for the tunnel bridge and the four exhibit platforms", () => {
    let open = 0;
    for (let tier = FIRST_TIER; tier <= LAST_TIER; tier += 1)
      for (let sector = 0; sector < WORLD.core.sectors; sector += 1) if (sectorIsOpen(tier, sector)) open += 1;
    expect(open).toBe(5);
    expect(sectorIsOpen(0, 0)).toBe(true);
    expect(sectorHasRacks(0, 0)).toBe(false);
    expect(sectorHasRacks(0, 1)).toBe(true);
    expect(PLATFORMS).toHaveLength(4);
  });
});

describe("camera route", () => {
  it("starts in the hero aisle and follows the hero scrubber there", () => {
    const start = worldPose(0, 0.28);
    const later = worldPose(0, 0.9);
    expect(start.zone).toBe("aisle");
    expect(later.position[2]).toBeLessThan(start.position[2]);
    expect(start.doors).toBe(0);
  });

  it("passes exactly through every stop after the hero", () => {
    for (let i = 1; i <= LAST_STOP; i += 1) {
      const pose = worldPose(i);
      STOPS[i].position.forEach((value, axis) => expect(pose.position[axis]).toBeCloseTo(value, 5));
      STOPS[i].target.forEach((value, axis) => expect(pose.target[axis]).toBeCloseTo(value, 5));
    }
  });

  it("opens the doors before the camera goes through them", () => {
    let passed = false;
    for (let u = 0; u <= 4; u += 0.02) {
      const pose = worldPose(u);
      if (pose.position[2] < TUNNEL_START_Z + 0.35) {
        passed = true;
        expect(pose.doors).toBe(1);
      }
    }
    expect(passed).toBe(true);
  });

  it("stays inside the tunnel walls while travelling through it", () => {
    for (let u = 2; u <= 5.6; u += 0.02) {
      const { position } = worldPose(u);
      if (position[2] > TUNNEL_START_Z || position[2] < TUNNEL_END_Z) continue;
      expect(Math.abs(position[0])).toBeLessThan(WORLD.tunnel.floorHalf - 0.3);
      expect(position[1]).toBeGreaterThan(1.1);
      expect(position[1]).toBeLessThan(WORLD.tunnel.height - 0.5);
    }
  });

  it("never flies through the spine or the cabinets while inside the core", () => {
    const top = WORLD.roof.underside;
    for (let u = stopIndex("core-reveal"); u <= stopIndex("oculus"); u += 0.02) {
      const { position } = worldPose(u);
      if (position[1] > top - 0.2) continue;
      const radius = radiusFromSpine(position);
      expect(radius).toBeGreaterThan(WORLD.core.spineRadius + 0.55);
      // The bridge from the tunnel is the one place the route runs out to the wall.
      const onBridge = Math.abs(position[0]) < 1.0 && position[1] > 1.2 && position[1] < 2.5;
      if (!onBridge) expect(radius).toBeLessThan(WORLD.core.deckInner - 0.4);
    }
  });

  it("leaves through the oculus, clear of its rim and railing", () => {
    for (let u = stopIndex("oculus"); u <= stopIndex("roof-a"); u += 0.01) {
      const { position } = worldPose(u);
      const radius = radiusFromSpine(position);
      const height = position[1];
      const insideSlab = height > WORLD.roof.underside - 0.3 && height < WORLD.roof.top + 1.7;
      if (insideSlab) expect(radius).toBeLessThan(WORLD.roof.oculusRadius - 0.5);
    }
  });

  it("turns the view gently: no leg of the route swings it round", () => {
    const direction = (u: number) => {
      const { position, target } = worldPose(u);
      const d = [target[0] - position[0], target[1] - position[1], target[2] - position[2]];
      const length = Math.hypot(d[0], d[1], d[2]);
      return d.map((value) => value / length);
    };
    for (let leg = 1; leg < LAST_STOP; leg += 1) {
      let turned = 0;
      let previous = direction(leg);
      for (let step = 1; step <= 40; step += 1) {
        const next = direction(leg + step / 40);
        const dot = previous[0] * next[0] + previous[1] * next[1] + previous[2] * next[2];
        turned += (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;
        previous = next;
      }
      expect(turned, `${STOPS[leg].name} to ${STOPS[leg + 1].name}`).toBeLessThan(80);
    }
  });

  it("climbs steadily from platform to platform", () => {
    const heights = ["exhibit-1", "exhibit-2", "exhibit-3", "exhibit-4", "control-ring"].map(
      (name) => worldPose(stopIndex(name)).position[1],
    );
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
    expect(worldPose(LAST_STOP).position[1]).toBeGreaterThan(WORLD.roof.top);
  });

  it("returns a finite pose for out-of-range or invalid progress", () => {
    for (const u of [-5, 999, Number.NaN, Infinity]) {
      const pose = worldPose(u, Number.NaN, { x: Number.NaN, y: 9 });
      for (const value of [...pose.position, ...pose.target, pose.fov, pose.fog, pose.shift, pose.light, pose.doors])
        expect(Number.isFinite(value)).toBe(true);
    }
    expect(worldPose(999).u).toBe(LAST_STOP);
  });

  it("names where the camera is", () => {
    expect(zoneLabel(worldPose(0))).toBe("Cold aisle");
    expect(zoneLabel(worldPose(stopIndex("tunnel-mid")))).toBe("Tunnel");
    expect(zoneLabel(worldPose(stopIndex("exhibit-2")))).toBe("Core");
    expect(zoneLabel(worldPose(stopIndex("control-ring")))).toBe("Control ring");
    expect(zoneLabel(worldPose(LAST_STOP))).toBe("Roof");
  });
});

describe("scroll to journey mapping", () => {
  const landmarks = ANCHORS.map((_, i) => 1000 + i * 500);

  it("lists landmarks in route order", () => {
    const us = ANCHORS.map((anchor) => anchor.u);
    expect(us).toEqual([...us].sort((a, b) => a - b));
    expect(us[0]).toBe(0);
    expect(us[us.length - 1]).toBe(LAST_STOP);
  });

  it("holds the first and last stop outside the landmarks", () => {
    expect(journeyAt(landmarks, 0)).toBe(0);
    expect(journeyAt(landmarks, 1e9)).toBe(LAST_STOP);
  });

  it("interpolates between neighbouring landmarks", () => {
    expect(journeyAt(landmarks, 1000 + 500)).toBeCloseTo(ANCHORS[1].u);
    expect(journeyAt(landmarks, 1000 + 250)).toBeCloseTo((ANCHORS[0].u + ANCHORS[1].u) / 2);
  });

  it("never moves backwards as the page scrolls down, even with out-of-order or missing landmarks", () => {
    const messy = [...landmarks];
    messy[4] = messy[2] - 100;
    messy[7] = Number.NaN;
    let previous = -1;
    for (let y = 0; y < 12000; y += 37) {
      const u = journeyAt(messy, y);
      expect(u).toBeGreaterThanOrEqual(previous);
      previous = u;
    }
    expect(journeyAt([], 500)).toBe(0);
    expect(journeyAt(landmarks, Number.NaN)).toBe(0);
  });

  it("picks the nearest still for reduced-motion cuts", () => {
    expect(nearestStill(0.2)).toBe(0);
    expect(nearestStill(stopIndex("exhibit-1") + 0.1)).toBe(stopIndex("exhibit-1"));
    expect(nearestStill(Number.NaN)).toBe(0);
    expect(STILLS).toContain(LAST_STOP);
  });
});
