'use client';
import Link from 'next/link';
import type { MapNodeData } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from '@/components/tags/TagBadge';
import { Badge } from '@/components/ui/badge';
import { IconLayoutDashboard, IconChevronRight } from '@tabler/icons-react';

interface PageCardProps {
  node: MapNodeData;
}

export function PageCard({ node }: PageCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => node.page_data?.tag_ids?.includes(t.id) ?? false);
  const sectionCount = node.page_data?.sections.length ?? 0;
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <Link
      href={`/pages/${node.id}`}
      className="flex items-center justify-between bg-card border border-border border-l-4 border-l-primary/60 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-150 group"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0 p-4">
        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
          <IconLayoutDashboard size={16} className="text-primary" />
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-foreground">{node.label}</p>
            {sectionCount > 0 && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-medium">
                {sectionCount} section
              </Badge>
            )}
          </div>
          {node.page_data?.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {node.page_data.description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleTags.map(t => <TagBadge key={t.id} label={t.label} />)}
              {extraTagCount > 0 && (
                <span className="text-xs text-muted-foreground">+{extraTagCount}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="pr-3">
        <IconChevronRight
          size={14}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </Link>
  );
}
