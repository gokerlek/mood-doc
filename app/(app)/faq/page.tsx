'use client';
import { useState, useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconHelp } from '@tabler/icons-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { FaqForm } from '@/components/faq/FaqForm';
import { FaqRow } from '@/components/faq/FaqRow';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { emptyFaq } from '@/lib/defaults';
import type { KbFaq, MapNodeData } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function FaqPage() {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const leafNodes = useMemo<MapNodeData[]>(() => {
    if (!data) return [];
    const parentIds = new Set(
      data.map.nodes.map(n => n.parent_id).filter((id): id is string => id != null)
    );
    return data.map.nodes.filter(n => !parentIds.has(n.id));
  }, [data]);

  const allTags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.faq.forEach(f => f.tag_ids.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [data]);

  if (!data) return null;

  const filtered = activeTag
    ? data.faq.filter(f => f.tag_ids.includes(activeTag))
    : data.faq;

  const globalFaqs = filtered.filter(f => f.context.type === 'global');
  const pageFaqs = filtered.filter(f => f.context.type === 'page');
  const componentFaqs = filtered.filter(f => f.context.type === 'component');

  const handleSave = (f: KbFaq) => {
    upsertFaq({ ...f, id: f.id || `faq_${Date.now()}` });
    setAdding(false);
    setEditingId(null);
  };

  const rowProps = (faq: KbFaq) => ({
    faq,
    leafNodes,
    components: data.components,
    onEdit: () => setEditingId(faq.id),
    onDelete: () => setPendingDelete(faq),
    editingId,
    onSave: handleSave,
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
        icon={<IconHelp size={22} className="text-primary" />}
        title="FAQ"
        description={`${data.faq.length} soru toplam`}
        action={
          !adding ? (
            <Button onClick={() => { setAdding(true); setEditingId(null); }}>
              <IconPlus size={15} />
              FAQ Ekle
            </Button>
          ) : undefined
        }
      />

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={!activeTag ? 'default' : 'outline'}
            onClick={() => setActiveTag(null)}
            className="rounded-full"
          >
            All
          </Button>
          {allTags.map(tag => (
            <Button
              key={tag}
              size="sm"
              variant={activeTag === tag ? 'default' : 'outline'}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className="rounded-full"
            >
              #{tag}
            </Button>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <FaqForm
          initial={emptyFaq()}
          leafNodes={leafNodes}
          components={data.components}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Empty state */}
      {data.faq.length === 0 && !adding && (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <IconHelp size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Henüz FAQ yok.</p>
          <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
            İlk soruyu ekle →
          </Button>
        </div>
      )}

      {/* Categorized list */}
      {filtered.length > 0 && (
        <div className="space-y-6">
          {globalFaqs.length > 0 && (
            <CollapsibleSection title="Global" count={globalFaqs.length}>
              {globalFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
            </CollapsibleSection>
          )}
          {pageFaqs.length > 0 && (
            <CollapsibleSection title="Sayfaya Bağlı" count={pageFaqs.length}>
              {pageFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
            </CollapsibleSection>
          )}
          {componentFaqs.length > 0 && (
            <CollapsibleSection title="Component'e Bağlı" count={componentFaqs.length}>
              {componentFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
            </CollapsibleSection>
          )}
        </div>
      )}

      {filtered.length === 0 && data.faq.length > 0 && (
        <p className="text-center py-8 text-sm text-muted-foreground">
          <span className="font-mono">#{activeTag}</span> etiketli FAQ yok.{' '}
          <Button variant="link" onClick={() => setActiveTag(null)} className="p-0 h-auto">
            Filtreyi temizle
          </Button>
        </p>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this FAQ?"
        description={pendingDelete?.question}
        onConfirm={() => { if (pendingDelete) deleteFaq(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
