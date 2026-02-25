'use client';
import { IconX, IconPencil, IconLink, IconLinkOff, IconTag } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { KbPage } from '@/lib/types';
import { type NodeColor, NODE_COLOR_CLASS } from '@/lib/mapColors';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface DetailPanelProps {
  page: KbPage;
  color: NodeColor;
  connections: { id: string; name: string }[];
  onClose: () => void;
  onEdit: (id: string) => void;
  onRemoveConnection: (toId: string) => void;
}

export function DetailPanel({
  page,
  color,
  connections,
  onClose,
  onEdit,
  onRemoveConnection,
}: DetailPanelProps) {
  return (
    <div className={cn(NODE_COLOR_CLASS[color], 'w-72 bg-card border-l border-border flex flex-col h-full shrink-0 overflow-y-auto')}>
      <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[var(--node-color)]" />
            <p className="font-semibold text-foreground text-sm truncate">{page.name}</p>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{page.path}</p>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(page.id)} title="Edit page">
            <IconPencil size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <IconX size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {page.description && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{page.description}</p>
              </div>
              <Separator />
            </>
          )}

          {page.how_to_access && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">How to Access</p>
                <p className="text-sm text-foreground leading-relaxed">{page.how_to_access}</p>
              </div>
              <Separator />
            </>
          )}

          {page.key_actions.filter(Boolean).length > 0 && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Key Actions</p>
                <ul className="space-y-1">
                  {page.key_actions.filter(Boolean).map((a, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-1.5">
                      <span className="text-muted-foreground/50 mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
            </>
          )}

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <IconLink size={12} className="text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Connections ({connections.length})
              </p>
            </div>
            {connections.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No connections. Hover over any node and drag from any of the 4 side handles.
              </p>
            ) : (
              <div className="space-y-1">
                {connections.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-muted rounded-lg px-2.5 py-1.5">
                    <p className="text-xs text-foreground truncate">{c.name}</p>
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => onRemoveConnection(c.id)}
                      title="Remove connection"
                      className="shrink-0 ml-1"
                    >
                      <IconLinkOff size={11} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {page.tips.filter(Boolean).length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <IconTag size={12} className="text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tips</p>
                </div>
                <ul className="space-y-1">
                  {page.tips.filter(Boolean).map((t, i) => (
                    <li key={i} className="text-xs text-foreground flex gap-1.5">
                      <span className="text-amber-400 mt-0.5">★</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Button onClick={() => onEdit(page.id)} className="w-full">Edit Page</Button>
      </div>
    </div>
  );
}
