export type Rect = { x: number; y: number; w: number; h: number };

/** AABB overlap check — returns true if a and b intersect (touching edges do not count) */
export function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x &&
    a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/**
 * Clamps a slot position so the slot stays fully inside the zone.
 * @param value  Raw candidate position (e.g. mouse-derived x or y)
 * @param size   Slot dimension in the same axis (w or h)
 * @param max    Zone dimension in the same axis (zoneW or zoneH)
 */
export function clampToZone(value: number, size: number, max: number): number {
  return Math.max(0, Math.min(Math.max(0, max - size), Math.round(value)));
}

/**
 * Returns the y-offset range {min, max} that a zone occupies inside the frame.
 * Used for zone boundary calculations and testing.
 */
export function getZoneRange(
  zone: 'header' | 'body' | 'footer',
  frameH: number,
  headerH: number,
  footerH: number,
): { min: number; max: number } {
  if (zone === 'header') return { min: 0, max: headerH };
  if (zone === 'footer') return { min: frameH - footerH, max: frameH };
  return { min: headerH, max: frameH - footerH };
}
