'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyFaq } from '@/lib/defaults';
import type { PageData } from '@/lib/types';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface PageFaqSectionProps {
  nodeId: string;
  pageData: PageData;
}

export function PageFaqSection({ nodeId, pageData }: PageFaqSectionProps) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();
  const updatePageData = useKbStore.useUpdatePageData();

  if (!data) return null;

  const faqIds = pageData.faq_ids ?? [];
  const faqs = data.faq.filter(f => faqIds.includes(f.id));

  const handleAdd = () => {
    const faq = emptyFaq({ type: 'page', node_id: nodeId });
    upsertFaq(faq);
    updatePageData(nodeId, { ...pageData, faq_ids: [...faqIds, faq.id] });
  };

  const handleDelete = (faqId: string) => {
    deleteFaq(faqId);
    updatePageData(nodeId, { ...pageData, faq_ids: faqIds.filter(id => id !== faqId) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">FAQ&apos;lar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} />
          Ekle
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz FAQ yok.</p>
      ) : (
        faqs.map(faq => (
          <div key={faq.id} className="border border-border rounded-lg p-3 space-y-2">
            <Input
              value={faq.question}
              onChange={e => upsertFaq({ ...faq, question: e.target.value })}
              placeholder="Soru..."
            />
            <Textarea
              value={faq.answer}
              onChange={e => upsertFaq({ ...faq, answer: e.target.value })}
              placeholder="Cevap..."
              rows={2}
            />
            <div className="flex items-center justify-between">
              <TagSelector
                selectedIds={faq.tag_ids}
                onChange={tag_ids => upsertFaq({ ...faq, tag_ids })}
              />
              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="FAQ sil"
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
