'use client';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { KbPage } from '@/lib/types';
import { Button } from '@/components/ui/button';

export interface PageRowProps {
  page: KbPage;
  faqCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function PageRow({ page, faqCount, onEdit, onDelete }: PageRowProps) {
  return (
    <div className="bg-card border border-border rounded-xl px-5 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{page.name}</p>
        <p className="text-xs text-muted-foreground font-mono">{page.path}</p>
        {faqCount > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">{faqCount} FAQ</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <IconPencil size={14} />
        </Button>
        <Button variant="destructive" size="icon-sm" onClick={onDelete}>
          <IconTrash size={14} />
        </Button>
      </div>
    </div>
  );
}
