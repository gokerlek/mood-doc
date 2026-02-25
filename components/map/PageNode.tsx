"use client";
import { useContext } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { KbPage } from "@/lib/types";
import { type NodeColor, NODE_COLOR_CLASS } from "@/lib/mapColors";
import { HoveredNodeCtx } from "./HoveredNodeCtx";

export interface PageNodeData {
  page: KbPage;
  color: NodeColor;
  selected: boolean;
  onSelect: (id: string) => void;
}

const pageNodeVariants = cva(
  "page-node-card group relative cursor-pointer w-56 rounded-2xl bg-card transition-all duration-200",
  {
    variants: {
      color: NODE_COLOR_CLASS,
      selected: {
        true: "-translate-y-1 shadow-xl ring-2 ring-[var(--node-color)]/40",
        false: "hover:-translate-y-0.5 hover:shadow-lg",
      },
    },
    defaultVariants: {
      color: "none",
      selected: false,
    },
  },
);

export type PageNodeVariants = VariantProps<typeof pageNodeVariants>;

const HANDLE_STYLE = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "2px solid var(--card)",
  backgroundColor: "var(--color-primary-soft)",
  transition: "background-color 0.15s",
};

const HANDLE_CLASS = "!opacity-0 group-hover:!opacity-100 !transition-opacity";

export function PageNode({ data }: NodeProps) {
  const { page, color, selected, onSelect } = data as unknown as PageNodeData;
  const { setHoveredId } = useContext(HoveredNodeCtx);
  const connectionCount = (page.connections ?? []).length;

  return (
    <div
      onClick={() => onSelect(page.id)}
      onMouseEnter={() => setHoveredId(page.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={cn(pageNodeVariants({ color, selected }))}
    >
      <Handle
        id="t-t"
        type="target"
        position={Position.Top}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="t-s"
        type="source"
        position={Position.Top}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="b-t"
        type="target"
        position={Position.Bottom}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="b-s"
        type="source"
        position={Position.Bottom}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="l-t"
        type="target"
        position={Position.Left}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="l-s"
        type="source"
        position={Position.Left}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="r-t"
        type="target"
        position={Position.Right}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />
      <Handle
        id="r-s"
        type="source"
        position={Position.Right}
        style={HANDLE_STYLE}
        className={HANDLE_CLASS}
      />

      <div className="page-node-header px-3.5 pt-3 pb-2.5 rounded-t-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="page-node-dot mt-[3px] w-2 h-2 rounded-full shrink-0" />
            <p className="text-[12.5px] font-semibold text-card-foreground leading-snug line-clamp-2">
              {page.name}
            </p>
          </div>
          {connectionCount > 0 && (
            <span className="page-node-badge shrink-0 inline-flex items-center rounded-full text-[9px] font-bold tabular-nums h-4 px-1.5">
              {connectionCount}
            </span>
          )}
        </div>
        <p className="page-node-path mt-1.5 pl-4 text-[9px] font-mono truncate">
          {page.path}
        </p>
      </div>

      <div className="page-node-divider h-px" />

      <div className="px-3.5 py-2.5">
        {page.description ? (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {page.description}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/40 italic">
            No description
          </p>
        )}
      </div>
    </div>
  );
}
