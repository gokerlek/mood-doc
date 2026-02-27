'use client';

import { useCallback, useState } from 'react';
import {
  type EdgeProps,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import { useHoveredNode } from './HoveredNodeCtx';

export default function FloatingEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps) {
  const { hoveredId } = useHoveredNode();
  const onDeleteCb = (data as { onDelete?: (id: string) => void } | undefined)?.onDelete;
  const [edgeHovered, setEdgeHovered] = useState(false);

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteCb?.(id);
    },
    [onDeleteCb, id],
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = hoveredId === source || hoveredId === target;
  const showDelete = isActive || edgeHovered;

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeWidth={isActive ? 2 : 1.5}
        stroke={isActive ? 'var(--primary)' : 'var(--border)'}
        markerEnd={markerEnd as string}
        className={isActive ? 'animate-flow' : undefined}
        style={style}
      />
      {/* Wider invisible path for hover detection and double-click */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={12}
        stroke="transparent"
        onMouseEnter={() => setEdgeHovered(true)}
        onMouseLeave={() => setEdgeHovered(false)}
        onDoubleClick={onDelete}
        className="cursor-pointer"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            opacity: showDelete ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setEdgeHovered(true)}
          onMouseLeave={() => setEdgeHovered(false)}
        >
          <button
            onClick={onDelete}
            className="w-4 h-4 rounded-full bg-background border border-border text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive flex items-center justify-center text-[9px] font-bold shadow-sm transition-colors"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
