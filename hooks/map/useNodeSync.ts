"use client";

import { useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import { useMapStore, type MapNodeData } from "@/stores/mapStore";
import type { AppNodeData } from "@/components/map/AppNode";
import type { GroupNodeData } from "@/components/map/GroupNode";

interface Options {
  setNodes: Dispatch<SetStateAction<Node[]>>;
  hydrated: MutableRefObject<boolean>;
  onAutoArrange: (id: string) => void;
}

/**
 * Store → RF senkronizasyonu: label/description/color değiştiğinde
 * React Flow node data'sını store ile hizalar.
 */
export function useNodeSync({
  setNodes,
  hydrated,
  onAutoArrange,
}: Options): MapNodeData[] {
  const storeNodes = useMapStore.useNodes();

  useEffect(() => {
    if (!hydrated.current) return;
    setNodes((prev) =>
      prev.map((n) => {
        const s: MapNodeData | undefined = storeNodes.find(
          (sn) => sn.id === n.id,
        );
        if (!s) return n;
        if (n.type === "groupNode") {
          const data = n.data as GroupNodeData;
          return {
            ...n,
            data: {
              ...data,
              label: s.label,
              description: s.description,
              color: s.color,
              onAutoArrange,
            },
          };
        }
        const data = n.data as AppNodeData;
        return {
          ...n,
          data: {
            ...data,
            label: s.label,
            description: s.description,
            color: s.color,
          },
        };
      }),
    );
  }, [storeNodes, setNodes, onAutoArrange, hydrated]);

  return storeNodes;
}
