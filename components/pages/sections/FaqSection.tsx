'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyFaq } from '@/lib/defaults';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { PageSection } from '@/lib/types';

interface FaqSectionProps {
  section: Extract<PageSection, { type: 'faq' }>;
  nodeId: string;
}

export function FaqSection({ section, nodeId }: FaqSectionProps) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();
  const upsertPageSection = useKbStore.useUpsertPageSection();

  if (!data) return null;

  const faqs = data.faq.filter(f => section.faq_ids.includes(f.id));

  const handleAdd = () => {
    const faq = emptyFaq({ type: 'page', node_id: nodeId });
    upsertFaq(faq);
    upsertPageSection(nodeId, { ...section, faq_ids: [...section.faq_ids, faq.id] });
  };

  const handleDelete = (faqId: string) => {
    deleteFaq(faqId);
    upsertPageSection(nodeId, { ...section, faq_ids: section.faq_ids.filter(id => id !== faqId) });
    toast.success('Silindi');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          FAQ
        </p>
        <Button size="sm" variant="ghost" onClick={handleAdd}>
          <IconPlus size={12} />
          Ekle
        </Button>
      </div>
      {faqs.map(faq => (
        <div key={faq.id} className="border border-border/50 rounded-md p-2.5 space-y-1.5">
          <Input
            value={faq.question}
            onChange={e => upsertFaq({ ...faq, question: e.target.value })}
            placeholder="Soru..."
            className="h-7 text-xs"
          />
          <Textarea
            value={faq.answer}
            onChange={e => upsertFaq({ ...faq, answer: e.target.value })}
            placeholder="Cevap..."
            rows={2}
            className="text-xs"
          />
          <div className="flex items-center justify-between">
            <TagSelector
              selectedIds={faq.tag_ids}
              onChange={tag_ids => upsertFaq({ ...faq, tag_ids })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(faq.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="FAQ sil"
            >
              <IconTrash size={12} />
            </Button>
          </div>
        </div>
      ))}
      {faqs.length === 0 && (
        <p className="text-xs text-muted-foreground">Henüz FAQ yok.</p>
      )}
    </div>
  );
}
