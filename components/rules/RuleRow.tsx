'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { RuleForm } from './RuleForm';
import type { KbRule, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contextLabel } from '@/lib/context-utils';
import { useKbStore } from '@/stores/kbStore';

export interface RuleRowProps {
  rule: KbRule;
  leafNodes: MapNodeData[];
  components: KbComponent[];
  onEdit: () => void;
  onDelete: () => void;
  editingId: string | null;
  onSave: (r: KbRule) => void;
  onCancelEdit: () => void;
}

export function RuleRow({ rule, leafNodes, components, onEdit, onDelete, editingId, onSave, onCancelEdit }: RuleRowProps) {
  const data = useKbStore.useData();

  if (editingId === rule.id) {
    return (
      <RuleForm
        initial={rule}
        leafNodes={leafNodes}
        components={components}
        onSave={onSave}
        onCancel={onCancelEdit}
      />
    );
  }

  const ctxLabel = contextLabel(rule.context, leafNodes, components);

  const tagLabels = data ? rule.tag_ids.map(tagId => {
    const tag = data.tags.find(t => t.id === tagId);
    return tag ? tag.label : null;
  }).filter((label): label is string => label !== null) : [];

  return (
    <div className="bg-card border border-border border-l-4 border-l-amber-500/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 group">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{rule.title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{rule.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {ctxLabel && (
              <Badge variant="outline">{ctxLabel}</Badge>
            )}
            {tagLabels.map((label, idx) => (
              <Badge key={`${rule.id}-tag-${idx}`} variant="secondary">{label}</Badge>
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
