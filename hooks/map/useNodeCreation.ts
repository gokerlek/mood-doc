'use client';

import { useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useMapStore } from '@/stores/mapStore';
import type { NodeCallbacks } from '@/lib/map/flowBuilders';
import type { AppNodeData } from '@/components/map/AppNode';
import type { GroupNodeData } from '@/components/map/GroupNode';

interface Options {
  setNodes: Dispatch<SetStateAction<Node[]>>;
  callbacks: NodeCallbacks;
}

export function useNodeCreation({ setNodes, callbacks }: Options) {
  const { getViewport } = useReactFlow();
  const addNode = useMapStore.useAddNode();
  const addGroup = useMapStore.useAddGroup();

  const handleAddNode = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const stored = addNode(
      (-x + window.innerWidth / 2) / zoom - 96,
      (-y + window.innerHeight / 2) / zoom - 30,
    );
    setNodes((ns) => [
      ...ns,
      {
        id: stored.id,
        type: 'appNode',
        position: { x: stored.x, y: stored.y },
        data: {
          label: stored.label,
          description: stored.description,
          color: stored.color,
          onEdit: callbacks.onEdit,
          onDelete: callbacks.onDelete,
        } as AppNodeData,
      },
    ]);
  }, [getViewport, addNode, setNodes, callbacks]);

  const handleAddGroup = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const stored = addGroup(
      (-x + window.innerWidth / 2) / zoom - 160,
      (-y + window.innerHeight / 2) / zoom - 100,
    );
    setNodes((ns) => [
      ...ns,
      {
        id: stored.id,
        type: 'groupNode',
        position: { x: stored.x, y: stored.y },
        style: { width: stored.width ?? 320, height: stored.height ?? 200 },
        zIndex: -1,
        data: {
          label: stored.label,
          color: stored.color,
          onEdit: callbacks.onEdit,
          onDelete: callbacks.onDelete,
          onResize: callbacks.onResize,
          onAutoArrange: callbacks.onAutoArrange,
        } as GroupNodeData,
      },
    ]);
  }, [getViewport, addGroup, setNodes, callbacks]);

  return { handleAddNode, handleAddGroup };
}
