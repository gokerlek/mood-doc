'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyRule } from '@/lib/defaults';
import type { PageData } from '@/lib/types';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface PageRuleSectionProps {
  nodeId: string;
  pageData: PageData;
}

export function PageRuleSection({ nodeId, pageData }: PageRuleSectionProps) {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();
  const updatePageData = useKbStore.useUpdatePageData();

  if (!data) return null;

  const ruleIds = pageData.rule_ids ?? [];
  const rules = data.rules.filter(r => ruleIds.includes(r.id));

  const handleAdd = () => {
    const rule = emptyRule({ type: 'page', node_id: nodeId });
    upsertRule(rule);
    updatePageData(nodeId, { ...pageData, rule_ids: [...ruleIds, rule.id] });
  };

  const handleDelete = (ruleId: string) => {
    deleteRule(ruleId);
    updatePageData(nodeId, { ...pageData, rule_ids: ruleIds.filter(id => id !== ruleId) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Kurallar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} />
          Ekle
        </Button>
      </div>

      {rules.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz kural yok.</p>
      ) : (
        rules.map(rule => (
          <div key={rule.id} className="border border-border rounded-lg p-3 space-y-2">
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
              <TagSelector
                selectedIds={rule.tag_ids}
                onChange={tag_ids => upsertRule({ ...rule, tag_ids })}
              />
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Kural sil"
              >
                <IconTrash size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
