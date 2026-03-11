'use client';
import Link from 'next/link';
import type { MapNodeData } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from '@/components/tags/TagBadge';
import { Card } from '@/components/ui/card';
import { IconLayoutDashboard, IconLayoutColumns, IconChevronRight } from '@tabler/icons-react';

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
    <Link href={`/pages/${node.id}`} className="block group">
      <Card className="py-0 gap-0 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
            <IconLayoutDashboard size={16} className="text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {node.label}
            </p>
            {node.page_data?.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {node.page_data.description}
              </p>
            )}
            {(visibleTags.length > 0 || sectionCount > 0) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {visibleTags.map(t => <TagBadge key={t.id} label={t.label} />)}
                {extraTagCount > 0 && (
                  <span className="text-xs text-muted-foreground">+{extraTagCount}</span>
                )}
                {sectionCount > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground ml-auto">
                    <IconLayoutColumns size={11} />{sectionCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Chevron */}
          <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
            <IconChevronRight size={14} className="text-muted-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
