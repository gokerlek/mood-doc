import { describe, it, expect } from 'vitest';
import { reorderWithIndex } from '@/lib/section-utils';

type Item = { id: string; order: number };

const items: Item[] = [
  { id: 'a', order: 0 },
  { id: 'b', order: 1 },
  { id: 'c', order: 2 },
];

describe('reorderWithIndex', () => {
  it('moves last item to first and reassigns order 0..n-1', () => {
    const result = reorderWithIndex(items, 2, 0);
    expect(result.map(i => i.id)).toEqual(['c', 'a', 'b']);
    expect(result.map(i => i.order)).toEqual([0, 1, 2]);
  });

  it('moves first item to last and reassigns order 0..n-1', () => {
    const result = reorderWithIndex(items, 0, 2);
    expect(result.map(i => i.id)).toEqual(['b', 'c', 'a']);
    expect(result.map(i => i.order)).toEqual([0, 1, 2]);
  });

  it('moves middle item one step forward', () => {
    const result = reorderWithIndex(items, 1, 2);
    expect(result.map(i => i.id)).toEqual(['a', 'c', 'b']);
    expect(result.map(i => i.order)).toEqual([0, 1, 2]);
  });

  it('returns same array reference when fromIndex === toIndex', () => {
    const result = reorderWithIndex(items, 1, 1);
    expect(result).toBe(items);
  });

  it('preserves other properties on items', () => {
    type Rich = { id: string; order: number; label: string };
    const rich: Rich[] = [
      { id: 'x', order: 0, label: 'X' },
      { id: 'y', order: 1, label: 'Y' },
    ];
    const result = reorderWithIndex(rich, 0, 1);
    expect(result[0]).toMatchObject({ id: 'y', label: 'Y', order: 0 });
    expect(result[1]).toMatchObject({ id: 'x', label: 'X', order: 1 });
  });

  it('handles a single-element array (no-op)', () => {
    const single: Item[] = [{ id: 'a', order: 5 }];
    const result = reorderWithIndex(single, 0, 0);
    expect(result).toBe(single);
  });
});
