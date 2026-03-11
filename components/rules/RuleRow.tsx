'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { RuleForm } from './RuleForm';
import type { KbRule, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
    <Card className="group py-0 gap-0 hover:shadow-md transition-all duration-150">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="font-semibold text-foreground text-sm">{rule.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
          {(ctxLabel || tagLabels.length > 0) && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {ctxLabel && (
                <Badge variant="secondary" className="text-xs font-medium">{ctxLabel}</Badge>
              )}
              {tagLabels.map((label, idx) => (
                <Badge key={`${rule.id}-tag-${idx}`} variant="outline" className="text-xs">{label}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-auto p-1.5 text-muted-foreground hover:text-foreground"
          >
            <IconPencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-auto p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <IconTrash size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
