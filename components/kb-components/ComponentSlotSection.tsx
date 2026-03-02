'use client';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent, ComponentSlot } from '@/lib/types';
import { ComponentSketchCanvas } from './ComponentSketchCanvas';

interface ComponentSlotSectionProps {
  comp: KbComponent;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
}

export function ComponentSlotSection({ comp, selectedSlotId, onSelectSlot }: ComponentSlotSectionProps) {
  const upsertComponent = useKbStore.useUpsertComponent();

  const updateSlots = (updated: ComponentSlot[]) =>
    upsertComponent({ ...comp, slots: updated });

  const updateComp = (patch: Partial<KbComponent>) =>
    upsertComponent({ ...comp, ...patch });

  return (
    <ComponentSketchCanvas
      comp={comp}
      selectedSlotId={selectedSlotId}
      onSelectSlot={onSelectSlot}
      onUpdateSlots={updateSlots}
      onUpdateComp={updateComp}
    />
  );
}
