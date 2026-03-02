'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { Button } from '@/components/ui/button';
import { IconLayoutColumns, IconPlus } from '@tabler/icons-react';

export default function SectionsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();

  if (!data) return null;

  const handleCreate = () => {
    const comp = { ...emptyComponent(), component_type: 'section' as const };
    upsertComponent(comp);
    router.push(`/components/${comp.id}`);
  };

  const sections = data.components.filter(c => c.component_type === 'section');

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconLayoutColumns size={20} className="text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Sections</h1>
            <p className="text-sm text-muted-foreground">
              Sayfa bölümlerini (section) buradan tanımlayın.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <IconPlus size={14} />
          Yeni Section
        </Button>
      </div>

      <div>
        {sections.length > 0 ? (
          <div className="space-y-2">
            {sections.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Henüz section yok. &ldquo;Yeni Section&rdquo; ile başlayın.
          </p>
        )}
      </div>
    </div>
  );
}
