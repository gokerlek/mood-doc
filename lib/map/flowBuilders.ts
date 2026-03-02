import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { MapNodeData, MapEdgeData } from '@/lib/types';
import type { AppNodeData } from '@/components/map/AppNode';
import type { GroupNodeData } from '@/components/map/GroupNode';
import type { FloatingEdgeData } from '@/components/map/FloatingEdge';

export interface NodeCallbacks {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  onAutoArrange: (id: string) => void;
}

export interface EdgeCallbacks {
  onDelete: (id: string) => void;
}

export function storeNodeToFlow(n: MapNodeData, cbs: NodeCallbacks): Node {
  const baseData = {
    label: n.label,
    color: n.color,
    onEdit: cbs.onEdit,
    onDelete: cbs.onDelete,
  };
  const base = {
    id: n.id,
    position: { x: n.x, y: n.y },
    ...(n.parent_id ? { parentId: n.parent_id } : {}),
  };
  if (n.node_type === 'group') {
    return {
      ...base,
      type: 'groupNode',
      style: { width: n.width ?? 320, height: n.height ?? 200 },
      zIndex: -1,
      data: { ...baseData, onResize: cbs.onResize, onAutoArrange: cbs.onAutoArrange } as GroupNodeData,
    } as Node;
  }
  return {
    ...base,
    type: 'appNode',
    data: baseData as AppNodeData,
  } as Node;
}

export function storeNodesToFlow(nodes: MapNodeData[], cbs: NodeCallbacks): Node[] {
  return nodes.map((n) => storeNodeToFlow(n, cbs));
}

export function storeEdgeToFlow(e: MapEdgeData, cbs: EdgeCallbacks): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    ...(e.sourceHandle != null ? { sourceHandle: e.sourceHandle } : {}),
    ...(e.targetHandle != null ? { targetHandle: e.targetHandle } : {}),
    type: 'floatingEdge',
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { onDelete: cbs.onDelete } satisfies FloatingEdgeData,
  };
}
