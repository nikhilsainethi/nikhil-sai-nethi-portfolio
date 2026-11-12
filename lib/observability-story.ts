/**
 * Pure maths shared by the "Follow the signals" story: the SVG overlay and the
 * WebGL diorama underneath it are both driven from these values, so they stay
 * registered with each other.
 */
export const STORY_VIEWBOX = { width: 820, height: 610 } as const;
/** transform-origin of the rack group in the SVG drawing. */
export const STORY_GROUP_ORIGIN = { x: 420, y: 365 } as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Layer values for a story progress in 0..1. */
export function storyFrame(value: number) {
  const progress = clamp(Number.isFinite(value) ? value : 0);
  const signals = clamp((progress - 0.12) / 0.2);
  const trace = clamp((progress - 0.43) / 0.17);
  const recovery = clamp((progress - 0.75) / 0.15);
  return {
    progress,
    signals,
    trace,
    recovery,
    /** The slow dependency is under investigation until recovery is verified. */
    investigation: trace * (1 - recovery),
    rackScale: 1 - signals * 0.15,
    rackX: -18 * signals - 12 * trace,
    rackY: 44 * signals,
    signalY: 24 * (1 - signals),
    traceY: 30 * (1 - trace),
    floorY: 14 * signals,
  };
}

export type StoryFrame = ReturnType<typeof storyFrame>;

/** Where a point of the rack group ends up in the SVG once the group has moved. */
export function rackGroupPoint(frame: StoryFrame, x: number, y: number) {
  return {
    x: STORY_GROUP_ORIGIN.x + (x - STORY_GROUP_ORIGIN.x) * frame.rackScale + frame.rackX,
    y: STORY_GROUP_ORIGIN.y + (y - STORY_GROUP_ORIGIN.y) * frame.rackScale + frame.rackY,
  };
}

/**
 * How the 820x610 drawing sits inside its element (SVG "meet" scaling):
 * the scale in CSS pixels per drawing unit, and how many drawing units are
 * visible across the whole element.
 */
export function storyViewport(width: number, height: number) {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : STORY_VIEWBOX.width;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : STORY_VIEWBOX.height;
  const scale = Math.min(safeWidth / STORY_VIEWBOX.width, safeHeight / STORY_VIEWBOX.height);
  return { scale, unitsWide: safeWidth / scale, unitsHigh: safeHeight / scale };
}
