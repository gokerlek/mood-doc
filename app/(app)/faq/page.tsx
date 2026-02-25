'use client';
import { useState, useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { FaqForm } from '@/components/faq/FaqForm';
import { FaqRow } from '@/components/faq/FaqRow';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { emptyFaq } from '@/lib/defaults';
import type { KbFaq } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function FaqPage() {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.faq.forEach(f => f.tags.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [data]);

  if (!data) return null;

  const filtered = activeTag ? data.faq.filter(f => f.tags.includes(activeTag)) : data.faq;
  const general = filtered.filter(f => !f.module_id);
  const moduleGroups = data.modules.map(mod => {
    const modFaqs = filtered.filter(f => f.module_id === mod.id && !f.page_id);
    const pageGroups = data.pages
      .filter(p => p.module_id === mod.id)
      .map(page => ({ page, faqs: filtered.filter(f => f.page_id === page.id) }))
      .filter(g => g.faqs.length > 0);
    return { mod, modFaqs, pageGroups };
  }).filter(g => g.modFaqs.length > 0 || g.pageGroups.length > 0);

  const handleSave = (f: KbFaq) => {
    upsertFaq({ ...f, id: f.id || `faq_${Date.now()}` });
    setAdding(false);
    setEditingId(null);
  };

  const rowProps = (faq: KbFaq) => ({
    faq,
    modules: data.modules,
    pages: data.pages,
    onEdit: () => setEditingId(faq.id),
    onDelete: () => setPendingDelete(faq),
    editingId,
    onSave: handleSave,
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">FAQ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.faq.length} question{data.faq.length !== 1 ? 's' : ''} across all modules and pages.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => { setAdding(true); setEditingId(null); }}>
            <IconPlus size={15} />Add FAQ
          </Button>
        )}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant={!activeTag ? 'default' : 'outline'} onClick={() => setActiveTag(null)} className="rounded-full">
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
          modules={data.modules}
          pages={data.pages}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Empty state */}
      {data.faq.length === 0 && !adding && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No FAQs yet.{' '}
          <Button variant="link" onClick={() => setAdding(true)} className="p-0 h-auto">
            Add first question →
          </Button>
        </div>
      )}

      {/* Categorized list */}
      {filtered.length > 0 && (
        <div className="space-y-6">
          {general.length > 0 && (
            <CollapsibleSection title="General" count={general.length}>
              {general.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
            </CollapsibleSection>
          )}
          {moduleGroups.map(({ mod, modFaqs, pageGroups }) => (
            <CollapsibleSection key={mod.id} title={mod.name} count={modFaqs.length + pageGroups.reduce((a, g) => a + g.faqs.length, 0)}>
              {modFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
              {pageGroups.map(({ page, faqs }) => (
                <div key={page.id} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground pl-1 flex items-center gap-1">
                    <span className="font-mono">{page.path}</span>
                    <span className="font-sans">— {page.name}</span>
                  </p>
                  {faqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
                </div>
              ))}
            </CollapsibleSection>
          ))}
        </div>
      )}

      {filtered.length === 0 && data.faq.length > 0 && (
        <p className="text-center py-8 text-sm text-muted-foreground">
          No FAQs with tag <span className="font-mono">#{activeTag}</span>.{' '}
          <Button variant="link" onClick={() => setActiveTag(null)} className="p-0 h-auto">
            Clear filter
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
