'use client';
import Link from 'next/link';
import type { MapNodeData } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from '@/components/tags/TagBadge';
import { IconLayoutDashboard, IconChevronRight } from '@tabler/icons-react';

interface PageCardProps {
  node: MapNodeData;
}

export function PageCard({ node }: PageCardProps) {
  const data = useKbStore.useData();
  const tags = data?.tags.filter(t => node.page_data?.tag_ids.includes(t.id)) ?? [];
  const sectionCount = node.page_data?.sections.length ?? 0;

  return (
    <Link
      href={`/pages/${node.id}`}
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <IconLayoutDashboard size={18} className="text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium text-sm">{node.label}</p>
          {node.page_data?.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {node.page_data.description}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-1">
              {tags.map(t => <TagBadge key={t.id} label={t.label} />)}
            </div>
            {sectionCount > 0 && (
              <span className="text-[11px] text-muted-foreground">{sectionCount} section</span>
            )}
          </div>
        </div>
      </div>
      <IconChevronRight
        size={14}
        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </Link>
  );
}
