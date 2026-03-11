'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { PageHeader } from '@/components/shared/PageHeader';
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

  const allTags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.components.forEach(c => c.tag_ids.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
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
    <div className="flex flex-col min-h-full">
      {/* Full-width header */}
        <PageHeader
          icon={<IconPuzzle size={22} className="text-primary" />}
          title="Componentler"
          description="Client-UI widget ve componentlerini buradan tanımlayın."
          action={
            <Button onClick={handleCreate}>
              <IconPlus size={14} />
              Yeni Component
            </Button>
          }
        />

      {/* Centered content */}
      <div className="px-6 py-6 w-full max-w-5xl mx-auto space-y-8">
        {/* Search + tag filter */}
        <div className="flex flex-col gap-3">
          <SearchBar placeholder="Component ara..." />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={!activeTag ? 'default' : 'outline'}
                onClick={() => setActiveTag('')}
                className="rounded-full"
              >
                Tümü
              </Button>
              {allTags.map(tagId => {
                const tag = data.tags.find(t => t.id === tagId);
                return tag ? (
                  <Button
                    key={tagId}
                    size="sm"
                    variant={activeTag === tagId ? 'default' : 'outline'}
                    onClick={() => setActiveTag(activeTag === tagId ? '' : tagId)}
                    className="rounded-full"
                  >
                    {tag.label}
                  </Button>
                ) : null;
              })}
            </div>
          )}
        </div>

        {primitives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconAtom size={14} className="text-muted-foreground" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Atomlar
              </p>
              <IconLock size={10} className="text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground ml-1">{primitives.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {primitives.map(comp => (
                <ComponentCard key={comp.id} component={comp} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconPuzzle size={14} className="text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Composite Componentler
            </p>
            <span className="text-xs text-muted-foreground ml-1">{composites.length}</span>
          </div>
          {composites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {composites.map(comp => (
                <ComponentCard key={comp.id} component={comp} />
              ))}
            </div>
          ) : allComposites.length > 0 && activeTag ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              Bu etikete ait component yok.{' '}
              <Button variant="link" onClick={() => setActiveTag('')} className="p-0 h-auto">
                Filtreyi temizle
              </Button>
            </p>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
              <IconPuzzle size={28} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Henüz composite component yok.
              </p>
              <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
                İlk component&apos;i ekle →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
