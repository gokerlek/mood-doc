import { create } from 'zustand';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import type { MapNodeData, MapEdgeData } from '@/lib/types';

export type { MapNodeData, MapEdgeData };

const RANDOM_NAMES = [
  'Dashboard', 'Settings', 'Profile', 'Reports', 'Analytics',
  'Messages', 'Calendar', 'Users', 'Orders', 'Notifications',
  'Login', 'Register', 'Checkout', 'Cart', 'Admin',
  'Support', 'Search', 'Upload', 'Export', 'Preview',
];

interface MapState {
  nodes: MapNodeData[];
  edges: MapEdgeData[];
  loadMapData: (nodes: MapNodeData[], edges: MapEdgeData[]) => void;
  addNode: (x: number, y: number) => MapNodeData;
  addGroup: (x: number, y: number) => MapNodeData;
  updateNode: (id: string, patch: Partial<Pick<MapNodeData, 'label' | 'description' | 'color'>>) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  resizeNode: (id: string, width: number, height: number) => void;
  setNodeParent: (id: string, parentId: string | null, x: number, y: number) => void;
  addEdge: (source: string, target: string) => void;
  deleteEdge: (id: string) => void;
}

const useMapStoreBase = create<MapState>()((set, get) => ({
      nodes: [],
      edges: [],

      loadMapData: (nodes, edges) => set({ nodes, edges }),

      addNode: (x, y) => {
        const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] ?? 'Node';
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
          label: 'Group',
          x,
          y,
          nodeType: 'group',
          width: 320,
          height: 200,
        };
        set((s) => ({ nodes: [...s.nodes, group] }));
        return group;
      },

      deleteNode: (id) => {
        set((s) => {
          const childIds = s.nodes.filter((n) => n.parentId === id).map((n) => n.id);
          const toDelete = new Set([id, ...childIds]);
          return {
            nodes: s.nodes.filter((n) => !toDelete.has(n.id)),
            edges: s.edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target)),
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
            n.id === id
              ? { ...n, parentId: parentId ?? undefined, x, y }
              : n
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
