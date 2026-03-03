import { describe, it, expect } from 'vitest';
import { overlaps, clampToZone, getZoneRange } from '@/lib/canvas-utils';
import type { Rect } from '@/lib/canvas-utils';

// ── overlaps ─────────────────────────────────────────────────────────────────

describe('overlaps', () => {
  it('returns true when b is fully inside a', () => {
    const a: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const b: Rect = { x: 10, y: 10, w: 50, h: 50 };
    expect(overlaps(a, b)).toBe(true);
  });

  it('returns true for partial overlap (top-left corner)', () => {
    const a: Rect = { x: 50, y: 50, w: 100, h: 100 };
    const b: Rect = { x: 0, y: 0, w: 100, h: 100 };
    expect(overlaps(a, b)).toBe(true);
  });

  it('returns true when rects share a single pixel column', () => {
    const a: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const b: Rect = { x: 99, y: 0, w: 100, h: 100 };
    expect(overlaps(a, b)).toBe(true);
  });

  it('returns false when rects touch on x edge (no area overlap)', () => {
    const a: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const b: Rect = { x: 100, y: 0, w: 100, h: 100 };
    expect(overlaps(a, b)).toBe(false);
  });

  it('returns false when rects touch on y edge (no area overlap)', () => {
    const a: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const b: Rect = { x: 0, y: 100, w: 100, h: 100 };
    expect(overlaps(a, b)).toBe(false);
  });

  it('returns false when rects are clearly separated', () => {
    const a: Rect = { x: 0, y: 0, w: 50, h: 50 };
    const b: Rect = { x: 200, y: 200, w: 50, h: 50 };
    expect(overlaps(a, b)).toBe(false);
  });

  it('is commutative — overlaps(a,b) === overlaps(b,a)', () => {
    const a: Rect = { x: 0, y: 0, w: 80, h: 80 };
    const b: Rect = { x: 40, y: 40, w: 80, h: 80 };
    expect(overlaps(a, b)).toBe(overlaps(b, a));
  });
});

// ── clampToZone ───────────────────────────────────────────────────────────────

describe('clampToZone', () => {
  it('returns value unchanged when well inside zone', () => {
    expect(clampToZone(50, 20, 200)).toBe(50);
  });

  it('clamps negative value to 0', () => {
    expect(clampToZone(-10, 20, 200)).toBe(0);
  });

  it('clamps so slot right edge stays at zone boundary', () => {
    // slot w=20, zone max=200 → max allowed position = 180
    expect(clampToZone(190, 20, 200)).toBe(180);
  });

  it('clamps to 0 when zone is smaller than slot', () => {
    // max - size = 10 - 50 = negative → clamp to 0
    expect(clampToZone(5, 50, 10)).toBe(0);
  });

  it('rounds fractional values', () => {
    expect(clampToZone(50.6, 20, 200)).toBe(51);
    expect(clampToZone(50.4, 20, 200)).toBe(50);
  });

  it('allows position 0 at the lower boundary', () => {
    expect(clampToZone(0, 20, 200)).toBe(0);
  });

  it('returns exact upper boundary (max - size) without overshooting', () => {
    expect(clampToZone(180, 20, 200)).toBe(180);
    expect(clampToZone(181, 20, 200)).toBe(180);
  });
});

// ── getZoneRange ──────────────────────────────────────────────────────────────

describe('getZoneRange', () => {
  const frameH  = 400;
  const headerH = 60;
  const footerH = 50;

  it('header zone starts at 0 and ends at headerH', () => {
    expect(getZoneRange('header', frameH, headerH, footerH)).toEqual({ min: 0, max: 60 });
  });

  it('footer zone starts at (frameH - footerH) and ends at frameH', () => {
    expect(getZoneRange('footer', frameH, headerH, footerH)).toEqual({ min: 350, max: 400 });
  });

  it('body zone spans between header bottom and footer top', () => {
    expect(getZoneRange('body', frameH, headerH, footerH)).toEqual({ min: 60, max: 350 });
  });

  it('header and body ranges are contiguous', () => {
    const header = getZoneRange('header', frameH, headerH, footerH);
    const body   = getZoneRange('body', frameH, headerH, footerH);
    expect(header.max).toBe(body.min);
  });

  it('body and footer ranges are contiguous', () => {
    const body   = getZoneRange('body', frameH, headerH, footerH);
    const footer = getZoneRange('footer', frameH, headerH, footerH);
    expect(body.max).toBe(footer.min);
  });

  it('all zones together span the full frame height', () => {
    const header = getZoneRange('header', frameH, headerH, footerH);
    const footer = getZoneRange('footer', frameH, headerH, footerH);
    expect(header.min).toBe(0);
    expect(footer.max).toBe(frameH);
  });
});
