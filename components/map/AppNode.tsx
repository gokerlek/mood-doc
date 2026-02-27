'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useHoveredNode } from './HoveredNodeCtx';

export interface AppNodeData {
  label: string;
  description?: string;
  color?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  [key: string]: unknown;
}

interface AppNodeProps {
  id: string;
  data: AppNodeData;
  selected?: boolean;
}

const POSITIONS = [
  { id: 'top',    pos: Position.Top },
  { id: 'right',  pos: Position.Right },
  { id: 'bottom', pos: Position.Bottom },
  { id: 'left',   pos: Position.Left },
];

const HANDLE_STYLE_BASE: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  border: '2px solid var(--background)',
  background: 'var(--primary)',
  transition: 'opacity 0.15s',
};

function AppNode({ id, data, selected }: AppNodeProps) {
  const { setHoveredId } = useHoveredNode();
  const [hovered, setHovered] = useState(false);

  const handleOpacity = hovered || selected ? 1 : 0;

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={8} className="flex gap-1">
        <button
          onClick={() => data.onEdit(id)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-sm"
        >
          <IconPencil size={11} strokeWidth={2} />
          Edit
        </button>
        <button
          onClick={() => data.onDelete(id)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors shadow-sm"
        >
          <IconTrash size={11} strokeWidth={2} />
          Delete
        </button>
      </NodeToolbar>

      {/* Source handles */}
      {POSITIONS.map(({ id: hid, pos }) => (
        <Handle
          key={`s-${hid}`}
          id={hid}
          type="source"
          position={pos}
          style={{ ...HANDLE_STYLE_BASE, opacity: handleOpacity }}
        />
      ))}

      {/* Card */}
      <div
        className={cn(
          'bg-card border rounded-lg shadow-sm w-48 cursor-default overflow-hidden',
          selected ? 'border-primary ring-1 ring-primary/30' : 'border-border',
        )}
        onMouseEnter={() => { setHovered(true); setHoveredId(id); }}
        onMouseLeave={() => { setHovered(false); setHoveredId(null); }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: data.color ?? 'transparent' }} />
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: data.color ?? 'var(--primary)' }}
            />
            <p className="text-sm font-medium text-foreground truncate">{data.label}</p>
          </div>
          {data.description && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
              {data.description}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(AppNode);
