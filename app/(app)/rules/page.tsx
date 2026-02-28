'use client';
import { useState, useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
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
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kurallar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Platform genelinde geçerli ve bağlama özgü kurallar.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => { setAdding(true); setEditingId(null); }}>
            <IconPlus size={15} />Kural Ekle
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <RuleForm
          initial={emptyRule()}
          leafNodes={leafNodes}
          components={data.components}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Empty state */}
      {data.rules.length === 0 && !adding && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Henüz kural eklenmemiş.{' '}
          <Button variant="link" onClick={() => setAdding(true)} className="p-0 h-auto">
            İlk kuralı ekle →
          </Button>
        </div>
      )}

      {/* Categorized list */}
      {data.rules.length > 0 && (
        <div className="space-y-6">
          {globalRules.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Global</h2>
              {globalRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </div>
          )}
          {pageRules.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Sayfaya Bağlı</h2>
              {pageRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </div>
          )}
          {componentRules.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Component'e Bağlı</h2>
              {componentRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </div>
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
