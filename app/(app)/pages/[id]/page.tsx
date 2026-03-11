'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useKbStore } from '@/stores/kbStore';
import { emptyPageData } from '@/lib/defaults';
import type { ComponentSlot } from '@/lib/types';
import { ComponentPalette } from '@/components/kb-components/ComponentPalette';
import { PageSketchCanvas } from '@/components/pages/PageSketchCanvas';
import { PageRightPanel } from '@/components/pages/PageRightPanel';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageDetailProps {
  params: Promise<{ id: string }>;
}

export default function PageDetailPage({ params }: PageDetailProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const updatePageData = useKbStore.useUpdatePageData();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [activeDragName, setActiveDragName] = useState<string>('');
  const sensors = useSensors(useSensor(PointerSensor));

  if (!data) return null;

  const node = data.map.nodes.find(n => n.id === id);
  if (!node) return notFound();

  const pageData = node.page_data ?? emptyPageData();
  const slots: ComponentSlot[] = pageData.canvas_slots ?? [];
  const frameWidth = pageData.frame_width ?? 480;
  const frameHeight = pageData.frame_height ?? 320;

  const pickable = data.components.filter(
    c => c.component_type === 'primitive' || c.component_type === 'composite' || c.component_type === 'section'
  );

  const handleDragStart = (event: DragStartEvent) => {
    const name = event.active.data.current?.componentName as string | undefined;
    setActiveDragName(name ?? '');
  };

  const handleDragEnd = () => {
    setActiveDragName('');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar — DndContext dışında */}
      <div className="shrink-0 px-4 py-2 border-b border-border flex items-center gap-3">
        <Link
          href="/pages"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          Sayfalar
        </Link>
        <span className="text-sm font-semibold">{node.label}</span>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Component palette */}
          <div className="w-56 shrink-0 border-r border-border overflow-y-auto">
            <ComponentPalette components={pickable} />
          </div>

          {/* Middle: Canvas */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <PageSketchCanvas
              slots={slots}
              frameWidth={frameWidth}
              frameHeight={frameHeight}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
              onUpdateSlots={updated =>
                updatePageData(id, { ...pageData, canvas_slots: updated })
              }
              onUpdateFrame={patch =>
                updatePageData(id, { ...pageData, ...patch })
              }
            />
          </div>

          {/* Right: Page metadata + slot bindings + props */}
          <div className="w-96 shrink-0 border-l border-border overflow-hidden">
            <PageRightPanel
              nodeId={id}
              nodeLabel={node.label}
              pageData={pageData}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
          </div>
        </div>

        <DragOverlay>
          {activeDragName && (
            <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded shadow-lg">
              {activeDragName}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
