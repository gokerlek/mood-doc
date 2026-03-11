'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SectionListHeader } from '@/components/shared/SectionListHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useLeafNodes } from '@/hooks/useLeafNodes';
import { buttonVariants } from '@/components/ui/button';
import { IconSitemap, IconLayoutDashboard } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function PagesPage() {
  const data = useKbStore.useData();
  const [search, setSearch] = useSearchParam('q');
  const leafNodes = useLeafNodes();

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = leafNodes.filter(n => !q || n.label.toLowerCase().includes(q));

  return (
    <ListPageLayout
      icon={<IconLayoutDashboard size={22} className="text-primary" />}
      title="Sayfalar"
      description="Map'teki her leaf node bir sayfadır. Map'ten node ekleyerek sayfa oluşturun."
      action={
        <Link href="/map" className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}>
          <IconSitemap size={14} />
          Map&apos;e Git
        </Link>
      }
      maxWidth="5xl"
    >
      {leafNodes.length === 0 ? (
        <EmptyState
          icon={<IconLayoutDashboard size={32} />}
          title="Henüz sayfa yok."
          description="Sayfalar, haritadaki leaf node'lardan otomatik oluşur."
          action={
            <Link href="/map" className={cn(buttonVariants({ variant: 'default' }), 'gap-1.5 mt-2')}>
              <IconSitemap size={14} />
              Haritaya Git
            </Link>
          }
        />
      ) : (
        <>
          <SearchBar placeholder="Sayfa ara..." />

          {filtered.length > 0 ? (
            <div>
              <SectionListHeader
                icon={<IconLayoutDashboard size={14} className="text-primary" />}
                label="Sayfalar"
                count={filtered.length}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(node => (
                  <PageCard key={node.id} node={node} />
                ))}
              </div>
            </div>
          ) : (
            <NoResults message="Eşleşen sayfa bulunamadı." onClear={() => setSearch('')} />
          )}
        </>
      )}
    </ListPageLayout>
  );
}
