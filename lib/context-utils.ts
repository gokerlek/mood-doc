import type { KbItemContext, MapNodeData, KbComponent } from '@/lib/types';

/**
 * Returns a human-readable label for an item's context.
 * Always returns a non-empty string:
 *   'global'    → 'Genel'
 *   'page'      → 'Sayfa: <label>' (falls back to node_id if node not found)
 *   'component' → 'Component: <name>' (falls back to component_id if not found)
 */
export function contextLabel(
  context: KbItemContext,
  leafNodes: MapNodeData[],
  components: KbComponent[],
): string {
  if (context.type === 'global') return 'Genel';
  if (context.type === 'page') {
    const node = leafNodes.find(n => n.id === context.node_id);
    return node ? `Sayfa: ${node.label}` : `Sayfa: ${context.node_id}`;
  }
  if (context.type === 'component') {
    const comp = components.find(c => c.id === context.component_id);
    return comp ? `Component: ${comp.name}` : `Component: ${context.component_id}`;
  }
  return 'Genel';
}
