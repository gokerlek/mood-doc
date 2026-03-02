'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { FaqForm } from './FaqForm';
import type { KbFaq, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FaqRowProps {
  faq: KbFaq;
  leafNodes: MapNodeData[];
  components: KbComponent[];
  onEdit: () => void;
  onDelete: () => void;
  editingId: string | null;
  onSave: (f: KbFaq) => void;
  onCancelEdit: () => void;
}

function contextLabel(context: KbFaq['context'], leafNodes: MapNodeData[], components: KbComponent[]): string | null {
  if (context.type === 'global') return null;
  if (context.type === 'page') {
    const node = leafNodes.find(n => n.id === context.node_id);
    return node ? `Sayfa: ${node.label}` : `Sayfa: ${context.node_id}`;
  }
  if (context.type === 'component') {
    const comp = components.find(c => c.id === context.component_id);
    return comp ? `Component: ${comp.name}` : `Component: ${context.component_id}`;
  }
  return null;
}

export function FaqRow({ faq, leafNodes, components, onEdit, onDelete, editingId, onSave, onCancelEdit }: FaqRowProps) {
  if (editingId === faq.id) {
    return (
      <FaqForm
        initial={faq}
        leafNodes={leafNodes}
        components={components}
        onSave={onSave}
        onCancel={onCancelEdit}
      />
    );
  }

  const ctxLabel = contextLabel(faq.context, leafNodes, components);

  return (
    <div className="bg-card border border-border border-l-4 border-l-primary/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 group">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="font-semibold text-foreground text-sm leading-snug">{faq.question}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {ctxLabel && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                {ctxLabel}
              </Badge>
            )}
            {faq.tag_ids.map(t => (
              <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <IconPencil size={14} />
          </Button>
          <Button variant="destructive" size="icon-sm" onClick={onDelete}>
            <IconTrash size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
