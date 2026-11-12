import layout from "@/tools/blender/world-layout.json";

/**
 * Where things are in the 3D world, in Three.js coordinates (Y up, the route
 * runs towards -Z). The numbers come from tools/blender/world-layout.json,
 * which is also what the Blender script builds the model from.
 */
export type Vec3 = [number, number, number];

export const WORLD = layout;
export const TUNNEL_START_Z = -layout.aisle.roomY1;
export const TUNNEL_END_Z = TUNNEL_START_Z - layout.tunnel.length;
export const CORE_CENTRE_Z = TUNNEL_END_Z - layout.core.radius;
export const SECTOR_ANGLE = (2 * Math.PI) / layout.core.sectors;
export const TIER_HEIGHT = layout.core.tierHeight;
/** Lowest tier that has a deck and cabinets (the tier below it is the pool). */
export const FIRST_TIER = layout.core.tierMin + 1;
export const LAST_TIER = layout.core.tierMax;

/** A point in the core: `angle` 0 faces the tunnel mouth, `height` is metres above the tunnel floor. */
export function corePoint(radius: number, angle: number, height: number): Vec3 {
  return [radius * Math.sin(angle), height, CORE_CENTRE_Z + radius * Math.cos(angle)];
}

export const degrees = (value: number) => (value * Math.PI) / 180;

export type Platform = { name: string; angle: number; height: number; accent: Vec3 };
export const PLATFORMS: Platform[] = layout.core.platforms.map((platform) => ({
  name: platform.name,
  angle: platform.sector * SECTOR_ANGLE,
  height: platform.tier * TIER_HEIGHT,
  accent: platform.accent as Vec3,
}));

const isPlatform = (tier: number, sector: number) =>
  layout.core.platforms.some((platform) => platform.tier === tier && platform.sector === sector);

/** The deck has no railing where the tunnel bridge or an exhibit platform joins it. */
export function sectorIsOpen(tier: number, sector: number) {
  return (tier === 0 && sector === 0) || isPlatform(tier, sector);
}

/** Cabinets stand in every sector except the one the tunnel comes through. */
export function sectorHasRacks(tier: number, sector: number) {
  return !(tier === 0 && sector === 0);
}
