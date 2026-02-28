'use client';
import { useState } from 'react';
import { IconPlus, IconCheck, IconX, IconTag } from '@tabler/icons-react';
import { useKbStore } from '@/stores/kbStore';
import { TagInput } from '@/components/shared/TagInput';
import type { KbItemContext } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface QuickAddFaqProps {
  context?: KbItemContext;
}

export function QuickAddFaq({ context = { type: 'global' } }: QuickAddFaqProps) {
  const upsertFaq = useKbStore.useUpsertFaq();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);

  const reset = () => { setQuestion(''); setAnswer(''); setTagIds([]); setOpen(false); };

  const save = () => {
    if (!question.trim() || !answer.trim()) return;
    upsertFaq({
      id: `faq_${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      tag_ids: tagIds,
      context,
    });
    reset();
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => setOpen(true)}
      >
        <IconPlus size={11} />Add FAQ
      </Button>
    );
  }

  return (
    <div className="mt-3 bg-secondary border border-border rounded-lg p-3 space-y-2.5">
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
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1">
          <IconTag size={10} />Tags
        </Label>
        <TagInput tags={tagIds} onChange={setTagIds} compact />
      </div>
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!question.trim() || !answer.trim()}
        >
          <IconCheck size={11} />Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={reset}>
          <IconX size={11} />Cancel
        </Button>
      </div>
    </div>
  );
}
