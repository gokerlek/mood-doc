type Point = { x: number; y: number };

/** Convert an absolute position to a position relative to a parent. */
export function toRelativePosition(absolutePos: Point, parentPos: Point): Point {
  return { x: absolutePos.x - parentPos.x, y: absolutePos.y - parentPos.y };
}

/** Convert a relative position back to absolute coordinates. */
export function toAbsolutePosition(relativePos: Point, parentPos: Point): Point {
  return { x: relativePos.x + parentPos.x, y: relativePos.y + parentPos.y };
}
