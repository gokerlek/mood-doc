'use client';

import { useCallback } from 'react';
import { useReactFlow, type Node, type OnNodeDrag } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useKbStore } from '@/stores/kbStore';

interface Options {
  setNodes: Dispatch<SetStateAction<Node[]>>;
}

/**
 * Node sürüklenince grup içine girme / gruptan çıkma ve pozisyon güncelleme.
 * Gruplar diğer gruplara yuvalanmaz.
 */
export function useDragHandler({ setNodes }: Options): { onNodeDragStop: OnNodeDrag } {
  const { getIntersectingNodes, getNode } = useReactFlow();
  const upsertNode = useKbStore.useUpsertNode();
  const kbData = useKbStore.useData();

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      const storeNodes = kbData?.map?.nodes ?? [];
      const existing = storeNodes.find((n) => n.id === node.id);

      if (node.type === 'groupNode') {
        if (existing) {
          upsertNode({ ...existing, x: node.position.x, y: node.position.y });
        }
        return;
      }

      const groups = getIntersectingNodes(node).filter((n) => n.type === 'groupNode');
      const newParentId = groups[0]?.id ?? null;
      const currentParentId = node.parentId ?? null;

      if (newParentId && newParentId !== currentParentId) {
        const group = groups[0]!;
        const relX = node.position.x - group.position.x;
        const relY = node.position.y - group.position.y;
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id ? { ...n, parentId: newParentId, position: { x: relX, y: relY } } : n,
          ),
        );
        if (existing) {
          upsertNode({ ...existing, x: relX, y: relY, parent_id: newParentId });
        }
      } else if (!newParentId && currentParentId) {
        const parent = getNode(currentParentId);
        const absX = (parent?.position.x ?? 0) + node.position.x;
        const absY = (parent?.position.y ?? 0) + node.position.y;
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id ? { ...n, parentId: undefined, position: { x: absX, y: absY } } : n,
          ),
        );
        if (existing) {
          upsertNode({ ...existing, x: absX, y: absY, parent_id: null });
        }
      } else {
        if (existing) {
          upsertNode({ ...existing, x: node.position.x, y: node.position.y });
        }
      }
    },
    [getIntersectingNodes, getNode, upsertNode, kbData, setNodes],
  );

  return { onNodeDragStop };
}
