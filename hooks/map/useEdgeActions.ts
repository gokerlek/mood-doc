'use client';

import { useCallback } from 'react';
import {
  addEdge,
  type Edge,
  type OnConnect,
  type EdgeMouseHandler,
} from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { storeEdgeToFlow } from '@/lib/map/flowBuilders';

interface Options {
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}

export interface EdgeActions {
  handleDeleteEdge: (id: string) => void;
  onConnect: OnConnect;
  onEdgeDoubleClick: EdgeMouseHandler;
}

export function useEdgeActions({ setEdges }: Options): EdgeActions {
  const storeAddEdge = useMapStore.useAddEdge();
  const storeDeleteEdge = useMapStore.useDeleteEdge();

  const handleDeleteEdge = useCallback(
    (id: string) => {
      storeDeleteEdge(id);
      setEdges((es) => es.filter((e) => e.id !== id));
    },
    [storeDeleteEdge, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      storeAddEdge(params.source, params.target);
      const edgeId = `${params.source}->${params.target}`;
      setEdges((es) => {
        if (es.some((e) => e.id === edgeId)) return es;
        return addEdge(
          { ...storeEdgeToFlow({ id: edgeId, source: params.source, target: params.target }, { onDelete: handleDeleteEdge }), ...params },
          es,
        );
      });
    },
    [storeAddEdge, setEdges, handleDeleteEdge],
  );

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (_, edge) => handleDeleteEdge(edge.id),
    [handleDeleteEdge],
  );

  return { handleDeleteEdge, onConnect, onEdgeDoubleClick };
}
