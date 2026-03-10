'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { FaqForm } from './FaqForm';
import type { KbFaq, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contextLabel } from '@/lib/context-utils';
import { useKbStore } from '@/stores/kbStore';

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

export function FaqRow({ faq, leafNodes, components, onEdit, onDelete, editingId, onSave, onCancelEdit }: FaqRowProps) {
  const data = useKbStore.useData();

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

  const tagLabels = data ? faq.tag_ids.map(tagId => {
    const tag = data.tags.find(t => t.id === tagId);
    return tag ? tag.label : null;
  }).filter((label): label is string => label !== null) : [];

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
            {tagLabels.map((label, idx) => (
              <Badge key={`${faq.id}-tag-${idx}`} variant="outline" className="text-[10px]">{label}</Badge>
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
