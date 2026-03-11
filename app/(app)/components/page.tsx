'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SectionListHeader } from '@/components/shared/SectionListHeader';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { Button } from '@/components/ui/button';
import { IconAtom, IconLock, IconPlus, IconPuzzle } from '@tabler/icons-react';

export default function ComponentsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();

  const [search] = useSearchParam('q');
  const [activeTag, setActiveTag] = useSearchParam('tag');

  const allTagIds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.components.flatMap(c => c.tag_ids))].sort();
  }, [data]);

  if (!data) return null;

  const handleCreate = () => {
    const comp = emptyComponent();
    upsertComponent(comp);
    router.push(`/components/${comp.id}`);
  };

  const allPrimitives = data.components.filter(c => (c.component_type ?? 'composite') === 'primitive');
  const allComposites = data.components.filter(c => (c.component_type ?? 'composite') === 'composite');

  const q = search.toLowerCase().trim();
  const primitives = allPrimitives
    .filter(c => !activeTag || c.tag_ids.includes(activeTag))
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
  const composites = allComposites
    .filter(c => !activeTag || c.tag_ids.includes(activeTag))
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));

  return (
    <ListPageLayout
      icon={<IconPuzzle size={22} className="text-primary" />}
      title="Componentler"
      description="Client-UI widget ve componentlerini buradan tanımlayın."
      action={
        <Button onClick={handleCreate}>
          <IconPlus size={14} />
          Yeni Component
        </Button>
      }
      maxWidth="5xl"
    >
      <div className="flex flex-col gap-3">
        <SearchBar placeholder="Component ara..." />
        <TagFilterBar
          tagIds={allTagIds}
          tags={data.tags}
          activeTag={activeTag}
          onSelect={setActiveTag}
        />
      </div>

      {primitives.length > 0 && (
        <div>
          <SectionListHeader
            icon={<IconAtom size={14} className="text-muted-foreground" />}
            label={
              <span className="flex items-center gap-1">
                Atomlar <IconLock size={10} className="text-muted-foreground/50" />
              </span>
            }
            count={primitives.length}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {primitives.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionListHeader
          icon={<IconPuzzle size={14} className="text-primary" />}
          label="Composite Componentler"
          count={composites.length}
        />
        {composites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {composites.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        ) : allComposites.length > 0 && activeTag ? (
          <NoResults
            message="Bu etikete ait component yok."
            onClear={() => setActiveTag('')}
            clearLabel="Filtreyi temizle"
          />
        ) : (
          <EmptyState
            icon={<IconPuzzle size={28} />}
            title="Henüz composite component yok."
            action={
              <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
                İlk component&apos;i ekle →
              </Button>
            }
          />
        )}
      </div>
    </ListPageLayout>
  );
}
