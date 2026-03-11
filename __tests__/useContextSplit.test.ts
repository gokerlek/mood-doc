import { describe, it, expect } from 'vitest';
import type { KbItemContext } from '@/lib/types';
import { contextSplit } from '@/hooks/useContextSplit';

const item = (type: KbItemContext['type'], id: string) => ({ id, type });

describe('contextSplit', () => {
  it('separates items into three buckets', () => {
    const items = [
      item('global', 'g1'),
      item('page', 'p1'),
      item('component', 'c1'),
      item('global', 'g2'),
    ];
    const result = contextSplit(items, i => i.type);
    expect(result.global.map(i => i.id)).toEqual(['g1', 'g2']);
    expect(result.page.map(i => i.id)).toEqual(['p1']);
    expect(result.component.map(i => i.id)).toEqual(['c1']);
  });

  it('returns empty buckets when no items match', () => {
    const items = [item('global', 'g1')];
    const result = contextSplit(items, i => i.type);
    expect(result.page).toEqual([]);
    expect(result.component).toEqual([]);
  });

  it('handles empty input', () => {
    const result = contextSplit([], () => 'global');
    expect(result.global).toEqual([]);
    expect(result.page).toEqual([]);
    expect(result.component).toEqual([]);
  });
});
