'use client';

import { useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useMapStore } from '@/stores/mapStore';

interface Options {
  setNodes: Dispatch<SetStateAction<Node[]>>;
}

const PADDING = 20;
const GAP = 20;
const LABEL_HEIGHT = 36;

export function useAutoArrange({ setNodes }: Options): { handleAutoArrange: (groupId: string) => void } {
  const { getNodes, getNode } = useReactFlow();
  const moveNode = useMapStore.useMoveNode();
  const resizeNode = useMapStore.useResizeNode();

  const handleAutoArrange = useCallback(
    (groupId: string) => {
      const childNodes = getNodes()
        .filter((n) => n.parentId === groupId)
        .sort((a, b) => a.position.y - b.position.y);

      if (childNodes.length === 0) return;

      let accY = LABEL_HEIGHT + PADDING;
      const updates: { id: string; x: number; y: number }[] = [];

      for (const child of childNodes) {
        const domEl = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${child.id}"]`,
        );
        const h = domEl?.offsetHeight ?? getNode(child.id)?.measured?.height ?? 60;
        updates.push({ id: child.id, x: PADDING, y: accY });
        accY += h + GAP;
      }

      const totalHeight = accY - GAP + PADDING;
      const newWidth = PADDING + 192 + PADDING;

      setNodes((ns) =>
        ns.map((n) => {
          const upd = updates.find((u) => u.id === n.id);
          return upd ? { ...n, position: { x: upd.x, y: upd.y } } : n;
        }),
      );
      updates.forEach((u) => moveNode(u.id, u.x, u.y));

      resizeNode(groupId, newWidth, totalHeight);
      setNodes((ns) =>
        ns.map((n) =>
          n.id === groupId
            ? { ...n, style: { ...n.style, width: newWidth, height: totalHeight } }
            : n,
        ),
      );
    },
    [getNodes, getNode, setNodes, moveNode, resizeNode],
  );

  return { handleAutoArrange };
}
