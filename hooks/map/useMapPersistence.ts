'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '@/stores/mapStore';
import type { MapNodeData, MapEdgeData } from '@/lib/types';

interface Options {
  onLoad: (nodes: MapNodeData[], edges: MapEdgeData[]) => void;
}

/**
 * GitHub'dan harita verisini yükler ve store değiştikçe otomatik kaydeder.
 * onLoad: ilk yüklemede çağrılır, RF state'ini kurmak için kullanılır.
 * Döndürülen hydrated ref'i sync effect'lerin erken çalışmasını önler.
 */
export function useMapPersistence({ onLoad }: Options): React.MutableRefObject<boolean> {
  const storeNodes = useMapStore.useNodes();
  const storeEdges = useMapStore.useEdges();

  const hydrated = useRef(false);
  const justLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null!);
  // onLoad'u ref'te tut — effect deps'e eklemeye gerek kalmaz, stale closure riski yok
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  // Bir kez çalışır — GitHub'dan veri çek ve RF'i kur
  useEffect(() => {
    fetch('/api/map')
      .then((r) => r.json())
      .then((data: { nodes: MapNodeData[]; edges: MapEdgeData[] }) => {
        if (hydrated.current) return;
        hydrated.current = true;
        justLoaded.current = true;
        onLoadRef.current(data.nodes ?? [], data.edges ?? []);
      })
      .catch(() => {
        if (!hydrated.current) hydrated.current = true;
      });
  }, []);

  // Store değiştikçe 1.5s debounce ile GitHub'a kaydet
  useEffect(() => {
    if (!hydrated.current) return;
    if (justLoaded.current) {
      justLoaded.current = false;
      return;
    }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: storeNodes, edges: storeEdges }),
      })
        .then((r) => {
          if (!r.ok) void r.text().then((t) => console.error('[map save] HTTP', r.status, t));
        })
        .catch((e) => console.error('[map save] network error', e));
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [storeNodes, storeEdges]);

  return hydrated;
}
