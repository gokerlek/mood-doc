'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { PageHeader } from '@/components/shared/PageHeader';
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
    router.push(`/sections/${comp.id}`);
  };

  const sections = data.components.filter(c => c.component_type === 'section');

  return (
    <div className="flex flex-col min-h-full">
      {/* Full-width header */}
      <div className="px-6 py-6 border-b border-border">
        <PageHeader
          icon={<IconLayoutColumns size={22} className="text-primary" />}
          title="Layout Bileşenleri"
          description="Sayfaya yerleştirilen header, footer ve body bölümlerini (section) yönetin."
          action={
            <Button onClick={handleCreate}>
              <IconPlus size={14} />
              Yeni Layout Bileşeni
            </Button>
          }
          className="pb-0 mb-0 border-b-0"
        />
      </div>

      {/* Centered content */}
      <div className="px-6 py-6 w-full max-w-5xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconLayoutColumns size={14} className="text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Layout Bileşenleri
            </p>
            <span className="text-xs text-muted-foreground ml-1">{sections.length}</span>
          </div>
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map(comp => (
                <ComponentCard key={comp.id} component={comp} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
              <IconLayoutColumns size={28} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Henüz layout bileşeni yok.
              </p>
              <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
                İlk layout bileşenini ekle →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
