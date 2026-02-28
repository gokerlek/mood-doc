'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyRule } from '@/lib/defaults';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { PageSection } from '@/lib/types';

interface RulesSectionProps {
  section: Extract<PageSection, { type: 'rules' }>;
  nodeId: string;
}

export function RulesSection({ section, nodeId }: RulesSectionProps) {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();
  const upsertPageSection = useKbStore.useUpsertPageSection();

  if (!data) return null;

  const rules = data.rules.filter(r => section.rule_ids.includes(r.id));

  const handleAdd = () => {
    const rule = emptyRule({ type: 'page', node_id: nodeId });
    upsertRule(rule);
    upsertPageSection(nodeId, { ...section, rule_ids: [...section.rule_ids, rule.id] });
  };

  const handleDelete = (ruleId: string) => {
    deleteRule(ruleId);
    upsertPageSection(nodeId, { ...section, rule_ids: section.rule_ids.filter(id => id !== ruleId) });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Kurallar
        </p>
        <Button size="sm" variant="ghost" onClick={handleAdd}>
          <IconPlus size={12} />
          Ekle
        </Button>
      </div>
      {rules.map(rule => (
        <div key={rule.id} className="border border-border/50 rounded-md p-2.5 space-y-1.5">
          <Input
            value={rule.title}
            onChange={e => upsertRule({ ...rule, title: e.target.value })}
            placeholder="Kural başlığı..."
            className="h-7 text-xs"
          />
          <Textarea
            value={rule.description}
            onChange={e => upsertRule({ ...rule, description: e.target.value })}
            placeholder="Kural açıklaması..."
            rows={2}
            className="text-xs"
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
              <IconTrash size={12} />
            </button>
          </div>
        </div>
      ))}
      {rules.length === 0 && (
        <p className="text-xs text-muted-foreground">Henüz kural yok.</p>
      )}
    </div>
  );
}
