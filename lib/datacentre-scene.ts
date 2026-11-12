import { cinematicFrame } from "./cinematic-scene";

/**
 * Pure maths for the WebGL hero. The geometry itself is authored in
 * tools/blender/build_world.py; the numbers here mirror that file
 * (Three.js is Y-up, and the aisle runs towards -Z).
 */
export const AISLE = {
  halfWidth: 1.15,
  rackHeight: 2.2,
  rackPitch: 0.62,
  /** Front edge of the first cabinets (they start behind the camera). */
  rowStartZ: 1.91,
  /** Far edge of the last cabinets. */
  rowEndZ: -8.01,
  endWallZ: -10,
} as const;

/** The cabinet the story "investigates" (right-hand row). */
export const INVESTIGATED_SLOT = { side: "R", index: 12 } as const;

export type Vec3 = [number, number, number];
export type Pointer = { x: number; y: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const unit = (value: number) => (Number.isFinite(value) ? clamp(value, -1, 1) : 0);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Camera pose and story values for a scene progress in 0..1. */
export function datacentreView(value: number, pointer: Pointer = { x: 0, y: 0 }) {
  const frame = cinematicFrame(value);
  const t = frame.progress;
  const px = unit(pointer.x);
  const py = unit(pointer.y);
  const z = lerp(1.15, -1.5, t);
  const position: Vec3 = [
    lerp(0.26, -0.12, t) + px * 0.2,
    lerp(1.36, 1.5, t) - py * 0.09,
    z,
  ];
  const target: Vec3 = [
    lerp(-0.1, 0.16, t) - px * 0.28,
    lerp(1.28, 1.22, t) + py * 0.12,
    z - 6,
  ];
  return {
    progress: t,
    position,
    target,
    telemetry: frame.telemetry,
    investigation: frame.investigation,
    recovery: frame.recovery,
  };
}

export type Slot = { side: "L" | "R"; index: number; variant: "A" | "B" | "C" };

/** Blender names slots `Slot.R.07.A`; the glTF loader strips the dots. */
export function parseSlotName(name: string): Slot | null {
  const match = /^Slot([LR])(\d{2})([ABC])$/.exec(name);
  if (!match) return null;
  return {
    side: match[1] as Slot["side"],
    index: Number(match[2]),
    variant: match[3] as Slot["variant"],
  };
}

const QUALITY_CAPS = [1.75, 1.25, 1];

/** Render resolution for a device pixel ratio at a quality step (0 = best). */
export function pixelRatioFor(devicePixelRatio: number, qualityStep: number) {
  const cap = QUALITY_CAPS[clamp(Math.round(qualityStep) || 0, 0, QUALITY_CAPS.length - 1)];
  const ratio = Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1;
  return clamp(ratio, 1, cap);
}
