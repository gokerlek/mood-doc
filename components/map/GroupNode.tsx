'use client';

import { memo } from 'react';
import { NodeResizer, NodeToolbar, Position } from '@xyflow/react';
import { IconLayoutList, IconPencil, IconTrash } from '@tabler/icons-react';

export interface GroupNodeData {
  label: string;
  description?: string;
  color?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onAutoArrange: (id: string) => void;
  [key: string]: unknown;
}

interface GroupNodeProps {
  id: string;
  data: GroupNodeData;
  selected?: boolean;
}

function GroupNode({ id, data, selected }: GroupNodeProps) {
  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={120}
        isVisible={selected}
        onResize={(_, { width, height }) => data.onResize(id, width, height)}
      />
      <NodeToolbar isVisible={selected} position={Position.Top} offset={8} className="flex gap-1">
        <button
          onClick={() => data.onEdit(id)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-sm"
        >
          <IconPencil size={11} strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => data.onAutoArrange?.(id)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-sm"
        >
          <IconLayoutList size={11} strokeWidth={2} />
          Arrange
        </button>
        <button
          onClick={() => data.onDelete(id)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors shadow-sm"
        >
          <IconTrash size={11} strokeWidth={2} />
          Delete
        </button>
      </NodeToolbar>

      <div
        className="w-full h-full rounded-xl border-2 border-dashed"
        style={{
          borderColor: data.color ?? 'var(--border)',
          background: `${data.color ?? '#6366f1'}18`,
        }}
      >
        <div className="px-3 py-2">
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: data.color ?? 'var(--muted-foreground)' }}
          >
            {data.label}
          </span>
        </div>
      </div>
    </>
  );
}

export default memo(GroupNode);
