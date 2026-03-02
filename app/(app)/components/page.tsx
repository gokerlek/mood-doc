'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { Button } from '@/components/ui/button';
import { IconAtom, IconLock, IconPlus, IconPuzzle } from '@tabler/icons-react';

export default function ComponentsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();

  if (!data) return null;

  const handleCreate = () => {
    const comp = emptyComponent();
    upsertComponent(comp);
    router.push(`/components/${comp.id}`);
  };

  const primitives = data.components.filter(c => (c.component_type ?? 'composite') === 'primitive');
  const composites = data.components.filter(c => (c.component_type ?? 'composite') === 'composite');

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconPuzzle size={20} className="text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Componentler</h1>
            <p className="text-sm text-muted-foreground">
              Client-UI widget ve componentlerini buradan tanımlayın.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <IconPlus size={14} />
          Yeni Component
        </Button>
      </div>

      {primitives.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <IconAtom size={14} className="text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Atomlar</p>
            <IconLock size={11} className="text-muted-foreground/60" />
          </div>
          <div className="space-y-2">
            {primitives.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        </div>
      )}

      <div>
        {primitives.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <IconPuzzle size={14} className="text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Componentler</p>
          </div>
        )}
        {composites.length > 0 ? (
          <div className="space-y-2">
            {composites.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Henüz composite component yok. &ldquo;Yeni Component&rdquo; ile başlayın.
          </p>
        )}
      </div>
    </div>
  );
}
