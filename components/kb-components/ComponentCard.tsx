'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent } from '@/lib/types';
import { TagBadge } from '@/components/tags/TagBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IconAtom, IconPuzzle, IconLayoutColumns,
  IconTrash,
  IconMessageCircle, IconShieldCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ComponentCardProps {
  component: KbComponent;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const data = useKbStore.useData();
  const deleteComponent = useKbStore.useDeleteComponent();

  const isPrimitive = component.component_type === 'primitive';
  const isSection = component.component_type === 'section';

  const tags = (data?.tags ?? []).filter(t => component.tag_ids?.includes(t.id) ?? false);
  const faqCount = component.faq_ids.length;
  const ruleCount = component.rule_ids.length;
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  const href = isSection ? `/sections/${component.id}` : `/components/${component.id}`;
  const Icon = isPrimitive ? IconAtom : isSection ? IconLayoutColumns : IconPuzzle;
  const iconClass = isPrimitive
    ? 'bg-muted text-muted-foreground'
    : 'bg-primary/10 text-primary';

  return (
    <>
      <Card className="group py-0 gap-0 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', iconClass)}>
            <Icon size={16} />
          </div>

          {/* Content — navigates on click */}
          <Link href={href} className="flex-1 min-w-0 space-y-1.5">
            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {component.name || 'İsimsiz Component'}
            </p>
            {component.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {component.description}
              </p>
            )}
            {(visibleTags.length > 0 || faqCount > 0 || ruleCount > 0) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {visibleTags.map(t => <TagBadge key={t.id} label={t.label} />)}
                {extraTagCount > 0 && (
                  <span className="text-xs text-muted-foreground">+{extraTagCount}</span>
                )}
                {(faqCount > 0 || ruleCount > 0) && (
                  <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
                    {faqCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <IconMessageCircle size={11} />{faqCount}
                      </span>
                    )}
                    {ruleCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <IconShieldCheck size={11} />{ruleCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </Link>

          {/* Actions */}
          <div className="flex flex-col items-center gap-0.5 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
            {!isPrimitive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                aria-label="Component sil"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-auto p-1"
              >
                <IconTrash size={14} />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {!isPrimitive && (
        <ConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            deleteComponent(component.id);
            setConfirmOpen(false);
            toast.success('Silindi');
          }}
          title="Component silinsin mi?"
          description="Bu işlem geri alınamaz. Bu component'e ait FAQ ve kurallar listede kalır."
        />
      )}
    </>
  );
}
