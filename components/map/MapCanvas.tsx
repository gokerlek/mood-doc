'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodeDrag,
  type EdgeMouseHandler,
  type OnBeforeDelete,
  useReactFlow,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMapStore, type MapNodeData, type MapEdgeData } from '@/stores/mapStore';
import { HoveredNodeCtx } from './HoveredNodeCtx';
import AppNode, { type AppNodeData } from './AppNode';
import GroupNode, { type GroupNodeData } from './GroupNode';
import FloatingEdge from './FloatingEdge';
import { NodeDrawer } from './NodeDrawer';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Button } from '@/components/ui/button';
import { IconPlus, IconLayoutGrid } from '@tabler/icons-react';

const nodeTypes = { appNode: AppNode, groupNode: GroupNode };
const edgeTypes = { floatingEdge: FloatingEdge };

const defaultEdgeOptions = {
  type: 'floatingEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
} as const;

function MapCanvasInner() {
  const { getViewport, getIntersectingNodes, getNode, getNodes } = useReactFlow();
  const storeNodes = useMapStore.useNodes();
  const storeEdges = useMapStore.useEdges();
  const loadMapData = useMapStore.useLoadMapData();
  const addNode = useMapStore.useAddNode();
  const addGroup = useMapStore.useAddGroup();
  const updateNode = useMapStore.useUpdateNode();
  const deleteNode = useMapStore.useDeleteNode();
  const moveNode = useMapStore.useMoveNode();
  const resizeNode = useMapStore.useResizeNode();
  const setNodeParent = useMapStore.useSetNodeParent();
  const storeAddEdge = useMapStore.useAddEdge();
  const deleteEdge = useMapStore.useDeleteEdge();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const hydrated = useRef(false);
  const justLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null!);

  const onEdit = useCallback((id: string) => setSelectedNodeId(id), []);

  const requestDeleteNode = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleResizeNode = useCallback(
    (id: string, width: number, height: number) => {
      resizeNode(id, width, height);
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, style: { ...(n.style as object), width, height } } : n
        )
      );
    },
    [resizeNode, setNodes]
  );

  const handleAutoArrange = useCallback(
    (groupId: string) => {
      const PADDING = 20;
      const GAP = 20;
      const LABEL_HEIGHT = 36;

      // Mevcut y pozisyonuna göre sırala — kullanıcının manuel yerleştirdiği sırayı koru
      const childNodes = getNodes()
        .filter((n) => n.parentId === groupId)
        .sort((a, b) => a.position.y - b.position.y);

      if (childNodes.length === 0) return;

      let accY = LABEL_HEIGHT + PADDING;
      const updates: { id: string; x: number; y: number }[] = [];

      for (const child of childNodes) {
        // DOM'dan gerçek yüksekliği oku — measured.height stale olabilir
        const domEl = document.querySelector(
          `.react-flow__node[data-id="${child.id}"]`
        ) as HTMLElement | null;
        const h = domEl?.offsetHeight ?? getNode(child.id)?.measured?.height ?? 60;
        updates.push({ id: child.id, x: PADDING, y: accY });
        accY += h + GAP;
      }

      const totalHeight = accY - GAP + PADDING;
      const newWidth = PADDING + 192 + PADDING; // 232

      // Child pozisyonlarını güncelle
      setNodes((ns) =>
        ns.map((n) => {
          const upd = updates.find((u) => u.id === n.id);
          return upd ? { ...n, position: { x: upd.x, y: upd.y } } : n;
        })
      );
      updates.forEach((u) => moveNode(u.id, u.x, u.y));

      // Grup boyutunu ayrı güncelle (handleResizeNode ile aynı pattern — RF için güvenli)
      resizeNode(groupId, newWidth, totalHeight);
      setNodes((ns) =>
        ns.map((n) =>
          n.id === groupId
            ? { ...n, style: { ...(n.style as object), width: newWidth, height: totalHeight } }
            : n
        )
      );
    },
    [getNodes, getNode, setNodes, moveNode, resizeNode]
  );

  // Actually delete a node — called after modal confirmation
  const execDeleteNode = useCallback(
    (id: string) => {
      const childIds = new Set(nodes.filter((n) => n.parentId === id).map((n) => n.id));
      deleteNode(id); // store: cascades children + edges
      setNodes((ns) => ns.filter((n) => n.id !== id && !childIds.has(n.id)));
      setEdges((es) =>
        es.filter(
          (e) =>
            e.source !== id &&
            e.target !== id &&
            !childIds.has(e.source) &&
            !childIds.has(e.target)
        )
      );
    },
    [deleteNode, nodes, setNodes, setEdges]
  );

  // Toolbar "Delete" button — opens modal
  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId) execDeleteNode(pendingDeleteId);
    setPendingDeleteId(null);
  }, [pendingDeleteId, execDeleteNode]);

  // Keyboard Delete key — intercept, show modal instead
  const onBeforeDelete: OnBeforeDelete = useCallback(
    async ({ nodes: ns }) => {
      if (ns.length > 0) setPendingDeleteId(ns[0]?.id ?? null);
      return false; // prevent RF from deleting; we handle it on confirm
    },
    []
  );

  const handleDeleteEdge = useCallback(
    (id: string) => {
      deleteEdge(id);
      setEdges((es) => es.filter((e) => e.id !== id));
    },
    [deleteEdge, setEdges]
  );

  const storeNodesToFlow = useCallback(
    (
      storeN: typeof storeNodes,
      onEditFn: (id: string) => void,
      onDeleteFn: (id: string) => void,
      onResizeFn: (id: string, w: number, h: number) => void,
      onAutoArrangeFn: (id: string) => void
    ): Node[] =>
      storeN.map((n) => {
        const baseData = {
          label: n.label,
          description: n.description,
          color: n.color,
          onEdit: onEditFn,
          onDelete: onDeleteFn,
        };
        const base: Partial<Node> = {
          id: n.id,
          position: { x: n.x, y: n.y },
          ...(n.parentId ? { parentId: n.parentId } : {}),
        };
        if (n.nodeType === 'group') {
          return {
            ...base,
            type: 'groupNode',
            style: { width: n.width ?? 320, height: n.height ?? 200 },
            zIndex: -1,
            data: { ...baseData, onResize: onResizeFn, onAutoArrange: onAutoArrangeFn } as GroupNodeData,
          } as Node;
        }
        return {
          ...base,
          type: 'appNode',
          data: baseData as AppNodeData,
        } as Node;
      }),
    []
  );

  // One-time hydration — GitHub'dan yükle
  useEffect(() => {
    fetch('/api/map')
      .then((r) => r.json())
      .then((data: { nodes: MapNodeData[]; edges: MapEdgeData[] }) => {
        if (hydrated.current) return;
        hydrated.current = true;
        const ns = data.nodes ?? [];
        const es = data.edges ?? [];
        justLoaded.current = true;
        loadMapData(ns, es);
        setNodes(storeNodesToFlow(ns, onEdit, requestDeleteNode, handleResizeNode, handleAutoArrange));
        setEdges(
          es.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: 'floatingEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { onDelete: handleDeleteEdge },
          }))
        );
      })
      .catch(() => {
        if (hydrated.current) return;
        hydrated.current = true; // hata olsa da boş canvas ile devam et
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep node label/description/color in sync after edits; re-attach group callbacks if missing (HMR recovery)
  useEffect(() => {
    if (!hydrated.current) return;
    setNodes((prev) =>
      prev.map((n) => {
        const s = storeNodes.find((sn) => sn.id === n.id);
        if (!s) return n;
        const updatedData = { ...n.data, label: s.label, description: s.description, color: s.color };
        if (n.type === 'groupNode' && typeof (n.data as GroupNodeData).onAutoArrange !== 'function') {
          (updatedData as GroupNodeData).onAutoArrange = handleAutoArrange;
        }
        return { ...n, data: updatedData };
      })
    );
  }, [storeNodes, setNodes, handleAutoArrange]);

  // Auto-save — store değişince GitHub'a kaydet (debounced 1.5s)
  useEffect(() => {
    if (!hydrated.current) return;
    // İlk yüklemede tetiklenen sync'i atla
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
          if (!r.ok) r.text().then((t) => console.error('[map save] HTTP', r.status, t));
        })
        .catch((e) => console.error('[map save] network error', e));
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [storeNodes, storeEdges]);

  const handleAddNode = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const canvasX = (-x + window.innerWidth / 2) / zoom;
    const canvasY = (-y + window.innerHeight / 2) / zoom;
    const stored = addNode(canvasX - 96, canvasY - 30);
    setNodes((ns) => [
      ...ns,
      {
        id: stored.id,
        type: 'appNode',
        position: { x: stored.x, y: stored.y },
        data: {
          label: stored.label,
          description: stored.description,
          color: stored.color,
          onEdit,
          onDelete: requestDeleteNode,
        },
      },
    ]);
  }, [getViewport, addNode, onEdit, requestDeleteNode, setNodes]);

  const handleAddGroup = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const cx = (-x + window.innerWidth / 2) / zoom - 160;
    const cy = (-y + window.innerHeight / 2) / zoom - 100;
    const stored = addGroup(cx, cy);
    setNodes((ns) => [
      ...ns,
      {
        id: stored.id,
        type: 'groupNode',
        position: { x: stored.x, y: stored.y },
        style: { width: stored.width ?? 320, height: stored.height ?? 200 },
        zIndex: -1,
        data: {
          label: stored.label,
          color: stored.color,
          onEdit,
          onDelete: requestDeleteNode,
          onResize: handleResizeNode,
          onAutoArrange: handleAutoArrange,
        } as GroupNodeData,
      },
    ]);
  }, [getViewport, addGroup, onEdit, requestDeleteNode, handleResizeNode, handleAutoArrange, setNodes]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      storeAddEdge(params.source!, params.target!);
      const edgeId = `${params.source}->${params.target}`;
      setEdges((es) => {
        if (es.some((e) => e.id === edgeId)) return es;
        return addEdge(
          {
            ...params,
            id: edgeId,
            type: 'floatingEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { onDelete: handleDeleteEdge },
          },
          es
        );
      });
    },
    [storeAddEdge, setEdges, handleDeleteEdge]
  );

  const onNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      // Groups can't be nested into other groups
      if (node.type === 'groupNode') {
        moveNode(node.id, node.position.x, node.position.y);
        return;
      }

      const groups = getIntersectingNodes(node).filter((n) => n.type === 'groupNode');
      const newParentId = groups[0]?.id ?? null;
      const currentParentId = (node.parentId as string | undefined) ?? null;

      if (newParentId && newParentId !== currentParentId) {
        // Entered a group → relative position
        const group = groups[0]!;
        const relX = node.position.x - group.position.x;
        const relY = node.position.y - group.position.y;
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id
              ? { ...n, parentId: newParentId, position: { x: relX, y: relY } }
              : n
          )
        );
        setNodeParent(node.id, newParentId, relX, relY);
      } else if (!newParentId && currentParentId) {
        // Left a group → absolute position
        const parent = getNode(currentParentId);
        const absX = (parent?.position.x ?? 0) + node.position.x;
        const absY = (parent?.position.y ?? 0) + node.position.y;
        setNodes((ns) =>
          ns.map((n) =>
            n.id === node.id
              ? { ...n, parentId: undefined, position: { x: absX, y: absY } }
              : n
          )
        );
        setNodeParent(node.id, null, absX, absY);
      } else {
        moveNode(node.id, node.position.x, node.position.y);
      }
    },
    [getIntersectingNodes, getNode, moveNode, setNodes, setNodeParent]
  );

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (_, edge) => handleDeleteEdge(edge.id),
    [handleDeleteEdge]
  );

  const selectedNode = useMemo(
    () => storeNodes.find((n) => n.id === selectedNodeId) ?? null,
    [storeNodes, selectedNodeId]
  );

  const pendingDeleteLabel = useMemo(
    () => storeNodes.find((n) => n.id === pendingDeleteId)?.label ?? 'bu node',
    [storeNodes, pendingDeleteId]
  );

  const pendingIsGroup = useMemo(
    () => storeNodes.find((n) => n.id === pendingDeleteId)?.nodeType === 'group',
    [storeNodes, pendingDeleteId]
  );

  const ctxValue = useMemo(() => ({ hoveredId, setHoveredId }), [hoveredId]);

  return (
    <HoveredNodeCtx.Provider value={ctxValue}>
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onBeforeDelete={onBeforeDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          deleteKeyCode="Delete"
          className="bg-muted/20"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
          <Controls />
          <MiniMap
            nodeColor={(n) => (n.data as AppNodeData).color ?? 'var(--muted-foreground)'}
            className="!bg-card !border !border-border"
          />
          <Panel position="top-left" className="flex gap-2">
            <Button size="sm" onClick={handleAddNode} className="shadow-sm gap-1.5">
              <IconPlus size={14} strokeWidth={2} />
              Add Node
            </Button>
            <Button size="sm" variant="outline" onClick={handleAddGroup} className="shadow-sm gap-1.5">
              <IconLayoutGrid size={14} strokeWidth={2} />
              Add Group
            </Button>
          </Panel>
        </ReactFlow>

        <NodeDrawer
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onSave={(patch) => {
            if (selectedNodeId) updateNode(selectedNodeId, patch);
          }}
        />

        <ConfirmModal
          open={!!pendingDeleteId}
          title={`"${pendingDeleteLabel}" silinsin mi?`}
          description={
            pendingIsGroup
              ? 'Bu grup ve içindeki tüm node\'lar ile bağlı edge\'ler kalıcı olarak silinir.'
              : 'Bu node ve bağlı tüm edge\'ler kalıcı olarak silinir.'
          }
          confirmLabel="Sil"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </HoveredNodeCtx.Provider>
  );
}

export function MapCanvas() {
  return <MapCanvasInner />;
}
