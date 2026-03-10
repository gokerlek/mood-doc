'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { PageHeader } from '@/components/shared/PageHeader';
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
    <div className="p-6 max-w-5xl space-y-8">
      <PageHeader
        icon={<IconLayoutDashboard size={22} className="text-primary" />}
        title="Sayfalar"
        description="Map'teki her leaf node bir sayfadır. Map'ten node ekleyerek sayfa oluşturun."
        action={
          <Link
            href="/map"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}
          >
            <IconSitemap size={14} />
            Map&apos;e Git
          </Link>
        }
      />

      {leafNodes.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
          <IconLayoutDashboard size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Henüz sayfa yok.</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
            Sayfalar, haritadaki leaf node&apos;lardan (başka node&apos;ların parent&apos;ı olmayan node&apos;lar) otomatik oluşur.
          </p>
          <Link
            href="/map"
            className={cn(buttonVariants({ variant: 'default' }), 'gap-1.5')}
          >
            <IconSitemap size={14} />
            Haritaya Git
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconLayoutDashboard size={14} className="text-primary" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Sayfalar
            </p>
            <span className="text-[10px] text-muted-foreground ml-1">{leafNodes.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leafNodes.map(node => (
              <PageCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
