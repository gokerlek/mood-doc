'use client';

import { useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { emptyPageData } from '@/lib/defaults';
import type { MapNodeData } from '@/lib/types';
import type { NodeCallbacks } from '@/lib/map/flowBuilders';
import type { AppNodeData } from '@/components/map/AppNode';
import type { GroupNodeData } from '@/components/map/GroupNode';

interface Options {
  setNodes: Dispatch<SetStateAction<Node[]>>;
  callbacks: NodeCallbacks;
}

export function useNodeCreation({ setNodes, callbacks }: Options) {
  const { getViewport } = useReactFlow();
  const upsertNode = useKbStore.useUpsertNode();

  const handleAddNode = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const nodeX = (-x + window.innerWidth / 2) / zoom - 96;
    const nodeY = (-y + window.innerHeight / 2) / zoom - 30;

    const newNode: MapNodeData = {
      id: crypto.randomUUID(),
      label: 'New Node',
      x: nodeX,
      y: nodeY,
      page_data: emptyPageData(),
    };

    upsertNode(newNode);

    setNodes((ns) => [
      ...ns,
      {
        id: newNode.id,
        type: 'appNode',
        position: { x: newNode.x, y: newNode.y },
        data: {
          label: newNode.label,
          color: newNode.color,
          onEdit: callbacks.onEdit,
          onDelete: callbacks.onDelete,
        } as AppNodeData,
      },
    ]);
  }, [getViewport, upsertNode, setNodes, callbacks]);

  const handleAddGroup = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const nodeX = (-x + window.innerWidth / 2) / zoom - 160;
    const nodeY = (-y + window.innerHeight / 2) / zoom - 100;

    const newGroup: MapNodeData = {
      id: crypto.randomUUID(),
      label: 'New Group',
      x: nodeX,
      y: nodeY,
      node_type: 'group',
      width: 320,
      height: 200,
    };

    upsertNode(newGroup);

    setNodes((ns) => [
      ...ns,
      {
        id: newGroup.id,
        type: 'groupNode',
        position: { x: newGroup.x, y: newGroup.y },
        style: { width: newGroup.width ?? 320, height: newGroup.height ?? 200 },
        zIndex: -1,
        data: {
          label: newGroup.label,
          color: newGroup.color,
          onEdit: callbacks.onEdit,
          onDelete: callbacks.onDelete,
          onResize: callbacks.onResize,
          onAutoArrange: callbacks.onAutoArrange,
        } as GroupNodeData,
      },
    ]);
  }, [getViewport, upsertNode, setNodes, callbacks]);

  return { handleAddNode, handleAddGroup };
}
