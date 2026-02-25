'use client';
import { useState } from 'react';
import { IconCheck, IconTag } from '@tabler/icons-react';
import { TagInput } from '@/components/shared/TagInput';
import type { KbFaq, KbModule, KbPage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface FaqFormProps {
  initial: KbFaq;
  modules: KbModule[];
  pages: KbPage[];
  onSave: (f: KbFaq) => void;
  onCancel: () => void;
}

export function FaqForm({ initial, modules, pages, onSave, onCancel }: FaqFormProps) {
  const [f, setF] = useState<KbFaq>(initial);
  const filteredPages = f.module_id ? pages.filter(p => p.module_id === f.module_id) : pages;
  const canSave = f.question.trim() && f.answer.trim();

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Question</Label>
          <Input
            placeholder="What is...?"
            value={f.question}
            onChange={e => setF(p => ({ ...p, question: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Answer</Label>
          <Textarea
            rows={3}
            value={f.answer}
            onChange={e => setF(p => ({ ...p, answer: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Module <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Select
              value={f.module_id ?? ''}
              onValueChange={v => setF(p => ({ ...p, module_id: v || undefined, page_id: undefined }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— General —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— General —</SelectItem>
                {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Page <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Select
              value={f.page_id ?? ''}
              onValueChange={v => setF(p => ({ ...p, page_id: v || undefined }))}
              disabled={!f.module_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Module level —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Module level —</SelectItem>
                {filteredPages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="flex items-center gap-1"><IconTag size={13} />Tags</Label>
          <TagInput tags={f.tags} onChange={tags => setF(p => ({ ...p, tags }))} />
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={() => { if (canSave) onSave(f); }} disabled={!canSave} className="flex-1">
            <IconCheck size={14} />Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
