'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconHelp } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { FaqForm } from '@/components/faq/FaqForm';
import { FaqRow } from '@/components/faq/FaqRow';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useLeafNodes } from '@/hooks/useLeafNodes';
import { contextSplit } from '@/hooks/useContextSplit';
import { emptyFaq } from '@/lib/defaults';
import type { KbFaq } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function FaqPage() {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);
  const [activeTag, setActiveTag] = useSearchParam('tag');
  const [search] = useSearchParam('q');

  const leafNodes = useLeafNodes();

  if (!data) return null;

  const allTagIds = [...new Set(data.faq.flatMap(f => f.tag_ids))].sort();

  const q = search.toLowerCase().trim();
  const filtered = data.faq
    .filter(f => !activeTag || f.tag_ids.includes(activeTag))
    .filter(f => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));

  const { global: globalFaqs, page: pageFaqs, component: componentFaqs } = contextSplit(
    filtered,
    f => f.context.type
  );

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
    <div className="flex flex-col min-h-full">
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

      <div className="px-6 py-6 w-full max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar placeholder="Soru veya cevap ara..." className="flex-1" />
          <TagFilterBar
            tagIds={allTagIds}
            tags={data.tags}
            activeTag={activeTag}
            onSelect={setActiveTag}
          />
        </div>

        {adding && (
          <FaqForm
            initial={emptyFaq()}
            leafNodes={leafNodes}
            components={data.components}
            onSave={handleSave}
            onCancel={() => setAdding(false)}
          />
        )}

        {data.faq.length === 0 && !adding && (
          <EmptyState
            icon={<IconHelp size={28} />}
            title="Henüz FAQ yok."
            action={
              <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
                İlk soruyu ekle →
              </Button>
            }
          />
        )}

        {filtered.length > 0 && (
          <div className="space-y-4">
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
          <NoResults
            message="Eşleşen FAQ bulunamadı."
            onClear={() => router.replace(pathname, { scroll: false })}
          />
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Bu soruyu sil?"
        description={pendingDelete?.question}
        onConfirm={() => { if (pendingDelete) deleteFaq(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
