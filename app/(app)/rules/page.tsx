'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconShieldCheck } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { RuleForm } from '@/components/rules/RuleForm';
import { RuleRow } from '@/components/rules/RuleRow';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useLeafNodes } from '@/hooks/useLeafNodes';
import { contextSplit } from '@/hooks/useContextSplit';
import { emptyRule } from '@/lib/defaults';
import type { KbRule } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function RulesPage() {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbRule | null>(null);
  const [search, setSearch] = useSearchParam('q');

  const leafNodes = useLeafNodes();

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.rules.filter(
    r => !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  );

  const { global: globalRules, page: pageRules, component: componentRules } = contextSplit(
    filtered,
    r => r.context.type
  );

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
    <ListPageLayout
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
      maxWidth="4xl"
    >
      <SearchBar placeholder="Kural başlığı veya açıklama ara..." />

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
        <EmptyState
          icon={<IconShieldCheck size={28} />}
          title="Henüz kural eklenmemiş."
          action={
            <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
              İlk kuralı ekle →
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="space-y-4">
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

      {filtered.length === 0 && data.rules.length > 0 && (
        <NoResults message="Eşleşen kural bulunamadı." onClear={() => setSearch('')} />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Bu kuralı sil?"
        description={pendingDelete?.title}
        onConfirm={() => { if (pendingDelete) deleteRule(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </ListPageLayout>
  );
}
