import { describe, it, expect } from 'vitest';
import { contextLabel } from '@/lib/context-utils';
import type { MapNodeData, KbComponent } from '@/lib/types';

// ── minimal fixtures ──────────────────────────────────────────────────────────

const leafNodes: MapNodeData[] = [
  { id: 'node-1', label: 'Ana Sayfa', x: 0, y: 0 },
  { id: 'node-2', label: 'Ürünler',   x: 0, y: 0 },
];

const components: KbComponent[] = [
  {
    id: 'comp-1', name: 'Header', description: '', component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], props: [], variants: [], conditions: [], slots: [],
  },
  {
    id: 'comp-2', name: 'Footer', description: '', component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], props: [], variants: [], conditions: [], slots: [],
  },
];

// ── global context ────────────────────────────────────────────────────────────

describe('contextLabel — global', () => {
  it('returns "Genel" for global context', () => {
    expect(contextLabel({ type: 'global' }, leafNodes, components)).toBe('Genel');
  });

  it('returns "Genel" regardless of leafNodes/components content', () => {
    expect(contextLabel({ type: 'global' }, [], [])).toBe('Genel');
  });
});

// ── page context ──────────────────────────────────────────────────────────────

describe('contextLabel — page', () => {
  it('returns "Sayfa: <label>" when node is found', () => {
    expect(contextLabel({ type: 'page', node_id: 'node-1' }, leafNodes, components))
      .toBe('Sayfa: Ana Sayfa');
  });

  it('returns "Sayfa: <label>" for any matching node', () => {
    expect(contextLabel({ type: 'page', node_id: 'node-2' }, leafNodes, components))
      .toBe('Sayfa: Ürünler');
  });

  it('falls back to node_id when node is not found', () => {
    expect(contextLabel({ type: 'page', node_id: 'unknown-node' }, leafNodes, components))
      .toBe('Sayfa: unknown-node');
  });

  it('falls back to node_id when leafNodes is empty', () => {
    expect(contextLabel({ type: 'page', node_id: 'node-1' }, [], components))
      .toBe('Sayfa: node-1');
  });
});

// ── component context ─────────────────────────────────────────────────────────

describe('contextLabel — component', () => {
  it('returns "Component: <name>" when component is found', () => {
    expect(contextLabel({ type: 'component', component_id: 'comp-1' }, leafNodes, components))
      .toBe('Component: Header');
  });

  it('returns "Component: <name>" for any matching component', () => {
    expect(contextLabel({ type: 'component', component_id: 'comp-2' }, leafNodes, components))
      .toBe('Component: Footer');
  });

  it('falls back to component_id when component is not found', () => {
    expect(contextLabel({ type: 'component', component_id: 'unknown-comp' }, leafNodes, components))
      .toBe('Component: unknown-comp');
  });

  it('falls back to component_id when components list is empty', () => {
    expect(contextLabel({ type: 'component', component_id: 'comp-1' }, leafNodes, []))
      .toBe('Component: comp-1');
  });
});
