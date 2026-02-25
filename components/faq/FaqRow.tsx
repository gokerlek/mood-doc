'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { FaqForm } from './FaqForm';
import type { KbFaq, KbModule, KbPage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FaqRowProps {
  faq: KbFaq;
  modules: KbModule[];
  pages: KbPage[];
  onEdit: () => void;
  onDelete: () => void;
  editingId: string | null;
  onSave: (f: KbFaq) => void;
  onCancelEdit: () => void;
}

export function FaqRow({ faq, modules, pages, onEdit, onDelete, editingId, onSave, onCancelEdit }: FaqRowProps) {
  if (editingId === faq.id) {
    return <FaqForm initial={faq} modules={modules} pages={pages} onSave={onSave} onCancel={onCancelEdit} />;
  }
  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">{faq.question}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{faq.answer}</p>
          {faq.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {faq.tags.map(t => (
                <Badge key={t} variant="secondary">#{t}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <IconPencil size={14} />
          </Button>
          <Button variant="destructive" size="icon-sm" onClick={onDelete}>
            <IconTrash size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
