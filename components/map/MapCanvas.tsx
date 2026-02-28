'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  MarkerType,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useKbStore } from '@/stores/kbStore';
import { storeNodesToFlow, storeEdgeToFlow } from '@/lib/map/flowBuilders';
import { useMapPersistence } from '@/hooks/map/useMapPersistence';
import { useDeleteFlow } from '@/hooks/map/useDeleteFlow';
import { useEdgeActions } from '@/hooks/map/useEdgeActions';
import { useDragHandler } from '@/hooks/map/useDragHandler';
import { useAutoArrange } from '@/hooks/map/useAutoArrange';
import { useNodeCreation } from '@/hooks/map/useNodeCreation';
import { useNodeSync } from '@/hooks/map/useNodeSync';
import { HoveredNodeCtx } from './HoveredNodeCtx';
import AppNode, { type AppNodeData } from './AppNode';
import GroupNode from './GroupNode';
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
  const upsertNode = useKbStore.useUpsertNode();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onEdit = useCallback((id: string) => setSelectedNodeId(id), []);

  const { pendingDeleteId, requestDeleteNode, handleConfirmDelete, handleCancelDelete, onBeforeDelete } =
    useDeleteFlow({ nodes, setNodes, setEdges });

  const { handleDeleteEdge, onConnect, onEdgeDoubleClick } = useEdgeActions({ setEdges });
  const { onNodeDragStop } = useDragHandler({ setNodes });
  const { handleAutoArrange } = useAutoArrange({ setNodes });

  const handleResizeNode = useCallback(
    (id: string, width: number, height: number) => {
      const kbState = useKbStore.getState();
      const existing = kbState.data?.map?.nodes.find((n) => n.id === id);
      if (existing) upsertNode({ ...existing, width, height });
      setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, style: { ...n.style, width, height } } : n)));
    },
    [upsertNode, setNodes],
  );

  const nodeCbs = useMemo(
    () => ({ onEdit, onDelete: requestDeleteNode, onResize: handleResizeNode, onAutoArrange: handleAutoArrange }),
    [onEdit, requestDeleteNode, handleResizeNode, handleAutoArrange],
  );

  const hydrated = useMapPersistence({
    onLoad: (ns, es) => {
      setNodes(storeNodesToFlow(ns, nodeCbs));
      setEdges(es.map((e) => storeEdgeToFlow(e, { onDelete: handleDeleteEdge })));
    },
  });

  const storeNodes = useNodeSync({ setNodes, hydrated, onAutoArrange: handleAutoArrange });
  const { handleAddNode, handleAddGroup } = useNodeCreation({ setNodes, callbacks: nodeCbs });

  const selectedNode = useMemo(
    () => storeNodes.find((n) => n.id === selectedNodeId) ?? null,
    [storeNodes, selectedNodeId],
  );
  const pendingDeleteLabel = useMemo(
    () => storeNodes.find((n) => n.id === pendingDeleteId)?.label ?? 'bu node',
    [storeNodes, pendingDeleteId],
  );
  const pendingIsGroup = useMemo(
    () => storeNodes.find((n) => n.id === pendingDeleteId)?.node_type === 'group',
    [storeNodes, pendingDeleteId],
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
          key={selectedNodeId ?? 'closed'}
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onSave={(patch) => {
            if (selectedNodeId) {
              const kbState = useKbStore.getState();
              const existing = kbState.data?.map?.nodes.find((n) => n.id === selectedNodeId);
              if (existing) upsertNode({ ...existing, ...patch });
            }
          }}
        />

        <ConfirmModal
          open={!!pendingDeleteId}
          title={`"${pendingDeleteLabel}" silinsin mi?`}
          description={
            pendingIsGroup
              ? "Bu grup ve içindeki tüm node'lar ile bağlı edge'ler kalıcı olarak silinir."
              : "Bu node ve bağlı tüm edge'ler kalıcı olarak silinir."
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
