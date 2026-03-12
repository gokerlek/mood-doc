'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyFaq } from '@/lib/defaults';
import type { KbItemContext } from '@/lib/types';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

interface SurveyFaqSectionProps {
  faqIds: string[];
  context: KbItemContext;
  onAddFaqId: (id: string) => void;
  onRemoveFaqId: (id: string) => void;
}

export function SurveyFaqSection({ faqIds, context, onAddFaqId, onRemoveFaqId }: SurveyFaqSectionProps) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  if (!data) return null;

  const faqs = data.faq.filter(f => faqIds.includes(f.id));

  const handleAdd = () => {
    const faq = emptyFaq(context);
    upsertFaq(faq);
    onAddFaqId(faq.id);
  };

  const handleDelete = (faqId: string) => {
    deleteFaq(faqId);
    onRemoveFaqId(faqId);
    toast.success('Silindi');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">FAQ&apos;lar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} /> Ekle
        </Button>
      </div>
      {faqs.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz FAQ yok.</p>
      ) : (
        faqs.map(faq => (
          <Card key={faq.id} className="p-3 space-y-2">
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
              <TagSelector selectedIds={faq.tag_ids} onChange={tag_ids => upsertFaq({ ...faq, tag_ids })} />
              <Button type="button" variant="ghost" size="sm"
                onClick={() => handleDelete(faq.id)}
                className="text-muted-foreground hover:text-destructive" aria-label="FAQ sil">
                <IconTrash size={14} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
