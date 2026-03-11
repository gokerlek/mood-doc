import { useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import type { MapNodeData } from '@/lib/types';

export function getLeafNodes(nodes: MapNodeData[]): MapNodeData[] {
  const parentIds = new Set(
    nodes.map(n => n.parent_id).filter((id): id is string => id != null)
  );
  return nodes.filter(n => !parentIds.has(n.id));
}

export function useLeafNodes(): MapNodeData[] {
  const data = useKbStore.useData();
  return useMemo(() => {
    if (!data) return [];
    return getLeafNodes(data.map.nodes);
  }, [data]);
}
