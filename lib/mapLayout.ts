import Dagre from '@dagrejs/dagre';
import type { KbPage } from '@/lib/types';

export const NODE_WIDTH = 224;
export const NODE_HEIGHT = 96;

const CLUSTER_HEADER_H = 36;
const CLUSTER_PAD_X = 100;
const CLUSTER_PAD_Y = 120;
const CLUSTERS_PER_ROW = 3;

export function autoPosition(index: number): { x: number; y: number } {
  const cols = 5;
  return { x: 60 + (index % cols) * 260, y: 60 + Math.floor(index / cols) * 180 };
}

/**
 * Lay out pages grouped by module. Each module's pages get their own internal
 * Dagre sub-layout (only intra-module connections counted), then the clusters
 * are arranged in a grid on the canvas.
 */
export function getGroupedLayout(
  pages: KbPage[],
  modules: { id: string }[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const groups: KbPage[][] = [];
  modules.forEach(m => {
    const mPages = pages.filter(p => p.module_id === m.id);
    if (mPages.length > 0) groups.push(mPages);
  });
  const ungrouped = pages.filter(
    p => !p.module_id || !modules.find(m => m.id === p.module_id),
  );
  if (ungrouped.length > 0) groups.push(ungrouped);
  if (groups.length === 0) return positions;

  const clusterLayouts = groups.map(groupPages => {
    const pageIds = new Set(groupPages.map(p => p.id));
    const g = new Dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 60, marginx: 20, marginy: 20 });
    groupPages.forEach(p => g.setNode(p.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    groupPages.forEach(p =>
      (p.connections ?? []).filter(id => pageIds.has(id)).forEach(toId => g.setEdge(p.id, toId)),
    );
    Dagre.layout(g);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const raw = new Map<string, { x: number; y: number }>();
    groupPages.forEach(p => {
      const node = g.node(p.id);
      const x = node.x - NODE_WIDTH / 2;
      const y = node.y - NODE_HEIGHT / 2;
      raw.set(p.id, { x, y });
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + NODE_WIDTH); maxY = Math.max(maxY, y + NODE_HEIGHT);
    });

    const localPos = new Map<string, { x: number; y: number }>();
    groupPages.forEach(p => {
      const r = raw.get(p.id)!;
      localPos.set(p.id, { x: r.x - minX, y: r.y - minY + CLUSTER_HEADER_H });
    });

    return { localPos, w: maxX - minX, h: maxY - minY + CLUSTER_HEADER_H };
  });

  let curX = 0, curY = 0, col = 0, rowMaxH = 0;
  groups.forEach((groupPages, gi) => {
    if (col > 0 && col % CLUSTERS_PER_ROW === 0) {
      curX = 0; curY += rowMaxH + CLUSTER_PAD_Y; rowMaxH = 0; col = 0;
    }
    const cluster = clusterLayouts[gi];
    if (!cluster) return;
    const { localPos, w, h } = cluster;
    groupPages.forEach(p => {
      const lp = localPos.get(p.id)!;
      positions.set(p.id, { x: curX + lp.x, y: curY + lp.y });
    });
    rowMaxH = Math.max(rowMaxH, h);
    curX += w + CLUSTER_PAD_X;
    col++;
  });

  return positions;
}
