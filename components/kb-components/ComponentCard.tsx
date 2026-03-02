'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent } from '@/lib/types';
import { TagBadge } from '@/components/tags/TagBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Badge } from '@/components/ui/badge';
import { IconAtom, IconChevronRight, IconPuzzle, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

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
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <>
      <div className={cn(
        'flex items-center justify-between bg-card border border-border rounded-xl shadow-sm',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-150 group',
        isPrimitive ? 'border-l-4 border-l-muted-foreground/40' : 'border-l-4 border-l-primary',
      )}>
        <Link
          href={`/components/${component.id}`}
          className="flex items-start gap-3 flex-1 min-w-0 p-4"
        >
          <div className={cn(
            'p-1.5 rounded-lg shrink-0 mt-0.5',
            isPrimitive ? 'bg-muted' : 'bg-primary/10',
          )}>
            {isPrimitive
              ? <IconAtom size={16} className="text-muted-foreground" />
              : <IconPuzzle size={16} className="text-primary" />
            }
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-foreground">
                {component.name || 'İsimsiz Component'}
              </p>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-medium">
                {isPrimitive ? 'Atom' : 'Composite'}
              </Badge>
            </div>
            {component.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {component.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {visibleTags.map(t => <TagBadge key={t.id} label={t.label} />)}
              {extraTagCount > 0 && (
                <span className="text-xs text-muted-foreground">+{extraTagCount}</span>
              )}
              {(faqCount > 0 || ruleCount > 0) && (
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {faqCount > 0 && `${faqCount} FAQ`}
                  {faqCount > 0 && ruleCount > 0 && ' · '}
                  {ruleCount > 0 && `${ruleCount} Kural`}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isPrimitive && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
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
