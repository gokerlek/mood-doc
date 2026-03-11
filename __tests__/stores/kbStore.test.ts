import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { useKbStore } from '@/stores/kbStore';
import {
  emptyKnowledgeBase,
  emptyFaq,
  emptyRule,
  emptyTag,
  emptyTagCategory,
  emptyGlossaryTerm,
  emptyComponent,
  emptyPageData,
} from '@/lib/defaults';
import type { MapNodeData, MapEdgeData, PageSection, PageData } from '@/lib/types';

// Mock localStorage for zustand persist
beforeAll(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

beforeEach(() => {
  useKbStore.setState({ data: null, isDirty: false, isSaving: false });
});

function seedStore() {
  useKbStore.getState().setData(emptyKnowledgeBase());
}

function makeNode(id: string, overrides: Partial<MapNodeData> = {}): MapNodeData {
  return { id, label: `Node ${id}`, x: 0, y: 0, ...overrides };
}

function makeEdge(id: string, source: string, target: string, overrides: Partial<MapEdgeData> = {}): MapEdgeData {
  return { id, source, target, ...overrides };
}

// ---------------------------------------------------------------------------
// setData
// ---------------------------------------------------------------------------
describe('setData', () => {
  it('sets data and isDirty=false', () => {
    const kb = emptyKnowledgeBase();
    useKbStore.getState().setData(kb);
    const state = useKbStore.getState();
    expect(state.data).not.toBeNull();
    expect(state.isDirty).toBe(false);
  });

  it('filters out seed-prim-header and seed-prim-footer from components', () => {
    const kb = emptyKnowledgeBase();
    kb.components.push({ ...emptyComponent(), id: 'seed-prim-header' });
    kb.components.push({ ...emptyComponent(), id: 'seed-prim-footer' });
    useKbStore.getState().setData(kb);
    const ids = useKbStore.getState().data!.components.map((c) => c.id);
    expect(ids).not.toContain('seed-prim-header');
    expect(ids).not.toContain('seed-prim-footer');
  });

  it('applies frame_width default of 480 when missing', () => {
    const kb = emptyKnowledgeBase();
    const comp = { ...emptyComponent(), id: 'c1' };
    (comp as Record<string, unknown>).frame_width = undefined;
    kb.components = [comp];
    useKbStore.getState().setData(kb);
    const stored = useKbStore.getState().data!.components.find((c) => c.id === 'c1');
    expect(stored?.frame_width).toBe(480);
  });

  it('applies frame_height default of 320 when missing', () => {
    const kb = emptyKnowledgeBase();
    const comp = { ...emptyComponent(), id: 'c2' };
    (comp as Record<string, unknown>).frame_height = undefined;
    kb.components = [comp];
    useKbStore.getState().setData(kb);
    const stored = useKbStore.getState().data!.components.find((c) => c.id === 'c2');
    expect(stored?.frame_height).toBe(320);
  });

  it('preserves existing frame_width when set', () => {
    const kb = emptyKnowledgeBase();
    kb.components = [{ ...emptyComponent(), id: 'c3', frame_width: 1200 }];
    useKbStore.getState().setData(kb);
    const stored = useKbStore.getState().data!.components.find((c) => c.id === 'c3');
    expect(stored?.frame_width).toBe(1200);
  });

  it('migrates slots with w < 2 to pixel coordinates', () => {
    const kb = emptyKnowledgeBase();
    kb.components = [{
      ...emptyComponent(),
      id: 'c1',
      frame_width: 480,
      frame_height: 320,
      slots: [{
        id: 's1', name: 'main', description: '', props: [], component_ids: [],
        prop_bindings: [], zone: 'body', x: 0.1, y: 0.1, w: 0.5, h: 0.25,
      }],
    }];
    useKbStore.getState().setData(kb);
    const slot = useKbStore.getState().data!.components.find((c) => c.id === 'c1')!.slots[0]!;
    expect(slot.x).toBe(Math.round(0.1 * 480));
    expect(slot.y).toBe(Math.round(0.1 * 320));
    expect(slot.w).toBe(Math.round(0.5 * 480));
    expect(slot.h).toBe(Math.round(0.25 * 320));
  });

  it('does not migrate slots with w >= 2', () => {
    const kb = emptyKnowledgeBase();
    kb.components = [{
      ...emptyComponent(),
      id: 'c1',
      frame_width: 480,
      frame_height: 320,
      slots: [{
        id: 's1', name: 'main', description: '', props: [], component_ids: [],
        prop_bindings: [], zone: 'body', x: 50, y: 50, w: 160, h: 36,
      }],
    }];
    useKbStore.getState().setData(kb);
    const slot = useKbStore.getState().data!.components.find((c) => c.id === 'c1')!.slots[0]!;
    expect(slot.x).toBe(50);
    expect(slot.y).toBe(50);
    expect(slot.w).toBe(160);
    expect(slot.h).toBe(36);
  });

  it('migrates slot with w exactly 0 (< 2) applying defaults', () => {
    const kb = emptyKnowledgeBase();
    kb.components = [{
      ...emptyComponent(),
      id: 'c1',
      frame_width: 480,
      frame_height: 320,
      slots: [{
        id: 's1', name: 'main', description: '', props: [], component_ids: [],
        prop_bindings: [], zone: 'body', x: 0, y: 0, w: 0, h: 0,
      }],
    }];
    useKbStore.getState().setData(kb);
    const slot = useKbStore.getState().data!.components.find((c) => c.id === 'c1')!.slots[0]!;
    // w=0 < 2 triggers migration; 0 ?? 0.35 = 0 (not null/undefined), so 0 * 480 = 0
    expect(slot.w).toBe(0);
    expect(slot.h).toBe(0);
  });

  it('slot keeps zone default "body" when zone is missing', () => {
    const kb = emptyKnowledgeBase();
    kb.components = [{
      ...emptyComponent(),
      id: 'c1',
      frame_width: 480,
      frame_height: 320,
      slots: [{
        id: 's1', name: 'main', description: '', props: [], component_ids: [],
        prop_bindings: [], zone: undefined as unknown as 'body', x: 50, y: 50, w: 160, h: 36,
      }],
    }];
    useKbStore.getState().setData(kb);
    const slot = useKbStore.getState().data!.components.find((c) => c.id === 'c1')!.slots[0]!;
    expect(slot.zone).toBe('body');
  });
});

// ---------------------------------------------------------------------------
// setIsSaving
// ---------------------------------------------------------------------------
describe('setIsSaving', () => {
  it('sets isSaving to true', () => {
    useKbStore.getState().setIsSaving(true);
    expect(useKbStore.getState().isSaving).toBe(true);
  });

  it('sets isSaving to false', () => {
    useKbStore.setState({ isSaving: true });
    useKbStore.getState().setIsSaving(false);
    expect(useKbStore.getState().isSaving).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resetDirty
// ---------------------------------------------------------------------------
describe('resetDirty', () => {
  it('sets isDirty to false when it was true', () => {
    useKbStore.setState({ isDirty: true });
    useKbStore.getState().resetDirty();
    expect(useKbStore.getState().isDirty).toBe(false);
  });

  it('keeps isDirty false when already false', () => {
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().resetDirty();
    expect(useKbStore.getState().isDirty).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tag Categories
// ---------------------------------------------------------------------------
describe('upsertTagCategory', () => {
  it('creates a new tag category and sets isDirty=true', () => {
    seedStore();
    const cat = { ...emptyTagCategory(), id: 'cat-1', label: 'UX' };
    useKbStore.getState().upsertTagCategory(cat);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    const found = state.data!.tag_categories.find((c) => c.id === 'cat-1');
    expect(found).toBeDefined();
    expect(found!.label).toBe('UX');
  });

  it('updates an existing tag category', () => {
    seedStore();
    const cat = { ...emptyTagCategory(), id: 'cat-1', label: 'Old' };
    useKbStore.getState().upsertTagCategory(cat);
    useKbStore.getState().upsertTagCategory({ id: 'cat-1', label: 'New' });
    const found = useKbStore.getState().data!.tag_categories.find((c) => c.id === 'cat-1');
    expect(found!.label).toBe('New');
    expect(useKbStore.getState().data!.tag_categories.filter((c) => c.id === 'cat-1').length).toBe(1);
  });
});

describe('deleteTagCategory', () => {
  it('removes the category and sets isDirty=true', () => {
    seedStore();
    const cat = { ...emptyTagCategory(), id: 'cat-1', label: 'UX' };
    useKbStore.getState().upsertTagCategory(cat);
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteTagCategory('cat-1');
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.tag_categories.find((c) => c.id === 'cat-1')).toBeUndefined();
  });

  it('cascades: removes all tags with matching category_id', () => {
    seedStore();
    const cat = { ...emptyTagCategory(), id: 'cat-1', label: 'UX' };
    useKbStore.getState().upsertTagCategory(cat);
    const tag1 = { ...emptyTag('cat-1'), id: 'tag-1' };
    const tag2 = { ...emptyTag('cat-1'), id: 'tag-2' };
    const tag3 = { ...emptyTag('cat-other'), id: 'tag-3' };
    useKbStore.getState().upsertTag(tag1);
    useKbStore.getState().upsertTag(tag2);
    useKbStore.getState().upsertTag(tag3);
    useKbStore.getState().deleteTagCategory('cat-1');
    const tags = useKbStore.getState().data!.tags;
    expect(tags.find((t) => t.id === 'tag-1')).toBeUndefined();
    expect(tags.find((t) => t.id === 'tag-2')).toBeUndefined();
    expect(tags.find((t) => t.id === 'tag-3')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------
describe('upsertTag', () => {
  it('creates a new tag and sets isDirty=true', () => {
    seedStore();
    const tag = { ...emptyTag('cat-1'), id: 'tag-1', label: 'Accessibility' };
    useKbStore.getState().upsertTag(tag);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.tags.find((t) => t.id === 'tag-1')?.label).toBe('Accessibility');
  });

  it('updates an existing tag', () => {
    seedStore();
    const tag = { ...emptyTag('cat-1'), id: 'tag-1', label: 'Old' };
    useKbStore.getState().upsertTag(tag);
    useKbStore.getState().upsertTag({ id: 'tag-1', label: 'New', category_id: 'cat-1' });
    const tags = useKbStore.getState().data!.tags.filter((t) => t.id === 'tag-1');
    expect(tags.length).toBe(1);
    expect(tags[0]!.label).toBe('New');
  });
});

describe('deleteTag', () => {
  it('removes a tag and sets isDirty=true', () => {
    seedStore();
    const tag = { ...emptyTag('cat-1'), id: 'tag-1' };
    useKbStore.getState().upsertTag(tag);
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteTag('tag-1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.tags.find((t) => t.id === 'tag-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
describe('upsertComponent', () => {
  it('creates a new component and sets isDirty=true', () => {
    seedStore();
    const comp = { ...emptyComponent(), id: 'comp-1', name: 'Card' };
    useKbStore.getState().upsertComponent(comp);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.components.find((c) => c.id === 'comp-1')?.name).toBe('Card');
  });

  it('updates an existing component', () => {
    seedStore();
    const comp = { ...emptyComponent(), id: 'comp-1', name: 'Old' };
    useKbStore.getState().upsertComponent(comp);
    useKbStore.getState().upsertComponent({ ...comp, name: 'New' });
    const comps = useKbStore.getState().data!.components.filter((c) => c.id === 'comp-1');
    expect(comps.length).toBe(1);
    expect(comps[0]!.name).toBe('New');
  });
});

describe('deleteComponent', () => {
  it('removes a component and sets isDirty=true', () => {
    seedStore();
    const comp = { ...emptyComponent(), id: 'comp-1' };
    useKbStore.getState().upsertComponent(comp);
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteComponent('comp-1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.components.find((c) => c.id === 'comp-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Map Nodes
// ---------------------------------------------------------------------------
describe('upsertNode', () => {
  it('creates a new node and sets isDirty=true', () => {
    seedStore();
    const node = makeNode('n1', { label: 'Home' });
    useKbStore.getState().upsertNode(node);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.map.nodes.find((n) => n.id === 'n1')?.label).toBe('Home');
  });

  it('updates an existing node', () => {
    seedStore();
    useKbStore.getState().upsertNode(makeNode('n1', { label: 'Old' }));
    useKbStore.getState().upsertNode(makeNode('n1', { label: 'New' }));
    const nodes = useKbStore.getState().data!.map.nodes.filter((n) => n.id === 'n1');
    expect(nodes.length).toBe(1);
    expect(nodes[0]!.label).toBe('New');
  });
});

describe('deleteNode', () => {
  it('removes a node and sets isDirty=true', () => {
    seedStore();
    useKbStore.getState().upsertNode(makeNode('n1'));
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteNode('n1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n1')).toBeUndefined();
  });

  it('cascades: removes all edges where node is source or target', () => {
    seedStore();
    useKbStore.getState().upsertNode(makeNode('n1'));
    useKbStore.getState().upsertNode(makeNode('n2'));
    useKbStore.getState().upsertNode(makeNode('n3'));
    useKbStore.getState().upsertEdge(makeEdge('e1', 'n1', 'n2'));
    useKbStore.getState().upsertEdge(makeEdge('e2', 'n2', 'n1'));
    useKbStore.getState().upsertEdge(makeEdge('e3', 'n2', 'n3'));
    useKbStore.getState().deleteNode('n1');
    const edges = useKbStore.getState().data!.map.edges;
    expect(edges.find((e) => e.id === 'e1')).toBeUndefined();
    expect(edges.find((e) => e.id === 'e2')).toBeUndefined();
    expect(edges.find((e) => e.id === 'e3')).toBeDefined();
  });
});

describe('updatePageData', () => {
  it('updates page_data on the specified node and sets isDirty=true', () => {
    seedStore();
    useKbStore.getState().upsertNode(makeNode('n1'));
    useKbStore.setState({ isDirty: false });
    const pd: PageData = { ...emptyPageData(), description: 'My page' };
    useKbStore.getState().updatePageData('n1', pd);
    expect(useKbStore.getState().isDirty).toBe(true);
    const node = useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n1');
    expect(node?.page_data?.description).toBe('My page');
  });

  it('does not affect other nodes', () => {
    seedStore();
    useKbStore.getState().upsertNode(makeNode('n1'));
    useKbStore.getState().upsertNode(makeNode('n2'));
    const pd: PageData = { ...emptyPageData(), description: 'Only n1' };
    useKbStore.getState().updatePageData('n1', pd);
    const n2 = useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n2');
    expect(n2?.page_data).toBeUndefined();
  });
});

describe('upsertPageSection', () => {
  it('adds a new section to node page_data and sets isDirty=true', () => {
    seedStore();
    const pd: PageData = { ...emptyPageData(), sections: [] };
    useKbStore.getState().upsertNode(makeNode('n1', { page_data: pd }));
    useKbStore.setState({ isDirty: false });
    const section: PageSection = { id: 'sec-1', type: 'text', order: 0, content: 'Hello' };
    useKbStore.getState().upsertPageSection('n1', section);
    expect(useKbStore.getState().isDirty).toBe(true);
    const node = useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n1');
    expect(node?.page_data?.sections).toHaveLength(1);
    expect(node?.page_data?.sections[0]!.id).toBe('sec-1');
  });

  it('updates an existing section', () => {
    seedStore();
    const sec: PageSection = { id: 'sec-1', type: 'text', order: 0, content: 'Old' };
    const pd: PageData = { ...emptyPageData(), sections: [sec] };
    useKbStore.getState().upsertNode(makeNode('n1', { page_data: pd }));
    const updated: PageSection = { id: 'sec-1', type: 'text', order: 0, content: 'New' };
    useKbStore.getState().upsertPageSection('n1', updated);
    const node = useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n1');
    const sections = node?.page_data?.sections ?? [];
    expect(sections.filter((s) => s.id === 'sec-1').length).toBe(1);
    expect((sections.find((s) => s.id === 'sec-1')! as Record<string, unknown>).content).toBe('New');
  });
});

describe('deletePageSection', () => {
  it('removes a section from node and sets isDirty=true', () => {
    seedStore();
    const sec: PageSection = { id: 'sec-1', type: 'text', order: 0, content: 'Hello' };
    const pd: PageData = { ...emptyPageData(), sections: [sec] };
    useKbStore.getState().upsertNode(makeNode('n1', { page_data: pd }));
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deletePageSection('n1', 'sec-1');
    expect(useKbStore.getState().isDirty).toBe(true);
    const node = useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n1');
    expect(node?.page_data?.sections).toHaveLength(0);
  });
});

describe('reorderPageSections', () => {
  it('replaces sections array with new order and sets isDirty=true', () => {
    seedStore();
    const sec1: PageSection = { id: 'sec-1', type: 'text', order: 0, content: 'A' };
    const sec2: PageSection = { id: 'sec-2', type: 'text', order: 1, content: 'B' };
    const pd: PageData = { ...emptyPageData(), sections: [sec1, sec2] };
    useKbStore.getState().upsertNode(makeNode('n1', { page_data: pd }));
    useKbStore.setState({ isDirty: false });
    const reordered: PageSection[] = [
      { id: 'sec-2', type: 'text', order: 0, content: 'B' },
      { id: 'sec-1', type: 'text', order: 1, content: 'A' },
    ];
    useKbStore.getState().reorderPageSections('n1', reordered);
    expect(useKbStore.getState().isDirty).toBe(true);
    const node = useKbStore.getState().data!.map.nodes.find((n) => n.id === 'n1');
    expect(node?.page_data?.sections[0]!.id).toBe('sec-2');
    expect(node?.page_data?.sections[1]!.id).toBe('sec-1');
  });
});

// ---------------------------------------------------------------------------
// Map Edges
// ---------------------------------------------------------------------------
describe('upsertEdge', () => {
  it('creates a new edge and sets isDirty=true', () => {
    seedStore();
    const edge = makeEdge('e1', 'n1', 'n2');
    useKbStore.getState().upsertEdge(edge);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.map.edges.find((e) => e.id === 'e1')).toBeDefined();
  });

  it('updates an existing edge', () => {
    seedStore();
    useKbStore.getState().upsertEdge(makeEdge('e1', 'n1', 'n2'));
    useKbStore.getState().upsertEdge(makeEdge('e1', 'n1', 'n3'));
    const edges = useKbStore.getState().data!.map.edges.filter((e) => e.id === 'e1');
    expect(edges.length).toBe(1);
    expect(edges[0]!.target).toBe('n3');
  });
});

describe('deleteEdge', () => {
  it('removes an edge and sets isDirty=true', () => {
    seedStore();
    useKbStore.getState().upsertEdge(makeEdge('e1', 'n1', 'n2'));
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteEdge('e1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.map.edges.find((e) => e.id === 'e1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
describe('upsertFaq', () => {
  it('creates a new FAQ and sets isDirty=true', () => {
    seedStore();
    const faq = { ...emptyFaq(), id: 'faq-1', question: 'What?', answer: 'This.' };
    useKbStore.getState().upsertFaq(faq);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    const found = state.data!.faq.find((f) => f.id === 'faq-1');
    expect(found?.question).toBe('What?');
  });

  it('updates an existing FAQ', () => {
    seedStore();
    const faq = { ...emptyFaq(), id: 'faq-1', question: 'Old?', answer: 'Old.' };
    useKbStore.getState().upsertFaq(faq);
    useKbStore.getState().upsertFaq({ ...faq, question: 'New?' });
    const faqs = useKbStore.getState().data!.faq.filter((f) => f.id === 'faq-1');
    expect(faqs.length).toBe(1);
    expect(faqs[0]!.question).toBe('New?');
  });
});

describe('deleteFaq', () => {
  it('removes a FAQ and sets isDirty=true', () => {
    seedStore();
    const faq = { ...emptyFaq(), id: 'faq-1' };
    useKbStore.getState().upsertFaq(faq);
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteFaq('faq-1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.faq.find((f) => f.id === 'faq-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------
describe('upsertRule', () => {
  it('creates a new rule and sets isDirty=true', () => {
    seedStore();
    const rule = { ...emptyRule(), id: 'rule-1', title: 'No spam' };
    useKbStore.getState().upsertRule(rule);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.rules.find((r) => r.id === 'rule-1')?.title).toBe('No spam');
  });

  it('updates an existing rule', () => {
    seedStore();
    const rule = { ...emptyRule(), id: 'rule-1', title: 'Old' };
    useKbStore.getState().upsertRule(rule);
    useKbStore.getState().upsertRule({ ...rule, title: 'New' });
    const rules = useKbStore.getState().data!.rules.filter((r) => r.id === 'rule-1');
    expect(rules.length).toBe(1);
    expect(rules[0]!.title).toBe('New');
  });
});

describe('deleteRule', () => {
  it('removes a rule and sets isDirty=true', () => {
    seedStore();
    const rule = { ...emptyRule(), id: 'rule-1' };
    useKbStore.getState().upsertRule(rule);
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteRule('rule-1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.rules.find((r) => r.id === 'rule-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------
describe('upsertGlossaryTerm', () => {
  it('creates a new glossary term and sets isDirty=true', () => {
    seedStore();
    const term = { ...emptyGlossaryTerm(), id: 'gl-1', term: 'API', definition: 'Interface' };
    useKbStore.getState().upsertGlossaryTerm(term);
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.glossary.find((g) => g.id === 'gl-1')?.term).toBe('API');
  });

  it('updates an existing glossary term', () => {
    seedStore();
    const term = { ...emptyGlossaryTerm(), id: 'gl-1', term: 'Old', definition: 'Def' };
    useKbStore.getState().upsertGlossaryTerm(term);
    useKbStore.getState().upsertGlossaryTerm({ ...term, term: 'New' });
    const terms = useKbStore.getState().data!.glossary.filter((g) => g.id === 'gl-1');
    expect(terms.length).toBe(1);
    expect(terms[0]!.term).toBe('New');
  });
});

describe('deleteGlossaryTerm', () => {
  it('removes a glossary term and sets isDirty=true', () => {
    seedStore();
    const term = { ...emptyGlossaryTerm(), id: 'gl-1' };
    useKbStore.getState().upsertGlossaryTerm(term);
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().deleteGlossaryTerm('gl-1');
    expect(useKbStore.getState().isDirty).toBe(true);
    expect(useKbStore.getState().data!.glossary.find((g) => g.id === 'gl-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Agent Behavior
// ---------------------------------------------------------------------------
describe('updateAgentBehavior', () => {
  it('patches agent_behavior fields and sets isDirty=true', () => {
    seedStore();
    useKbStore.setState({ isDirty: false });
    useKbStore.getState().updateAgentBehavior({ tone: 'formal', max_answer_sentences: 5 });
    const state = useKbStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.data!.agent_behavior.tone).toBe('formal');
    expect(state.data!.agent_behavior.max_answer_sentences).toBe(5);
  });

  it('only updates provided fields, preserving others', () => {
    seedStore();
    const original = useKbStore.getState().data!.agent_behavior;
    useKbStore.getState().updateAgentBehavior({ tone: 'formal' });
    const updated = useKbStore.getState().data!.agent_behavior;
    expect(updated.fallback_message).toBe(original.fallback_message);
    expect(updated.escalation_message).toBe(original.escalation_message);
    expect(updated.max_answer_sentences).toBe(original.max_answer_sentences);
  });

  it('patches escalation_triggers', () => {
    seedStore();
    useKbStore.getState().updateAgentBehavior({ escalation_triggers: ['angry', 'refund'] });
    const ab = useKbStore.getState().data!.agent_behavior;
    expect(ab.escalation_triggers).toEqual(['angry', 'refund']);
  });
});

// ---------------------------------------------------------------------------
// No-op when data is null
// ---------------------------------------------------------------------------
describe('no-op when data is null', () => {
  it('upsertFaq does not crash and data stays null', () => {
    expect(useKbStore.getState().data).toBeNull();
    expect(() => useKbStore.getState().upsertFaq({ ...emptyFaq(), id: 'x' })).not.toThrow();
    expect(useKbStore.getState().data).toBeNull();
  });

  it('deleteFaq does not crash and data stays null', () => {
    expect(() => useKbStore.getState().deleteFaq('x')).not.toThrow();
    expect(useKbStore.getState().data).toBeNull();
  });

  it('upsertTag does not crash', () => {
    expect(() => useKbStore.getState().upsertTag({ ...emptyTag('c'), id: 'x' })).not.toThrow();
  });

  it('deleteTag does not crash', () => {
    expect(() => useKbStore.getState().deleteTag('x')).not.toThrow();
  });

  it('upsertTagCategory does not crash', () => {
    expect(() => useKbStore.getState().upsertTagCategory({ id: 'x', label: 'X' })).not.toThrow();
  });

  it('deleteTagCategory does not crash', () => {
    expect(() => useKbStore.getState().deleteTagCategory('x')).not.toThrow();
  });

  it('upsertComponent does not crash', () => {
    expect(() => useKbStore.getState().upsertComponent({ ...emptyComponent(), id: 'x' })).not.toThrow();
  });

  it('deleteComponent does not crash', () => {
    expect(() => useKbStore.getState().deleteComponent('x')).not.toThrow();
  });

  it('upsertNode does not crash', () => {
    expect(() => useKbStore.getState().upsertNode(makeNode('x'))).not.toThrow();
  });

  it('deleteNode does not crash', () => {
    expect(() => useKbStore.getState().deleteNode('x')).not.toThrow();
  });

  it('upsertEdge does not crash', () => {
    expect(() => useKbStore.getState().upsertEdge(makeEdge('e1', 'n1', 'n2'))).not.toThrow();
  });

  it('deleteEdge does not crash', () => {
    expect(() => useKbStore.getState().deleteEdge('x')).not.toThrow();
  });

  it('upsertRule does not crash', () => {
    expect(() => useKbStore.getState().upsertRule({ ...emptyRule(), id: 'x' })).not.toThrow();
  });

  it('deleteRule does not crash', () => {
    expect(() => useKbStore.getState().deleteRule('x')).not.toThrow();
  });

  it('upsertGlossaryTerm does not crash', () => {
    expect(() => useKbStore.getState().upsertGlossaryTerm({ ...emptyGlossaryTerm(), id: 'x' })).not.toThrow();
  });

  it('deleteGlossaryTerm does not crash', () => {
    expect(() => useKbStore.getState().deleteGlossaryTerm('x')).not.toThrow();
  });

  it('updateAgentBehavior does not crash', () => {
    expect(() => useKbStore.getState().updateAgentBehavior({ tone: 'formal' })).not.toThrow();
  });

  it('updatePageData does not crash', () => {
    expect(() => useKbStore.getState().updatePageData('n1', emptyPageData())).not.toThrow();
  });

  it('upsertPageSection does not crash', () => {
    const sec: PageSection = { id: 'sec-1', type: 'text', order: 0, content: 'x' };
    expect(() => useKbStore.getState().upsertPageSection('n1', sec)).not.toThrow();
  });

  it('deletePageSection does not crash', () => {
    expect(() => useKbStore.getState().deletePageSection('n1', 'sec-1')).not.toThrow();
  });

  it('reorderPageSections does not crash', () => {
    expect(() => useKbStore.getState().reorderPageSections('n1', [])).not.toThrow();
  });
});
