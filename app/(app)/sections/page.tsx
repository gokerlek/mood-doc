'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SectionListHeader } from '@/components/shared/SectionListHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { Button } from '@/components/ui/button';
import { IconLayoutColumns, IconPlus } from '@tabler/icons-react';

export default function SectionsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const handleCreate = () => {
    const comp = { ...emptyComponent(), component_type: 'section' as const };
    upsertComponent(comp);
    router.push(`/sections/${comp.id}`);
  };

  const allSections = data.components.filter(c => c.component_type === 'section');
  const q = search.toLowerCase().trim();
  const sections = allSections.filter(
    c => !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
  );

  return (
    <ListPageLayout
      icon={<IconLayoutColumns size={22} className="text-primary" />}
      title="Layout Bileşenleri"
      description="Sayfaya yerleştirilen header, footer ve body bölümlerini (section) yönetin."
      action={
        <Button onClick={handleCreate}>
          <IconPlus size={14} />
          Yeni Layout Bileşeni
        </Button>
      }
      maxWidth="5xl"
    >
      {allSections.length === 0 ? (
        <EmptyState
          icon={<IconLayoutColumns size={28} />}
          title="Henüz layout bileşeni yok."
          action={
            <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
              İlk layout bileşenini ekle →
            </Button>
          }
        />
      ) : (
        <>
          <SearchBar placeholder="Layout bileşeni ara..." />

          {sections.length > 0 ? (
            <div>
              <SectionListHeader
                icon={<IconLayoutColumns size={14} className="text-primary" />}
                label="Layout Bileşenleri"
                count={sections.length}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map(comp => (
                  <ComponentCard key={comp.id} component={comp} />
                ))}
              </div>
            </div>
          ) : (
            <NoResults message="Eşleşen bileşen bulunamadı." onClear={() => setSearch('')} />
          )}
        </>
      )}
    </ListPageLayout>
  );
}
