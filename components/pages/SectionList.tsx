'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKbStore } from '@/stores/kbStore';
import type { PageSection } from '@/lib/types';
import { TextSection } from './sections/TextSection';
import { FaqSection } from './sections/FaqSection';
import { RulesSection } from './sections/RulesSection';
import { ComponentsSection } from './sections/ComponentsSection';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

function SectionRenderer({
  section,
  nodeId,
}: {
  section: PageSection;
  nodeId: string;
}) {
  switch (section.type) {
    case 'text':       return <TextSection section={section} nodeId={nodeId} />;
    case 'faq':        return <FaqSection section={section} nodeId={nodeId} />;
    case 'rules':      return <RulesSection section={section} nodeId={nodeId} />;
    case 'components': return <ComponentsSection section={section} nodeId={nodeId} />;
  }
}

interface SortableSectionProps {
  section: PageSection;
  nodeId: string;
}

function SortableSection({ section, nodeId }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const deletePageSection = useKbStore.useDeletePageSection();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'border border-border rounded-lg p-4 bg-background group',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          aria-label="Sırayı değiştir"
        >
          <IconGripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <SectionRenderer section={section} nodeId={nodeId} />
        </div>
        <button
          type="button"
          onClick={() => deletePageSection(nodeId, section.id)}
          className="mt-0.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Section sil"
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}

interface SectionListProps {
  nodeId: string;
  sections: PageSection[];
}

export function SectionList({ nodeId, sections }: SectionListProps) {
  const reorderPageSections = useKbStore.useReorderPageSections();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex(s => s.id === active.id);
    const newIndex = sorted.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));
    reorderPageSections(nodeId, reordered);
  };

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        Henüz section yok. Yukarıdan ekleyin.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sorted.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sorted.map(section => (
            <SortableSection key={section.id} section={section} nodeId={nodeId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
