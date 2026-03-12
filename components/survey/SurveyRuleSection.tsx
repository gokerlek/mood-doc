'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyRule } from '@/lib/defaults';
import type { KbItemContext } from '@/lib/types';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

interface SurveyRuleSectionProps {
  ruleIds: string[];
  context: KbItemContext;
  onAddRuleId: (id: string) => void;
  onRemoveRuleId: (id: string) => void;
}

export function SurveyRuleSection({ ruleIds, context, onAddRuleId, onRemoveRuleId }: SurveyRuleSectionProps) {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();

  if (!data) return null;

  const rules = data.rules.filter(r => ruleIds.includes(r.id));

  const handleAdd = () => {
    const rule = emptyRule(context);
    upsertRule(rule);
    onAddRuleId(rule.id);
  };

  const handleDelete = (ruleId: string) => {
    deleteRule(ruleId);
    onRemoveRuleId(ruleId);
    toast.success('Silindi');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Kurallar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} /> Ekle
        </Button>
      </div>
      {rules.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz kural yok.</p>
      ) : (
        rules.map(rule => (
          <Card key={rule.id} className="p-3 space-y-2">
            <Input
              value={rule.title}
              onChange={e => upsertRule({ ...rule, title: e.target.value })}
              placeholder="Kural başlığı..."
            />
            <Textarea
              value={rule.description}
              onChange={e => upsertRule({ ...rule, description: e.target.value })}
              placeholder="Kural açıklaması..."
              rows={2}
            />
            <div className="flex items-center justify-between">
              <TagSelector selectedIds={rule.tag_ids} onChange={tag_ids => upsertRule({ ...rule, tag_ids })} />
              <Button type="button" variant="ghost" size="sm"
                onClick={() => handleDelete(rule.id)}
                className="text-muted-foreground hover:text-destructive" aria-label="Kural sil">
                <IconTrash size={14} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
