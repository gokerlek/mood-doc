'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { emptyPageData } from '@/lib/defaults';
import { TagSelector } from '@/components/tags/TagSelector';
import { SectionList } from '@/components/pages/SectionList';
import { AddSectionPalette } from '@/components/pages/AddSectionPalette';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageDetailProps {
  params: Promise<{ id: string }>;
}

export default function PageDetailPage({ params }: PageDetailProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const updatePageData = useKbStore.useUpdatePageData();

  if (!data) return null;

  const node = data.map.nodes.find(n => n.id === id);
  if (!node) return notFound();

  const pageData = node.page_data ?? emptyPageData();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Link
        href="/pages"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft size={14} />
        Sayfalar
      </Link>

      <h1 className="text-xl font-semibold">{node.label}</h1>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Sayfa Açıklaması</p>
          <Textarea
            value={pageData.description}
            onChange={e => updatePageData(id, { ...pageData, description: e.target.value })}
            placeholder="Bu sayfa ne işe yarar?..."
            rows={3}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Taglar</p>
          <TagSelector
            selectedIds={pageData.tag_ids}
            onChange={tag_ids => updatePageData(id, { ...pageData, tag_ids })}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-sm">İçerik Section&apos;ları</h2>
          <AddSectionPalette nodeId={id} currentSections={pageData.sections} />
        </div>
        <SectionList nodeId={id} sections={pageData.sections} />
      </div>
    </div>
  );
}
