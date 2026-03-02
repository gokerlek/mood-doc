'use client';
import { useState, useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconShieldCheck } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { RuleForm } from '@/components/rules/RuleForm';
import { RuleRow } from '@/components/rules/RuleRow';
import { emptyRule } from '@/lib/defaults';
import type { KbRule, MapNodeData } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function RulesPage() {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbRule | null>(null);

  const leafNodes = useMemo<MapNodeData[]>(() => {
    if (!data) return [];
    const parentIds = new Set(
      data.map.nodes.map(n => n.parent_id).filter((id): id is string => id != null)
    );
    return data.map.nodes.filter(n => !parentIds.has(n.id));
  }, [data]);

  if (!data) return null;

  const globalRules = data.rules.filter(r => r.context.type === 'global');
  const pageRules = data.rules.filter(r => r.context.type === 'page');
  const componentRules = data.rules.filter(r => r.context.type === 'component');

  const handleSave = (r: KbRule) => {
    upsertRule({ ...r, id: r.id || `rule_${Date.now()}` });
    setAdding(false);
    setEditingId(null);
  };

  const rowProps = (rule: KbRule) => ({
    rule,
    leafNodes,
    components: data.components,
    onEdit: () => setEditingId(rule.id),
    onDelete: () => setPendingDelete(rule),
    editingId,
    onSave: handleSave,
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
        icon={<IconShieldCheck size={22} className="text-primary" />}
        title="Kurallar"
        description={`${data.rules.length} kural toplam`}
        action={
          !adding ? (
            <Button onClick={() => { setAdding(true); setEditingId(null); }}>
              <IconPlus size={15} />
              Kural Ekle
            </Button>
          ) : undefined
        }
      />

      {adding && (
        <RuleForm
          initial={emptyRule()}
          leafNodes={leafNodes}
          components={data.components}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {data.rules.length === 0 && !adding && (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <IconShieldCheck size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Henüz kural eklenmemiş.</p>
          <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
            İlk kuralı ekle →
          </Button>
        </div>
      )}

      {data.rules.length > 0 && (
        <div className="space-y-3">
          {globalRules.length > 0 && (
            <CollapsibleSection title="Global" count={globalRules.length}>
              {globalRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </CollapsibleSection>
          )}
          {pageRules.length > 0 && (
            <CollapsibleSection title="Sayfaya Bağlı" count={pageRules.length}>
              {pageRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </CollapsibleSection>
          )}
          {componentRules.length > 0 && (
            <CollapsibleSection title="Component'e Bağlı" count={componentRules.length}>
              {componentRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </CollapsibleSection>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Bu kuralı sil?"
        description={pendingDelete?.title}
        onConfirm={() => { if (pendingDelete) deleteRule(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
