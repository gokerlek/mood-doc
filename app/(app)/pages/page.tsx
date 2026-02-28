'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { buttonVariants } from '@/components/ui/button';
import { IconSitemap, IconLayoutDashboard } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function PagesPage() {
  const data = useKbStore.useData();

  if (!data) return null;

  const parentIds = new Set(
    data.map.nodes
      .map(n => n.parent_id)
      .filter((id): id is string => id != null)
  );
  const leafNodes = data.map.nodes.filter(n => !parentIds.has(n.id));

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconLayoutDashboard size={20} className="text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Sayfalar</h1>
            <p className="text-sm text-muted-foreground">
              Map&apos;teki her leaf node bir sayfadır.
            </p>
          </div>
        </div>
        <Link
          href="/map"
          className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-1')}
        >
          <IconSitemap size={14} />
          Map&apos;e Git
        </Link>
      </div>

      {leafNodes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Henüz sayfa yok. Map&apos;e node ekleyerek başlayın.
        </p>
      ) : (
        <div className="space-y-2">
          {leafNodes.map(node => (
            <PageCard key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
