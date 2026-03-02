'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent } from '@/lib/types';
import { TagBadge } from '@/components/tags/TagBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { IconAtom, IconChevronRight, IconPuzzle, IconTrash } from '@tabler/icons-react';

interface ComponentCardProps {
  component: KbComponent;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const data = useKbStore.useData();
  const deleteComponent = useKbStore.useDeleteComponent();

  const isPrimitive = component.component_type === 'primitive';
  const tags = (data?.tags ?? []).filter(t => component.tag_ids?.includes(t.id) ?? false);
  const faqCount = component.faq_ids.length;
  const ruleCount = component.rule_ids.length;

  return (
    <>
      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors group">
        <Link
          href={`/components/${component.id}`}
          className="flex items-start gap-3 flex-1 min-w-0"
        >
          {isPrimitive
            ? <IconAtom size={18} className="text-muted-foreground mt-0.5 shrink-0" />
            : <IconPuzzle size={18} className="text-primary mt-0.5 shrink-0" />
          }
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-sm">
              {component.name || 'İsimsiz Component'}
            </p>
            {component.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {component.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1">
                {tags.map(t => <TagBadge key={t.id} label={t.label} />)}
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {faqCount} FAQ · {ruleCount} Kural
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isPrimitive && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Component sil"
            >
              <IconTrash size={14} />
            </button>
          )}
          <IconChevronRight size={14} className="text-muted-foreground" />
        </div>
      </div>

      {!isPrimitive && (
        <ConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            deleteComponent(component.id);
            setConfirmOpen(false);
          }}
          title="Component silinsin mi?"
          description="Bu işlem geri alınamaz. Bu component'e ait FAQ ve kurallar listede kalır."
        />
      )}
    </>
  );
}
