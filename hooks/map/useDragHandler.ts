'use client';

import { useCallback } from 'react';
import { useReactFlow, type Node, type OnNodeDrag } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { toRelativePosition, toAbsolutePosition } from '@/lib/flow-utils';

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
        const rel = toRelativePosition(node.position, group.position);
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id ? { ...n, parentId: newParentId, position: rel } : n,
          ),
        );
        if (existing) {
          upsertNode({ ...existing, x: rel.x, y: rel.y, parent_id: newParentId });
        }
      } else if (!newParentId && currentParentId) {
        const parent = getNode(currentParentId);
        const abs = toAbsolutePosition(node.position, parent?.position ?? { x: 0, y: 0 });
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id ? { ...n, parentId: undefined, position: abs } : n,
          ),
        );
        if (existing) {
          upsertNode({ ...existing, x: abs.x, y: abs.y, parent_id: null });
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
