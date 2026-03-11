import { describe, it, expect, vi } from 'vitest';

vi.mock('@xyflow/react', () => ({
  MarkerType: { ArrowClosed: 'arrowclosed' },
}));
vi.mock('@/components/map/AppNode', () => ({}));
vi.mock('@/components/map/GroupNode', () => ({}));
vi.mock('@/components/map/FloatingEdge', () => ({}));

import { storeNodeToFlow, storeNodesToFlow, storeEdgeToFlow } from '@/lib/map/flowBuilders';
import type { MapNodeData, MapEdgeData } from '@/lib/types';

const cbs = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onResize: vi.fn(),
  onAutoArrange: vi.fn(),
};

const edgeCbs = { onDelete: vi.fn() };

describe('storeNodeToFlow', () => {
  it('converts a regular node to appNode type', () => {
    const node: MapNodeData = { id: 'n1', label: 'Home', color: '#fff', x: 10, y: 20 };
    const result = storeNodeToFlow(node, cbs);
    expect(result.id).toBe('n1');
    expect(result.type).toBe('appNode');
    expect(result.position).toEqual({ x: 10, y: 20 });
    expect(result.data.label).toBe('Home');
  });

  it('converts a group node to groupNode type with style', () => {
    const node: MapNodeData = { id: 'g1', label: 'Group', color: '#eee', x: 0, y: 0, node_type: 'group', width: 400, height: 250 };
    const result = storeNodeToFlow(node, cbs);
    expect(result.type).toBe('groupNode');
    expect(result.style).toEqual({ width: 400, height: 250 });
    expect((result as { zIndex?: number }).zIndex).toBe(-1);
  });

  it('uses default width/height for group node when not provided', () => {
    const node: MapNodeData = { id: 'g2', label: 'G', color: '#000', x: 0, y: 0, node_type: 'group' };
    const result = storeNodeToFlow(node, cbs);
    expect(result.style).toEqual({ width: 320, height: 200 });
  });

  it('includes parentId when parent_id is set', () => {
    const node: MapNodeData = { id: 'child', label: 'Child', color: '#fff', x: 5, y: 5, parent_id: 'g1' };
    const result = storeNodeToFlow(node, cbs);
    expect((result as { parentId?: string }).parentId).toBe('g1');
  });

  it('does not include parentId when parent_id is absent', () => {
    const node: MapNodeData = { id: 'n2', label: 'Top', color: '#fff', x: 0, y: 0 };
    const result = storeNodeToFlow(node, cbs);
    expect((result as { parentId?: string }).parentId).toBeUndefined();
  });

  it('attaches onEdit and onDelete callbacks to data', () => {
    const node: MapNodeData = { id: 'n3', label: 'X', color: '#fff', x: 0, y: 0 };
    const result = storeNodeToFlow(node, cbs);
    expect(result.data.onEdit).toBe(cbs.onEdit);
    expect(result.data.onDelete).toBe(cbs.onDelete);
  });

  it('attaches onResize and onAutoArrange to group node data', () => {
    const node: MapNodeData = { id: 'g3', label: 'G', color: '#fff', x: 0, y: 0, node_type: 'group' };
    const result = storeNodeToFlow(node, cbs);
    expect((result.data as { onResize?: unknown }).onResize).toBe(cbs.onResize);
    expect((result.data as { onAutoArrange?: unknown }).onAutoArrange).toBe(cbs.onAutoArrange);
  });
});

describe('storeNodesToFlow', () => {
  it('maps an array of nodes', () => {
    const nodes: MapNodeData[] = [
      { id: 'a', label: 'A', color: '#fff', x: 0, y: 0 },
      { id: 'b', label: 'B', color: '#fff', x: 10, y: 10, node_type: 'group' },
    ];
    const result = storeNodesToFlow(nodes, cbs);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('a');
    expect(result[1]!.id).toBe('b');
    expect(result[0]!.type).toBe('appNode');
    expect(result[1]!.type).toBe('groupNode');
  });

  it('returns empty array for empty input', () => {
    expect(storeNodesToFlow([], cbs)).toEqual([]);
  });
});

describe('storeEdgeToFlow', () => {
  it('converts edge to floatingEdge type', () => {
    const edge: MapEdgeData = { id: 'e1', source: 's1', target: 't1' };
    const result = storeEdgeToFlow(edge, edgeCbs);
    expect(result.id).toBe('e1');
    expect(result.source).toBe('s1');
    expect(result.target).toBe('t1');
    expect(result.type).toBe('floatingEdge');
  });

  it('includes ArrowClosed marker', () => {
    const edge: MapEdgeData = { id: 'e2', source: 's2', target: 't2' };
    const result = storeEdgeToFlow(edge, edgeCbs);
    expect(result.markerEnd).toEqual({ type: 'arrowclosed' });
  });

  it('includes sourceHandle when set', () => {
    const edge: MapEdgeData = { id: 'e3', source: 's3', target: 't3', sourceHandle: 'left' };
    const result = storeEdgeToFlow(edge, edgeCbs);
    expect(result.sourceHandle).toBe('left');
  });

  it('omits sourceHandle when not set', () => {
    const edge: MapEdgeData = { id: 'e4', source: 's4', target: 't4' };
    const result = storeEdgeToFlow(edge, edgeCbs);
    expect(result.sourceHandle).toBeUndefined();
  });

  it('includes targetHandle when set', () => {
    const edge: MapEdgeData = { id: 'e5', source: 's5', target: 't5', targetHandle: 'right' };
    const result = storeEdgeToFlow(edge, edgeCbs);
    expect(result.targetHandle).toBe('right');
  });

  it('attaches onDelete callback to edge data', () => {
    const edge: MapEdgeData = { id: 'e6', source: 's6', target: 't6' };
    const result = storeEdgeToFlow(edge, edgeCbs);
    expect((result.data as { onDelete?: unknown }).onDelete).toBe(edgeCbs.onDelete);
  });
});
