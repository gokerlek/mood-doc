'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { RuleForm } from './RuleForm';
import type { KbRule, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

function contextLabel(context: KbRule['context'], leafNodes: MapNodeData[], components: KbComponent[]): string | null {
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

export function RuleRow({ rule, leafNodes, components, onEdit, onDelete, editingId, onSave, onCancelEdit }: RuleRowProps) {
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

  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{rule.title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{rule.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {ctxLabel && (
              <Badge variant="outline">{ctxLabel}</Badge>
            )}
            {rule.tag_ids.map(t => (
              <Badge key={t} variant="secondary">#{t}</Badge>
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
