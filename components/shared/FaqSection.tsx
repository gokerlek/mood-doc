'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconPencil, IconCheck, IconX, IconTag } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { TagInput } from '@/components/shared/TagInput';
import type { KbFaq, KbItemContext } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// ── Inline FAQ form ───────────────────────────────────────────────────────────

interface InlineFormProps {
  initial?: KbFaq;
  context: KbItemContext;
  onSave: (f: KbFaq) => void;
  onCancel: () => void;
}

function InlineForm({ initial, context, onSave, onCancel }: InlineFormProps) {
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [tagIds, setTagIds] = useState<string[]>(initial?.tag_ids ?? []);
  const canSave = question.trim() !== '' && answer.trim() !== '';

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `faq_${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      tag_ids: tagIds,
      context,
    });
  };

  return (
    <div className="bg-secondary border border-border rounded-lg p-3 space-y-2.5">
      <Input
        autoFocus
        placeholder="Question..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <Textarea
        rows={2}
        placeholder="Answer..."
        value={answer}
        onChange={e => setAnswer(e.target.value)}
      />
      <div>
        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
          <IconTag size={10} />Tags
        </p>
        <TagInput tags={tagIds} onChange={setTagIds} compact />
      </div>
      <div className="flex gap-1.5">
        <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>
          <IconCheck size={11} />Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          <IconX size={11} />Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface FaqSectionProps {
  context: KbItemContext;
  isNew?: boolean;
}

export function FaqSection({ context, isNew }: FaqSectionProps) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);

  const faqs = (data?.faq ?? []).filter(f => {
    if (context.type === 'global') return f.context.type === 'global';
    if (context.type === 'page') return f.context.type === 'page' && f.context.node_id === context.node_id;
    if (context.type === 'component') return f.context.type === 'component' && f.context.component_id === context.component_id;
    return false;
  });

  const handleSave = (f: KbFaq) => {
    upsertFaq(f);
    setAdding(false);
    setEditingId(null);
  };

  return (
    <div className="border-t border-border pt-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          FAQ
          {faqs.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">{faqs.length}</Badge>
          )}
        </h3>
        {!isNew && !adding && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs"
            onClick={() => { setAdding(true); setEditingId(null); }}
          >
            <IconPlus size={12} />Add question
          </Button>
        )}
      </div>

      {isNew && (
        <p className="text-xs text-muted-foreground italic">Save first to add FAQ questions.</p>
      )}

      {adding && (
        <InlineForm
          context={context}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {faqs.length === 0 && !adding && !isNew && (
        <p className="text-xs text-muted-foreground">No questions yet.</p>
      )}

      <div className="space-y-2">
        {faqs.map(faq =>
          editingId === faq.id ? (
            <InlineForm
              key={faq.id}
              initial={faq}
              context={context}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={faq.id} className="group bg-muted rounded-lg px-3 py-2.5 space-y-1">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-sm font-medium text-foreground">{faq.question}</p>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => { setEditingId(faq.id); setAdding(false); }}
                  >
                    <IconPencil size={13} />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => setPendingDelete(faq)}
                  >
                    <IconTrash size={13} />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
              {faq.tag_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {faq.tag_ids.map(t => (
                    <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

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
