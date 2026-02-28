import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { MapNodeData, MapEdgeData } from "@/lib/types";

export type { MapNodeData, MapEdgeData };

/* ------------------------------------------------------------------ */
/*  Typed selector-hooks helper (replaces auto-zustand-selectors-hook) */
/* ------------------------------------------------------------------ */
type CapitalizeKey<S extends string> = S extends `${infer F}${infer R}`
  ? `use${Uppercase<F>}${R}`
  : never;
type ZustandHookSelectors<StateType> = {
  [Key in keyof StateType as CapitalizeKey<string & Key>]: () => StateType[Key];
};

function createSelectorHooks<T extends object>(
  store: UseBoundStore<StoreApi<T>>,
): UseBoundStore<StoreApi<T>> & ZustandHookSelectors<T> {
  const storeAny = store as unknown as Record<string, unknown>;
  const state = store.getState();
  for (const key of Object.keys(state as Record<string, unknown>)) {
    const hookName = `use${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    storeAny[hookName] = () => store((s) => s[key as keyof T]);
  }
  return store as UseBoundStore<StoreApi<T>> & ZustandHookSelectors<T>;
}

const RANDOM_NAMES = [
  "Engagement",
  "Settings",
  "Onboarding",
  "Reports",
  "Exit",
  "New Survey",
  "People",
  "Feedback",
  "Surveys",
  "Comments",
];

interface MapState {
  nodes: MapNodeData[];
  edges: MapEdgeData[];
  loadMapData: (nodes: MapNodeData[], edges: MapEdgeData[]) => void;
  addNode: (x: number, y: number) => MapNodeData;
  addGroup: (x: number, y: number) => MapNodeData;
  updateNode: (
    id: string,
    patch: Partial<Pick<MapNodeData, "label" | "description" | "color">>,
  ) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  resizeNode: (id: string, width: number, height: number) => void;
  setNodeParent: (
    id: string,
    parentId: string | null,
    x: number,
    y: number,
  ) => void;
  addEdge: (source: string, target: string) => void;
  deleteEdge: (id: string) => void;
}

const useMapStoreBase = create<MapState>()((set, get) => ({
  nodes: [],
  edges: [],

  loadMapData: (nodes, edges) => set({ nodes, edges }),

  addNode: (x, y) => {
    const name =
      RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] ?? "Node";
    const node: MapNodeData = {
      id: `node-${Date.now()}`,
      label: name,
      x,
      y,
    };
    set((s) => ({ nodes: [...s.nodes, node] }));
    return node;
  },

  updateNode: (id, patch) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  },

  addGroup: (x, y) => {
    const group: MapNodeData = {
      id: `group-${Date.now()}`,
      label: "Group",
      x,
      y,
      nodeType: "group",
      width: 320,
      height: 200,
    };
    set((s) => ({ nodes: [...s.nodes, group] }));
    return group;
  },

  deleteNode: (id) => {
    set((s) => {
      const childIds = s.nodes
        .filter((n) => n.parentId === id)
        .map((n) => n.id);
      const toDelete = new Set([id, ...childIds]);
      return {
        nodes: s.nodes.filter((n) => !toDelete.has(n.id)),
        edges: s.edges.filter(
          (e) => !toDelete.has(e.source) && !toDelete.has(e.target),
        ),
      };
    });
  },

  moveNode: (id, x, y) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  },

  resizeNode: (id, width, height) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, width, height } : n)),
    }));
  },

  setNodeParent: (id, parentId, x, y) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, parentId: parentId ?? undefined, x, y } : n,
      ),
    }));
  },

  addEdge: (source, target) => {
    const edgeId = `${source}->${target}`;
    const exists = get().edges.some((e) => e.id === edgeId);
    if (exists) return;
    const edge: MapEdgeData = { id: edgeId, source, target };
    set((s) => ({ edges: [...s.edges, edge] }));
  },

  deleteEdge: (id) => {
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }));
  },
}));

export const useMapStore = createSelectorHooks(useMapStoreBase);

/** Properly typed base store – use when you need raw zustand selectors */
export { useMapStoreBase };
