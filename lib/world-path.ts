import { datacentreView, type Pointer } from "./datacentre-scene";
import {
  CORE_CENTRE_Z,
  PLATFORMS,
  TUNNEL_END_Z,
  TUNNEL_START_Z,
  WORLD,
  corePoint,
  degrees,
  type Vec3,
} from "./world-layout";

/**
 * The camera's route through the world, and how the page's scroll position
 * maps onto it.
 *
 * The route is a list of stops. Stop 0 is the hero aisle, whose pose comes
 * from the hero's own scrubber (lib/datacentre-scene). Journey progress `u`
 * is a stop index, so `u = 8.5` is half way between stops 8 and 9.
 */

export type Zone = "aisle" | "tunnel" | "core" | "roof";

export type Stop = {
  name: string;
  zone: Zone;
  position: Vec3;
  target: Vec3;
  /** Vertical field of view on a landscape screen, degrees. */
  fov: number;
  /** How far the picture is pushed right on wide screens (fraction of width), leaving room for text. */
  shift: number;
  fog: number;
  /** Strength of the light that plays back the baked lighting. */
  light: number;
};

const core = WORLD.core;
const centre: Vec3 = [0, 0, CORE_CENTRE_Z];
const at = (y: number): Vec3 => [centre[0], y, centre[2]];
const EYE = 1.62;

function exhibitStop(index: number): Stop {
  const platform = PLATFORMS[index];
  return {
    name: `exhibit-${index + 1}`,
    zone: "core",
    // Stand between the spine and the platform, off to one side for a three-quarter view.
    position: corePoint(2.5, platform.angle - degrees(34), platform.height + EYE),
    target: corePoint(core.exhibitRadius - 0.6, platform.angle + degrees(4), platform.height + 1.35),
    fov: 54,
    shift: 0.17,
    fog: 0.02,
    light: 3.0,
  };
}

function helixStop(index: number): Stop {
  const from = PLATFORMS[index];
  const to = PLATFORMS[index + 1];
  const angle = (from.angle + to.angle) / 2 - degrees(30);
  const height = (from.height + to.height) / 2 + EYE;
  return {
    name: `helix-${index + 1}`,
    zone: "core",
    position: corePoint(3.3, angle, height),
    target: corePoint(core.rackFront, angle + degrees(38), height + 0.4),
    fov: 56,
    shift: 0.08,
    fog: 0.02,
    light: 3.0,
  };
}

/** A point `distance` metres from `from`, heading towards core angle `heading`, `rise` metres higher. */
function ahead(from: Vec3, heading: number, distance: number, rise: number): Vec3 {
  return [from[0] + Math.sin(heading) * distance, from[1] + rise, from[2] + Math.cos(heading) * distance];
}

const topTier = core.tierMax * core.tierHeight;
const roofTop = WORLD.roof.top;

// The top of the route keeps one heading (towards the tunnel side, core angle 0)
// from the last exhibit to the roof, so the view tilts and pulls back but never
// swings round: look down the shaft, tilt up through the oculus, rise beside
// the beam, then dolly back across the roof.
const TOP_SIDE = degrees(180);
const TOP_HEADING = degrees(0);
const crossOver = corePoint(3.5, degrees(258), topTier - 1.3 + EYE);

export const STOPS: Stop[] = [
  // 0: replaced at run time by the hero's own view
  { name: "hero", zone: "aisle", position: [0.26, 1.36, 1.15], target: [-0.1, 1.28, -4.85], fov: 50, shift: 0.2, fog: 0.062, light: 2.5 },
  { name: "approach", zone: "aisle", position: [0, 1.5, -6.0], target: [0, 1.42, -14], fov: 50, shift: 0.08, fog: 0.058, light: 2.5 },
  { name: "threshold", zone: "aisle", position: [0, 1.5, TUNNEL_START_Z + 1.0], target: [0, 1.45, -19], fov: 52, shift: 0, fog: 0.05, light: 2.5 },
  { name: "tunnel-in", zone: "tunnel", position: [0, 1.5, TUNNEL_START_Z - 1.6], target: [0, 1.5, -23], fov: 56, shift: 0, fog: 0.045, light: 3.0 },
  { name: "tunnel-mid", zone: "tunnel", position: [0.22, 1.46, (TUNNEL_START_Z + TUNNEL_END_Z) / 2], target: [-0.1, 1.52, -31], fov: 58, shift: 0, fog: 0.04, light: 3.0 },
  { name: "tunnel-out", zone: "tunnel", position: [0, 1.5, TUNNEL_END_Z + 1.9], target: [0, 2.6, CORE_CENTRE_Z], fov: 58, shift: 0, fog: 0.03, light: 3.0 },
  { name: "core-reveal", zone: "core", position: [0.3, 1.72, TUNNEL_END_Z - 3.4], target: at(8.0), fov: 62, shift: 0, fog: 0.018, light: 3.0 },
  // leave the bridge and start to climb, already turning towards the first exhibit
  { name: "core-rise", zone: "core", position: corePoint(4.3, degrees(18), 3.4), target: corePoint(5.6, PLATFORMS[0].angle, PLATFORMS[0].height + 1.6), fov: 60, shift: 0.06, fog: 0.018, light: 3.0 },
  exhibitStop(0),
  helixStop(0),
  exhibitStop(1),
  helixStop(1),
  exhibitStop(2),
  helixStop(2),
  exhibitStop(3),
  { name: "cross-over", zone: "core", position: crossOver, target: ahead(crossOver, TOP_HEADING, 7, -1.6), fov: 58, shift: 0.04, fog: 0.018, light: 3.0 },
  { name: "control-ring", zone: "core", position: corePoint(5.7, TOP_SIDE, topTier + 1.25), target: corePoint(2.4, degrees(52), topTier - 2.3), fov: 62, shift: 0, fog: 0.016, light: 3.0 },
  { name: "oculus", zone: "core", position: corePoint(3.3, TOP_SIDE, topTier + 0.2), target: corePoint(3.7, TOP_HEADING, roofTop + 1.4), fov: 62, shift: 0, fog: 0.012, light: 3.0 },
  { name: "above-oculus", zone: "roof", position: corePoint(3.1, TOP_SIDE, roofTop + 2.9), target: corePoint(46, TOP_HEADING, roofTop + 10), fov: 58, shift: 0, fog: 0.0026, light: 5.0 },
  { name: "roof-a", zone: "roof", position: corePoint(11.3, TOP_SIDE, roofTop + 1.75), target: at(roofTop + 7.5), fov: 56, shift: 0.14, fog: 0.0024, light: 5.0 },
  { name: "roof-b", zone: "roof", position: corePoint(11.6, degrees(168), roofTop + 1.6), target: at(roofTop + 12), fov: 56, shift: 0.14, fog: 0.0024, light: 5.0 },
  { name: "beacon", zone: "roof", position: corePoint(11.6, degrees(148), roofTop + 1.5), target: at(roofTop + 46), fov: 64, shift: 0, fog: 0.0022, light: 5.0 },
];

export const LAST_STOP = STOPS.length - 1;
export const stopIndex = (name: string) => {
  const index = STOPS.findIndex((stop) => stop.name === name);
  if (index < 0) throw new Error(`Unknown stop "${name}"`);
  return index;
};

/**
 * Page landmarks: when the point `at` (0 = top, 1 = bottom) of the element
 * marked `data-world-anchor="<anchor>"` reaches the middle of the screen, the
 * camera is at `stop`. Listed in page order.
 */
export const ANCHORS: { anchor: string; at: number; u: number }[] = [
  { anchor: "hero", at: 0.5, u: stopIndex("hero") },
  { anchor: "preview", at: 0.5, u: stopIndex("approach") },
  { anchor: "interlude-door", at: 0.6, u: stopIndex("threshold") },
  { anchor: "story", at: 0.1, u: stopIndex("tunnel-in") },
  { anchor: "story", at: 0.5, u: stopIndex("tunnel-mid") },
  { anchor: "story", at: 0.92, u: stopIndex("tunnel-out") },
  { anchor: "interlude-core", at: 0.3, u: stopIndex("core-reveal") },
  { anchor: "interlude-core", at: 0.82, u: stopIndex("core-rise") },
  { anchor: "project-0", at: 0.5, u: stopIndex("exhibit-1") },
  { anchor: "project-1", at: 0.5, u: stopIndex("exhibit-2") },
  { anchor: "project-2", at: 0.5, u: stopIndex("exhibit-3") },
  { anchor: "project-3", at: 0.5, u: stopIndex("exhibit-4") },
  { anchor: "lab", at: 0.3, u: stopIndex("control-ring") },
  { anchor: "interlude-roof", at: 0.3, u: stopIndex("oculus") },
  { anchor: "interlude-roof", at: 0.85, u: stopIndex("above-oculus") },
  { anchor: "about", at: 0.12, u: stopIndex("roof-a") },
  { anchor: "about", at: 0.85, u: stopIndex("roof-b") },
  { anchor: "contact", at: 0.45, u: stopIndex("beacon") },
];

/** Stops the camera cuts between when motion is reduced (no flight). */
export const STILLS = ["hero", "threshold", "tunnel-mid", "core-reveal", "exhibit-1", "exhibit-2", "exhibit-3", "exhibit-4", "control-ring", "roof-a", "beacon"].map(stopIndex);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const finite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);

/**
 * Journey progress for a scroll position. `landmarks` are the measured page
 * positions (document Y) of the ANCHORS, in the same order; `focusY` is the
 * document Y at the middle of the screen. Missing landmarks (NaN) are skipped.
 */
export function journeyAt(landmarks: number[], focusY: number) {
  const points: { y: number; u: number }[] = [];
  ANCHORS.forEach((anchor, i) => {
    const y = landmarks[i];
    if (!Number.isFinite(y)) return;
    // Page order should already be increasing; never let the camera run backwards if it is not.
    const previous = points[points.length - 1];
    points.push({ y: previous ? Math.max(y, previous.y) : y, u: anchor.u });
  });
  if (points.length === 0 || !Number.isFinite(focusY)) return 0;
  if (focusY <= points[0].y) return points[0].u;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (focusY <= b.y) return b.y === a.y ? b.u : a.u + ((focusY - a.y) / (b.y - a.y)) * (b.u - a.u);
  }
  return points[points.length - 1].u;
}

/** The still nearest to a journey position. */
export function nearestStill(u: number) {
  const value = finite(u, 0);
  return STILLS.reduce((best, still) => (Math.abs(still - value) < Math.abs(best - value) ? still : best), STILLS[0]);
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export type WorldPose = {
  u: number;
  zone: Zone;
  position: Vec3;
  target: Vec3;
  fov: number;
  shift: number;
  fog: number;
  light: number;
  /** 0 closed .. 1 open: the aisle doors slide apart as the camera reaches them. */
  doors: number;
  /** The hero's own story values, only meaningful near stop 0. */
  telemetry: number;
  investigation: number;
  recovery: number;
};

/**
 * Camera pose at journey progress `u`. `heroProgress` and `pointer` shape the
 * hero aisle (stop 0); the pointer's influence fades out along the route.
 */
export function worldPose(u: number, heroProgress = 0.28, pointer: Pointer = { x: 0, y: 0 }): WorldPose {
  const value = clamp(finite(u, 0), 0, LAST_STOP);
  const hero = datacentreView(heroProgress, pointer);
  const stop = (index: number): Pick<Stop, "position" | "target"> => {
    const i = clamp(index, 0, LAST_STOP);
    return i === 0 ? hero : STOPS[i];
  };
  const i = Math.min(Math.floor(value), LAST_STOP - 1);
  const t = value - i;
  const [a, b, c, d] = [stop(i - 1), stop(i), stop(i + 1), stop(i + 2)];
  const axis = (key: "position" | "target", n: number) => catmullRom(a[key][n], b[key][n], c[key][n], d[key][n], t);
  const from = STOPS[i];
  const to = STOPS[i + 1];
  const s = smooth(t);
  const doorT = clamp((value - 1.1) / 0.8, 0, 1);
  return {
    u: value,
    zone: t < 0.5 ? from.zone : to.zone,
    position: [axis("position", 0), axis("position", 1), axis("position", 2)],
    target: [axis("target", 0), axis("target", 1), axis("target", 2)],
    fov: lerp(from.fov, to.fov, s),
    shift: lerp(from.shift, to.shift, s),
    fog: lerp(from.fog, to.fog, s),
    light: lerp(from.light, to.light, s),
    doors: smooth(doorT),
    telemetry: hero.telemetry,
    investigation: hero.investigation,
    recovery: hero.recovery,
  };
}

/** Text for the on-screen position readout. */
export function zoneLabel(pose: Pick<WorldPose, "zone" | "u">) {
  if (pose.zone === "aisle") return "Cold aisle";
  if (pose.zone === "tunnel") return "Tunnel";
  if (pose.zone === "roof") return "Roof";
  return pose.u >= stopIndex("control-ring") - 0.5 ? "Control ring" : "Core";
}
