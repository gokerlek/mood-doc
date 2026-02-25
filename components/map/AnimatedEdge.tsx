'use client';
import { useState, useContext } from 'react';
import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { HoveredNodeCtx } from './HoveredNodeCtx';

export function AnimatedEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [selfHovered, setSelfHovered] = useState(false);
  const { hoveredId } = useContext(HoveredNodeCtx);
  const active = selfHovered || hoveredId === source || hoveredId === target;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g onMouseEnter={() => setSelfHovered(true)} onMouseLeave={() => setSelfHovered(false)}>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: 'pointer' }}
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={active ? 'var(--color-primary)' : 'var(--color-border)'}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={active ? '6 4' : undefined}
        markerEnd={markerEnd}
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            from="20"
            to="0"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </g>
  );
}
