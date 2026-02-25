'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
  useReactFlow,
  Panel,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useKbStore } from '@/stores/kbStore';
import { useUiStore } from '@/stores/uiStore';
import { useRouter } from 'next/navigation';
import { IconLayoutGrid, IconMaximize } from '@tabler/icons-react';
import type { KbPage } from '@/lib/types';
import { type NodeColor, MODULE_COLOR_NAMES, NODE_COLOR_VAR } from '@/lib/mapColors';
import { Button } from '@/components/ui/button';
import { getGroupedLayout, autoPosition } from '@/lib/mapLayout';
import { HoveredNodeCtx } from './HoveredNodeCtx';
import { AnimatedEdge } from './AnimatedEdge';
import { PageNode } from './PageNode';
import { DetailPanel } from './DetailPanel';

const nodeTypes = { pageNode: PageNode };
const edgeTypes = { animatedEdge: AnimatedEdge };

/**
 * ReactFlow canvas with full node/edge interaction logic.
 * Must be rendered inside a ReactFlowProvider.
 */
export function MapCanvas() {
  const data = useKbStore.useData();
  const updatePagePosition = useKbStore.useUpdatePagePosition();
  const addPageConnection = useKbStore.useAddPageConnection();
  const removePageConnection = useKbStore.useRemovePageConnection();
  const setActiveItemId = useUiStore.useSetActiveItemId();
  const router = useRouter();
  const { fitView } = useReactFlow();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const moduleColorMap = useMemo(() => {
    const map: Record<string, NodeColor> = {};
    (data?.modules ?? []).forEach((m, i) => {
      map[m.id] = MODULE_COLOR_NAMES[i % MODULE_COLOR_NAMES.length] ?? 'none';
    });
    return map;
  }, [data?.modules]);

  const getColor = (moduleId: string): NodeColor => moduleColorMap[moduleId] ?? 'none';

  const initialNodes = useMemo<Node[]>(() => {
    if (!data) return [];
    const needsLayout = data.pages.some(p => p.x === undefined);
    const groupedPositions = needsLayout ? getGroupedLayout(data.pages, data.modules) : null;
    return data.pages.map((p, i) => {
      const pos =
        p.x !== undefined && p.y !== undefined
          ? { x: p.x, y: p.y }
          : (groupedPositions?.get(p.id) ?? autoPosition(i));
      return {
        id: p.id,
        position: pos,
        data: { page: p, color: getColor(p.module_id), selected: false, onSelect: setSelectedId },
        type: 'pageNode',
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.pages.length, data?.modules]);

  const makeEdge = (source: string, target: string): Edge => ({
    id: `${source}->${target}`,
    source,
    target,
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' },
    type: 'animatedEdge',
  });

  const initialEdges = useMemo<Edge[]>(() => {
    if (!data) return [];
    return data.pages.flatMap(p =>
      (p.connections ?? []).map(toId => makeEdge(p.id, toId)),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.pages]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(ns => ns.map(n => ({
      ...n,
      data: { ...n.data, selected: n.id === selectedId },
    })));
  }, [selectedId, setNodes]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updatePagePosition(node.id, node.position.x, node.position.y);
    },
    [updatePagePosition],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;
      const stableId = `${connection.source}->${connection.target}`;
      setEdges(eds => {
        if (eds.some(e => e.id === stableId)) return eds;
        addPageConnection(connection.source, connection.target);
        return addEdge(makeEdge(connection.source, connection.target), eds);
      });
    },
    [addPageConnection, setEdges],
  );

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      removePageConnection(edge.source, edge.target);
      setEdges(eds => eds.filter(e => e.id !== edge.id));
    },
    [removePageConnection, setEdges],
  );

  const handleAutoLayout = useCallback(() => {
    if (!data) return;
    const positions = getGroupedLayout(data.pages, data.modules);
    const updated = nodes.map((n, i) => ({
      ...n,
      position: positions.get(n.id) ?? autoPosition(i),
    }));
    setNodes(updated);
    updated.forEach(n => updatePagePosition(n.id, n.position.x, n.position.y));
    setTimeout(() => { void fitView({ padding: 0.15, duration: 600 }); }, 50);
  }, [data, nodes, setNodes, updatePagePosition, fitView]);

  const handleEdit = useCallback(
    (id: string) => {
      setActiveItemId(id);
      void router.push('/pages');
    },
    [setActiveItemId, router],
  );

  const selectedPage = data?.pages.find(p => p.id === selectedId);
  const selectedColor = selectedPage ? getColor(selectedPage.module_id) : 'none';

  const selectedConnections = useMemo(() => {
    if (!selectedPage || !data) return [];
    return (selectedPage.connections ?? [])
      .map(cId => data.pages.find(p => p.id === cId))
      .filter((p): p is KbPage => p !== undefined)
      .map(p => ({ id: p.id, name: p.name }));
  }, [selectedPage, data]);

  if (!data) return null;

  return (
    <HoveredNodeCtx.Provider value={{ hoveredId, setHoveredId }}>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onEdgeDoubleClick={onEdgeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            deleteKeyCode={null}
            connectionLineType={ConnectionLineType.SmoothStep}
          >
            <Background color="var(--color-border)" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={n => {
                const page = data.pages.find(p => p.id === n.id);
                return page ? NODE_COLOR_VAR[getColor(page.module_id)] : NODE_COLOR_VAR.none;
              }}
              nodeBorderRadius={8}
            />

            <Panel position="top-left" className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { void fitView({ padding: 0.1 }); }}>
                <IconMaximize size={13} />Fit View
              </Button>
              <Button variant="outline" size="sm" onClick={handleAutoLayout}>
                <IconLayoutGrid size={13} />Auto Layout
              </Button>
            </Panel>

            {data.modules.length > 0 && (
              <Panel position="top-right">
                <div className="bg-card border border-border shadow-sm rounded-lg p-2.5 space-y-1 max-w-[180px]">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Modules
                  </p>
                  {data.modules.map((m, i) => {
                    const colorName = MODULE_COLOR_NAMES[i % MODULE_COLOR_NAMES.length] ?? 'none';
                    return (
                      <div key={m.id} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: NODE_COLOR_VAR[colorName] }}
                        />
                        <p className="text-[11px] text-foreground truncate">{m.name}</p>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {selectedPage && (
          <DetailPanel
            page={selectedPage}
            color={selectedColor}
            connections={selectedConnections}
            onClose={() => setSelectedId(null)}
            onEdit={handleEdit}
            onRemoveConnection={toId => {
              removePageConnection(selectedPage.id, toId);
              setEdges(eds =>
                eds.filter(e => !(e.source === selectedPage.id && e.target === toId)),
              );
            }}
          />
        )}
      </div>
    </HoveredNodeCtx.Provider>
  );
}
