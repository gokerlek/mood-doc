'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { DndContext, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { ComponentPalette } from '@/components/kb-components/ComponentPalette';
import { ComponentSlotSection } from '@/components/kb-components/ComponentSlotSection';
import { ComponentRightPanel } from '@/components/kb-components/ComponentRightPanel';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SectionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const [activeDragName, setActiveDragName] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  if (!data) return null;

  const comp = data.components.find(c => c.id === id);
  if (!comp) return notFound();

  const pickable = data.components.filter(
    c => c.component_type === 'primitive' || c.component_type === 'composite'
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link
          href="/sections"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          Layout Bileşenleri
        </Link>
      </div>

      {/* 3-kolon */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DndContext
          onDragStart={(e: DragStartEvent) =>
            setActiveDragName((e.active.data.current?.componentName as string | undefined) ?? '')
          }
          onDragEnd={() => setActiveDragName('')}
          onDragCancel={() => setActiveDragName('')}
        >
          {/* Sol: palette */}
          <div className="w-56 shrink-0 border-r border-border p-2 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
            <ComponentPalette components={pickable} />
          </div>

          {/* Orta: canvas */}
          <div className="flex-1 overflow-y-auto">
            <ComponentSlotSection
              comp={comp}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
          </div>

          {/* Sağ: metadata + tabs */}
          <div className="w-96 shrink-0 border-l border-border overflow-hidden">
            <ComponentRightPanel
              comp={comp}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
          </div>

          <DragOverlay>
            {activeDragName && (
              <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded shadow-lg pointer-events-none">
                {activeDragName}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
