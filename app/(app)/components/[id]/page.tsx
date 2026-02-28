'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { TagSelector } from '@/components/tags/TagSelector';
import { ComponentFaqSection } from '@/components/kb-components/ComponentFaqSection';
import { ComponentRuleSection } from '@/components/kb-components/ComponentRuleSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ComponentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();

  if (!data) return null;

  const comp = data.components.find(c => c.id === id);
  if (!comp) return notFound();

  const update = (patch: Partial<typeof comp>) =>
    upsertComponent({ ...comp, ...patch });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Link
        href="/components"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft size={14} />
        Componentler
      </Link>

      <div className="space-y-4">
        <Input
          value={comp.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="Component adı..."
          className="text-lg font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        />
        <Textarea
          value={comp.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="Ne işe yarar, nasıl kullanılır..."
          rows={3}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
          <TagSelector
            selectedIds={comp.tag_ids}
            onChange={tag_ids => update({ tag_ids })}
          />
        </div>
      </div>

      <Separator />
      <ComponentFaqSection componentId={id} faqIds={comp.faq_ids} />

      <Separator />
      <ComponentRuleSection componentId={id} ruleIds={comp.rule_ids} />
    </div>
  );
}
