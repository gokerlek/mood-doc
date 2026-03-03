import type { ComponentSlot } from '@/lib/types';

/**
 * Shared slot binding logic reused by ComponentRightPanel and PageRightPanel.
 * The caller provides `onCommit` which persists the updated slots array.
 */
export function useSlotBindings(
  slots: ComponentSlot[],
  onCommit: (updated: ComponentSlot[]) => void,
  selectedSlotId?: string | null,
  onSelectSlot?: (id: string | null) => void,
) {
  const updateBinding = (slotId: string, childPropName: string, parentPropId: string) => {
    const updated = slots.map(s => {
      if (s.id !== slotId) return s;
      const existing = (s.prop_bindings ?? []).filter(b => b.childPropName !== childPropName);
      const newBindings = parentPropId
        ? [...existing, { childPropName, parentPropId }]
        : existing;
      return { ...s, prop_bindings: newBindings };
    });
    onCommit(updated);
  };

  const deleteSlot = (slotId: string) => {
    onCommit(slots.filter(s => s.id !== slotId));
    if (selectedSlotId === slotId) onSelectSlot?.(null);
  };

  return { updateBinding, deleteSlot };
}
