'use client';

import { useCallback } from 'react';
import {
  addEdge,
  type Edge,
  type OnConnect,
  type EdgeMouseHandler,
} from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { storeEdgeToFlow } from '@/lib/map/flowBuilders';
import type { MapEdgeData } from '@/lib/types';

interface Options {
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}

export interface EdgeActions {
  handleDeleteEdge: (id: string) => void;
  onConnect: OnConnect;
  onEdgeDoubleClick: EdgeMouseHandler;
}

export function useEdgeActions({ setEdges }: Options): EdgeActions {
  const upsertEdge = useKbStore.useUpsertEdge();
  const deleteEdge = useKbStore.useDeleteEdge();

  const handleDeleteEdge = useCallback(
    (id: string) => {
      deleteEdge(id);
      setEdges((es) => es.filter((e) => e.id !== id));
    },
    [deleteEdge, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      const edgeId = `${params.source}->${params.target}`;
      const newEdge: MapEdgeData = {
        id: edgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      };
      upsertEdge(newEdge);
      setEdges((es) => {
        if (es.some((e) => e.id === edgeId)) return es;
        return addEdge(
          { ...storeEdgeToFlow(newEdge, { onDelete: handleDeleteEdge }), ...params },
          es,
        );
      });
    },
    [upsertEdge, setEdges, handleDeleteEdge],
  );

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (_, edge) => handleDeleteEdge(edge.id),
    [handleDeleteEdge],
  );

  return { handleDeleteEdge, onConnect, onEdgeDoubleClick };
}
