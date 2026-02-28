'use client';

import { useCallback } from 'react';
import { useReactFlow, type Node, type OnNodeDrag } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useMapStore } from '@/stores/mapStore';

interface Options {
  setNodes: Dispatch<SetStateAction<Node[]>>;
}

/**
 * Node sürüklenince grup içine girme / gruptan çıkma ve pozisyon güncelleme.
 * Gruplar diğer gruplara yuvalanmaz.
 */
export function useDragHandler({ setNodes }: Options): { onNodeDragStop: OnNodeDrag } {
  const { getIntersectingNodes, getNode } = useReactFlow();
  const moveNode = useMapStore.useMoveNode();
  const setNodeParent = useMapStore.useSetNodeParent();

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      if (node.type === 'groupNode') {
        moveNode(node.id, node.position.x, node.position.y);
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
        setNodeParent(node.id, newParentId, relX, relY);
      } else if (!newParentId && currentParentId) {
        const parent = getNode(currentParentId);
        const absX = (parent?.position.x ?? 0) + node.position.x;
        const absY = (parent?.position.y ?? 0) + node.position.y;
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id ? { ...n, parentId: undefined, position: { x: absX, y: absY } } : n,
          ),
        );
        setNodeParent(node.id, null, absX, absY);
      } else {
        moveNode(node.id, node.position.x, node.position.y);
      }
    },
    [getIntersectingNodes, getNode, moveNode, setNodes, setNodeParent],
  );

  return { onNodeDragStop };
}
