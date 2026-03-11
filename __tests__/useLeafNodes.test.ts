import { describe, it, expect } from 'vitest';
import type { MapNodeData } from '@/lib/types';
import { getLeafNodes } from '@/hooks/useLeafNodes';

const baseNode = (id: string, parent_id?: string | null): MapNodeData => ({
  id,
  label: id,
  x: 0,
  y: 0,
  parent_id,
});

describe('getLeafNodes', () => {
  it('returns all nodes when none have children', () => {
    const nodes = [baseNode('a'), baseNode('b')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['a', 'b']);
  });

  it('excludes nodes that are parents', () => {
    const nodes = [baseNode('parent'), baseNode('child', 'parent')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['child']);
  });

  it('handles empty array', () => {
    expect(getLeafNodes([])).toEqual([]);
  });

  it('handles deep chains — only root parent is excluded', () => {
    const nodes = [baseNode('root'), baseNode('mid', 'root'), baseNode('leaf', 'mid')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['leaf']);
  });

  it('treats null parent_id as a leaf node, not a parent reference', () => {
    const nodes = [baseNode('a', null), baseNode('b')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['a', 'b']);
  });
});
