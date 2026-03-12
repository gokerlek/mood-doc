'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { DriverCard } from '@/components/survey/DriverCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { Button } from '@/components/ui/button';
import { useDriverActions } from '@/hooks/useDriverActions';
import { useSearchParam } from '@/hooks/useSearchParam';
import { IconRoute, IconPlus } from '@tabler/icons-react';

export default function DriversPage() {
  const data = useKbStore.useData();
  const { createDriver, removeDriver } = useDriverActions();
  const router = useRouter();
  const [search] = useSearchParam('q');
  const [activeTag, setActiveTag] = useSearchParam('tag');

  const allTagIds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.survey_drivers.flatMap(d => d.tag_ids))].sort();
  }, [data]);

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.survey_drivers
    .filter(d => !activeTag || d.tag_ids.includes(activeTag))
    .filter(d => !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));

  const handleCreate = () => {
    const driver = createDriver();
    router.push(`/drivers/${driver.id}`);
  };

  return (
    <ListPageLayout
      icon={<IconRoute size={22} className="text-primary" />}
      title="Driverlar"
      description="Likert sorularının ölçtüğü boyutlar."
      action={<Button onClick={handleCreate}><IconPlus size={14} /> Yeni Driver</Button>}
      maxWidth="5xl"
    >
      <div className="flex flex-col gap-3">
        <SearchBar placeholder="Driver ara..." />
        <TagFilterBar tagIds={allTagIds} tags={data.tags} activeTag={activeTag} onSelect={setActiveTag} />
      </div>

      {data.survey_drivers.length === 0 ? (
        <EmptyState
          icon={<IconRoute size={28} />}
          title="Henüz driver yok."
          action={<Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">İlk driver&apos;ı ekle →</Button>}
        />
      ) : filtered.length === 0 ? (
        <NoResults message="Eşleşen driver bulunamadı." onClear={() => setActiveTag('')} clearLabel="Filtreyi temizle" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(driver => (
            <DriverCard key={driver.id} driver={driver} onDelete={removeDriver} />
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
