'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { IconSitemap, IconLayoutDashboard } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function PagesPage() {
  const data = useKbStore.useData();
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const parentIds = new Set(
    data.map.nodes
      .map(n => n.parent_id)
      .filter((id): id is string => id != null)
  );
  const leafNodes = data.map.nodes.filter(n => !parentIds.has(n.id));

  const q = search.toLowerCase().trim();
  const filtered = leafNodes.filter(n => !q || n.label.toLowerCase().includes(q));

  return (
    <div className="flex flex-col min-h-full">
      {/* Full-width header */}
      <div className="px-6 py-6 border-b border-border">
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
          className="pb-0 mb-0 border-b-0"
        />
      </div>

      {/* Centered content */}
      <div className="px-6 py-6 w-full max-w-5xl mx-auto space-y-5">
        {leafNodes.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
            <IconLayoutDashboard size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Henüz sayfa yok.</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
              Sayfalar, haritadaki leaf node&apos;lardan otomatik oluşur.
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
          <>
            <SearchBar placeholder="Sayfa ara..." />

            {filtered.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <IconLayoutDashboard size={14} className="text-primary" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Sayfalar
                  </p>
                  <span className="text-xs text-muted-foreground ml-1">{filtered.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(node => (
                    <PageCard key={node.id} node={node} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-sm text-muted-foreground">
                Eşleşen sayfa bulunamadı.{' '}
                <Button variant="link" onClick={() => setSearch('')} className="p-0 h-auto">
                  Temizle
                </Button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
