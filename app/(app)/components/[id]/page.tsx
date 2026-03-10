'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { DndContext, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { ComponentPalette } from '@/components/kb-components/ComponentPalette';
import { ComponentSlotSection } from '@/components/kb-components/ComponentSlotSection';
import { ComponentPrimitiveSection } from '@/components/kb-components/ComponentPrimitiveSection';
import { ComponentRightPanel } from '@/components/kb-components/ComponentRightPanel';
import { IconArrowLeft, IconCube } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ComponentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const [activeDragName, setActiveDragName] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  if (!data) return null;

  const comp = data.components.find(c => c.id === id);
  if (!comp) return notFound();

  const isPrimitive = comp.component_type === 'primitive';
  const backHref = comp.component_type === 'section' ? '/sections' : '/components';
  const backLabel = comp.component_type === 'section' ? 'Layout Bileşenleri' : 'Componentler';

  const pickable = data.components.filter(
    c => c.component_type === 'primitive' || c.component_type === 'composite'
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          {backLabel}
        </Link>
      </div>

      {/* 3-kolon */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {isPrimitive ? (
          <>
            {/* Sol: atom info */}
            <div className="w-56 shrink-0 border-r border-border flex flex-col items-center justify-center gap-2 text-center p-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <IconCube size={20} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-medium">Atom Bileşen</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bu bileşen standart bir atom&apos;dur. Composite bileşenlerin
                paletinde görünür.
              </p>
            </div>

            {/* Orta: primitive props/variants/conditions */}
            <div className="flex-1 overflow-y-auto p-4">
              <ComponentPrimitiveSection comp={comp} />
            </div>

            {/* Sağ: metadata + tabs */}
            <div className="w-80 shrink-0 border-l border-border overflow-hidden">
              <ComponentRightPanel comp={comp} />
            </div>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}
