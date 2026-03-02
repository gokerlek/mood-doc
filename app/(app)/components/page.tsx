'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { PageHeader } from '@/components/shared/PageHeader';
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
    <div className="p-6 max-w-5xl space-y-8">
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

      {primitives.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconAtom size={14} className="text-muted-foreground" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Atomlar
            </p>
            <IconLock size={10} className="text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground ml-1">{primitives.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {primitives.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <IconPuzzle size={14} className="text-primary" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
            Composite Componentler
          </p>
          <span className="text-[10px] text-muted-foreground ml-1">{composites.length}</span>
        </div>
        {composites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {composites.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
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
  );
}
