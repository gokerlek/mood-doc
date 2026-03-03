import { describe, it, expect } from 'vitest';
import { toRelativePosition, toAbsolutePosition } from '@/lib/flow-utils';

describe('toRelativePosition', () => {
  it('returns unchanged position when parent is at origin', () => {
    const result = toRelativePosition({ x: 100, y: 200 }, { x: 0, y: 0 });
    expect(result).toEqual({ x: 100, y: 200 });
  });

  it('subtracts parent offset from absolute position', () => {
    const result = toRelativePosition({ x: 150, y: 300 }, { x: 50, y: 100 });
    expect(result).toEqual({ x: 100, y: 200 });
  });

  it('produces negative coordinates when node is to the left/above parent', () => {
    const result = toRelativePosition({ x: 10, y: 20 }, { x: 50, y: 100 });
    expect(result).toEqual({ x: -40, y: -80 });
  });
});

describe('toAbsolutePosition', () => {
  it('returns unchanged position when parent is at origin', () => {
    const result = toAbsolutePosition({ x: 100, y: 200 }, { x: 0, y: 0 });
    expect(result).toEqual({ x: 100, y: 200 });
  });

  it('adds parent offset to relative position', () => {
    const result = toAbsolutePosition({ x: 100, y: 200 }, { x: 50, y: 100 });
    expect(result).toEqual({ x: 150, y: 300 });
  });
});

describe('round-trip', () => {
  it('toRelative → toAbsolute restores the original position', () => {
    const abs = { x: 375, y: 120 };
    const parent = { x: 80, y: 40 };
    const rel = toRelativePosition(abs, parent);
    const restored = toAbsolutePosition(rel, parent);
    expect(restored).toEqual(abs);
  });

  it('toAbsolute → toRelative restores the original relative position', () => {
    const rel = { x: 30, y: 70 };
    const parent = { x: 120, y: 60 };
    const abs = toAbsolutePosition(rel, parent);
    const restored = toRelativePosition(abs, parent);
    expect(restored).toEqual(rel);
  });
});
