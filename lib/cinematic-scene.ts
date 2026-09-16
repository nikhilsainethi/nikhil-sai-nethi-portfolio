export const SCENE_CAMERA = { x: 1040, y: 440, lens: 1000, height: 1.65 };
export type ScenePoint = { x: number; y: number; z: number };

export function projectPoint({ x, y, z }: ScenePoint): { x: number; y: number } {
  if (![x, y, z].every(Number.isFinite) || z <= 0) {
    throw new RangeError("Scene points must be finite and in front of the camera");
  }
  return {
    x: SCENE_CAMERA.x + (x * SCENE_CAMERA.lens) / z,
    y: SCENE_CAMERA.y + ((SCENE_CAMERA.height - y) * SCENE_CAMERA.lens) / z,
  };
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
function smoothRange(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

export function cinematicFrame(value: number) {
  const progress = clamp(Number.isFinite(value) ? value : 0.28);
  return {
    progress,
    x: (progress - 0.28) * 32,
    y: (progress - 0.28) * -14,
    scale: 1.035 + (progress - 0.28) * 0.035,
    telemetry: smoothRange(0.1, 0.92, progress),
    investigation: Math.max(0, 1 - Math.abs(progress - 0.62) / 0.22),
    recovery: smoothRange(0.74, 1, progress),
    scan: (progress - 0.28) * -110,
  };
}
