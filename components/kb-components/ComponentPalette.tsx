'use client';
import { useDraggable } from '@dnd-kit/core';
import type { KbComponent } from '@/lib/types';

interface DraggableItemProps {
  component: KbComponent;
}

function DraggableItem({ component }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.id}`,
    data: {
      componentId: component.id,
      componentName: component.name,
      componentType: component.component_type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0 : 1 }}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-grab active:cursor-grabbing hover:bg-muted transition-colors select-none"
    >
      <span className="text-[10px] text-muted-foreground w-10 shrink-0">
        {component.component_type === 'primitive' ? 'atom' : 'comp'}
      </span>
      <span className="truncate">{component.name || 'İsimsiz'}</span>
    </div>
  );
}

interface ComponentPaletteProps {
  components: KbComponent[];
}

export function ComponentPalette({ components }: ComponentPaletteProps) {
  const primitives = components.filter(c => c.component_type === 'primitive');
  const composites = components.filter(c => c.component_type === 'composite');

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-2 pb-1">
        Bileşenler
      </p>
      <div className="flex-1 overflow-y-auto pb-1">
        {primitives.map(c => <DraggableItem key={c.id} component={c} />)}
        {composites.length > 0 && primitives.length > 0 && (
          <div className="mx-2 my-1 border-t border-border" />
        )}
        {composites.map(c => <DraggableItem key={c.id} component={c} />)}
        {components.length === 0 && (
          <p className="text-[10px] text-muted-foreground px-2 py-1">Henüz bileşen yok</p>
        )}
      </div>
    </div>
  );
}
