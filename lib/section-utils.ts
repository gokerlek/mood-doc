import { arrayMove } from '@dnd-kit/sortable';

/**
 * Move an item from `fromIndex` to `toIndex` and reassign `.order`
 * so every item has a consecutive 0-based index.
 */
export function reorderWithIndex<T extends { order: number }>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (fromIndex === toIndex) return items;
  return arrayMove(items, fromIndex, toIndex).map((item, i) => ({ ...item, order: i }));
}
