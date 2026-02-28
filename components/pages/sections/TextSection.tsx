'use client';
import { useKbStore } from '@/stores/kbStore';
import { Textarea } from '@/components/ui/textarea';
import type { PageSection } from '@/lib/types';

interface TextSectionProps {
  section: Extract<PageSection, { type: 'text' }>;
  nodeId: string;
}

export function TextSection({ section, nodeId }: TextSectionProps) {
  const upsertPageSection = useKbStore.useUpsertPageSection();

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        Metin
      </p>
      <Textarea
        value={section.content}
        onChange={e => upsertPageSection(nodeId, { ...section, content: e.target.value })}
        placeholder="İçerik yazın..."
        rows={4}
      />
    </div>
  );
}
