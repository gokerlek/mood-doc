import { describe, it, expect, vi } from 'vitest';
import { useSlotBindings } from '@/hooks/useSlotBindings';
import type { ComponentSlot } from '@/lib/types';

const makeSlot = (override: Partial<ComponentSlot> = {}): ComponentSlot => ({
  id: 'slot-1',
  name: 'test',
  description: '',
  props: [],
  x: 0,
  y: 0,
  w: 100,
  h: 100,
  ...override,
});

// ── updateBinding ─────────────────────────────────────────────────────────────

describe('updateBinding', () => {
  it('adds a binding when none exists for that childPropName', () => {
    const slot = makeSlot({ id: 's1', prop_bindings: [] });
    const committed: ComponentSlot[][] = [];
    const { updateBinding } = useSlotBindings([slot], updated => committed.push(updated));

    updateBinding('s1', 'label', 'prop-uuid-1');

    expect(committed).toHaveLength(1);
    expect(committed[0]![0]!.prop_bindings).toEqual([
      { childPropName: 'label', parentPropId: 'prop-uuid-1' },
    ]);
  });

  it('replaces an existing binding for the same childPropName', () => {
    const slot = makeSlot({
      id: 's1',
      prop_bindings: [{ childPropName: 'label', parentPropId: 'old-id' }],
    });
    const committed: ComponentSlot[][] = [];
    const { updateBinding } = useSlotBindings([slot], updated => committed.push(updated));

    updateBinding('s1', 'label', 'new-id');

    expect(committed[0]![0]!.prop_bindings).toEqual([
      { childPropName: 'label', parentPropId: 'new-id' },
    ]);
  });

  it('removes binding when parentPropId is empty string', () => {
    const slot = makeSlot({
      id: 's1',
      prop_bindings: [{ childPropName: 'label', parentPropId: 'prop-uuid-1' }],
    });
    const committed: ComponentSlot[][] = [];
    const { updateBinding } = useSlotBindings([slot], updated => committed.push(updated));

    updateBinding('s1', 'label', '');

    expect(committed[0]![0]!.prop_bindings).toEqual([]);
  });

  it('leaves other slots unchanged when updating a specific slot', () => {
    const s1 = makeSlot({ id: 's1' });
    const s2 = makeSlot({ id: 's2', name: 'other' });
    const committed: ComponentSlot[][] = [];
    const { updateBinding } = useSlotBindings([s1, s2], updated => committed.push(updated));

    updateBinding('s1', 'title', 'prop-x');

    expect(committed[0]![1]).toBe(s2); // s2 reference unchanged
  });

  it('does not call onCommit with a changed array when slotId not found', () => {
    const slot = makeSlot({ id: 's1' });
    const committed: ComponentSlot[][] = [];
    const { updateBinding } = useSlotBindings([slot], updated => committed.push(updated));

    updateBinding('nonexistent', 'label', 'prop-uuid-1');

    // onCommit is still called but array items are unchanged
    expect(committed[0]).toEqual([slot]);
  });
});

// ── deleteSlot ────────────────────────────────────────────────────────────────

describe('deleteSlot', () => {
  it('removes the target slot and keeps others', () => {
    const s1 = makeSlot({ id: 's1' });
    const s2 = makeSlot({ id: 's2', name: 'other' });
    const committed: ComponentSlot[][] = [];
    const { deleteSlot } = useSlotBindings([s1, s2], updated => committed.push(updated));

    deleteSlot('s1');

    expect(committed[0]).toEqual([s2]);
  });

  it('calls onSelectSlot(null) when deleted slot is selected', () => {
    const slot = makeSlot({ id: 's1' });
    const onSelectSlot = vi.fn();
    const { deleteSlot } = useSlotBindings([slot], () => {}, 's1', onSelectSlot);

    deleteSlot('s1');

    expect(onSelectSlot).toHaveBeenCalledWith(null);
  });

  it('does not call onSelectSlot when a different slot is selected', () => {
    const s1 = makeSlot({ id: 's1' });
    const s2 = makeSlot({ id: 's2', name: 'other' });
    const onSelectSlot = vi.fn();
    const { deleteSlot } = useSlotBindings([s1, s2], () => {}, 's2', onSelectSlot);

    deleteSlot('s1');

    expect(onSelectSlot).not.toHaveBeenCalled();
  });

  it('does not call onSelectSlot when no selectedSlotId provided', () => {
    const slot = makeSlot({ id: 's1' });
    const onSelectSlot = vi.fn();
    const { deleteSlot } = useSlotBindings([slot], () => {}, undefined, onSelectSlot);

    deleteSlot('s1');

    expect(onSelectSlot).not.toHaveBeenCalled();
  });
});
