'use client';

import { useState, useCallback } from 'react';
import type { Node, Edge, OnBeforeDelete } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useMapStore } from '@/stores/mapStore';

interface Options {
  nodes: Node[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}

export interface DeleteFlow {
  pendingDeleteId: string | null;
  requestDeleteNode: (id: string) => void;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  onBeforeDelete: OnBeforeDelete;
}

/**
 * Delete tuşu / toolbar silme butonunu yakalar, onay modalı gösterir,
 * onaylanan silmeyi store + RF state'e uygular.
 */
export function useDeleteFlow({ nodes, setNodes, setEdges }: Options): DeleteFlow {
  const deleteNode = useMapStore.useDeleteNode();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDeleteNode = useCallback((id: string) => setPendingDeleteId(id), []);

  const execDeleteNode = useCallback(
    (id: string) => {
      const childIds = new Set(nodes.filter((n) => n.parentId === id).map((n) => n.id));
      deleteNode(id);
      setNodes((ns) => ns.filter((n) => n.id !== id && !childIds.has(n.id)));
      setEdges((es) =>
        es.filter(
          (e) =>
            e.source !== id &&
            e.target !== id &&
            !childIds.has(e.source) &&
            !childIds.has(e.target),
        ),
      );
    },
    [deleteNode, nodes, setNodes, setEdges],
  );

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId) execDeleteNode(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, execDeleteNode]);

  const handleCancelDelete = useCallback(() => setPendingDeleteId(null), []);

  const onBeforeDelete: OnBeforeDelete = useCallback(async ({ nodes: ns }) => {
    if (ns.length > 0) setPendingDeleteId(ns[0]?.id ?? null);
    return false;
  }, []);

  return { pendingDeleteId, requestDeleteNode, handleConfirmDelete, handleCancelDelete, onBeforeDelete };
}
