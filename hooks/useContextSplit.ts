import type { KbItemContext } from '@/lib/types';

export function contextSplit<T>(
  items: T[],
  getType: (item: T) => KbItemContext['type']
): { global: T[]; page: T[]; component: T[] } {
  return {
    global: items.filter(i => getType(i) === 'global'),
    page: items.filter(i => getType(i) === 'page'),
    component: items.filter(i => getType(i) === 'component'),
  };
}
