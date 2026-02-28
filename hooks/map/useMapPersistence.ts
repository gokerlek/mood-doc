'use client';

import { useEffect, useRef } from 'react';
import { useKbStore } from '@/stores/kbStore';
import type { MapNodeData, MapEdgeData } from '@/lib/types';

interface Options {
  onLoad: (nodes: MapNodeData[], edges: MapEdgeData[]) => void;
}

/**
 * kbStore'dan harita verisini yükler ve RF state'ini kurar.
 * Kaydetme kbStore'un kendi dirty flag mekanizmasıyla yönetilir.
 */
export function useMapPersistence({ onLoad }: Options): React.MutableRefObject<boolean> {
  const kbData = useKbStore.useData();

  const hydrated = useRef(false);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useEffect(() => {
    if (hydrated.current) return;
    if (kbData === null) return;

    hydrated.current = true;
    const nodes = kbData.map?.nodes ?? [];
    const edges = kbData.map?.edges ?? [];
    onLoadRef.current(nodes, edges);
  }, [kbData]);

  return hydrated;
}
