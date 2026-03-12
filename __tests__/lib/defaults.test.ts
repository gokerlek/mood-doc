import { describe, it, expect } from 'vitest';
import {
  emptyFaq,
  emptyRule,
  emptyGlossaryTerm,
  emptyPropDef,
  emptySlot,
  emptyVariant,
  emptyCondition,
  emptyComponent,
  emptyTagCategory,
  emptyTag,
  emptyPageSection,
  emptyPageData,
  SEED_PRIMITIVES,
  emptyKnowledgeBase,
} from '@/lib/defaults';

// UUID regex
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('emptyFaq', () => {
  it('returns a unique id on each call', () => {
    const a = emptyFaq();
    const b = emptyFaq();
    expect(a.id).toMatch(UUID_RE);
    expect(b.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('defaults context to { type: "global" }', () => {
    const faq = emptyFaq();
    expect(faq.context).toEqual({ type: 'global' });
  });

  it('accepts a custom context', () => {
    const ctx = { type: 'component' as const, component_id: 'x' };
    const faq = emptyFaq(ctx);
    expect(faq.context).toEqual(ctx);
  });

  it('initialises question, answer and tag_ids as empty', () => {
    const faq = emptyFaq();
    expect(faq.question).toBe('');
    expect(faq.answer).toBe('');
    expect(faq.tag_ids).toEqual([]);
  });
});

describe('emptyRule', () => {
  it('returns a unique id on each call', () => {
    const a = emptyRule();
    const b = emptyRule();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('defaults context to { type: "global" }', () => {
    expect(emptyRule().context).toEqual({ type: 'global' });
  });

  it('accepts a custom context', () => {
    const ctx = { type: 'component' as const, component_id: 'y' };
    expect(emptyRule(ctx).context).toEqual(ctx);
  });

  it('initialises title, description and tag_ids as empty', () => {
    const rule = emptyRule();
    expect(rule.title).toBe('');
    expect(rule.description).toBe('');
    expect(rule.tag_ids).toEqual([]);
  });
});

describe('emptyGlossaryTerm', () => {
  it('returns a unique id on each call', () => {
    const a = emptyGlossaryTerm();
    const b = emptyGlossaryTerm();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('term and definition are empty strings', () => {
    const term = emptyGlossaryTerm();
    expect(term.term).toBe('');
    expect(term.definition).toBe('');
  });
});

describe('emptyPropDef', () => {
  it('returns a unique id on each call', () => {
    const a = emptyPropDef();
    const b = emptyPropDef();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('type is "string" and required is false', () => {
    const prop = emptyPropDef();
    expect(prop.type).toBe('string');
    expect(prop.required).toBe(false);
  });

  it('name and description are empty strings', () => {
    const prop = emptyPropDef();
    expect(prop.name).toBe('');
    expect(prop.description).toBe('');
  });
});

describe('emptySlot', () => {
  it('returns a unique id on each call', () => {
    const a = emptySlot();
    const b = emptySlot();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('zone is "body" with correct layout defaults', () => {
    const slot = emptySlot();
    expect(slot.zone).toBe('body');
    expect(slot.x).toBe(20);
    expect(slot.y).toBe(20);
    expect(slot.w).toBe(160);
    expect(slot.h).toBe(36);
  });

  it('props, component_ids and prop_bindings are empty arrays', () => {
    const slot = emptySlot();
    expect(slot.props).toEqual([]);
    expect(slot.component_ids).toEqual([]);
    expect(slot.prop_bindings).toEqual([]);
  });
});

describe('emptyVariant', () => {
  it('returns a unique id on each call', () => {
    const a = emptyVariant();
    const b = emptyVariant();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('name and description are empty strings', () => {
    const v = emptyVariant();
    expect(v.name).toBe('');
    expect(v.description).toBe('');
  });
});

describe('emptyCondition', () => {
  it('returns a unique id on each call', () => {
    const a = emptyCondition();
    const b = emptyCondition();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('propId and propValue are empty strings', () => {
    const cond = emptyCondition();
    expect(cond.propId).toBe('');
    expect(cond.propValue).toBe('');
  });
});

describe('emptyComponent', () => {
  it('returns a unique id on each call', () => {
    const a = emptyComponent();
    const b = emptyComponent();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('component_type is "composite"', () => {
    expect(emptyComponent().component_type).toBe('composite');
  });

  it('has_header and has_footer are false', () => {
    const c = emptyComponent();
    expect(c.has_header).toBe(false);
    expect(c.has_footer).toBe(false);
  });

  it('frame dimensions are 480x320', () => {
    const c = emptyComponent();
    expect(c.frame_width).toBe(480);
    expect(c.frame_height).toBe(320);
  });

  it('all array fields are empty', () => {
    const c = emptyComponent();
    expect(c.tag_ids).toEqual([]);
    expect(c.faq_ids).toEqual([]);
    expect(c.rule_ids).toEqual([]);
    expect(c.props).toEqual([]);
    expect(c.variants).toEqual([]);
    expect(c.conditions).toEqual([]);
    expect(c.slots).toEqual([]);
  });
});

describe('emptyTagCategory', () => {
  it('returns a unique id on each call', () => {
    const a = emptyTagCategory();
    const b = emptyTagCategory();
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('label is an empty string', () => {
    expect(emptyTagCategory().label).toBe('');
  });
});

describe('emptyTag', () => {
  it('returns a unique id on each call', () => {
    const a = emptyTag('cat-1');
    const b = emptyTag('cat-1');
    expect(a.id).toMatch(UUID_RE);
    expect(a.id).not.toBe(b.id);
  });

  it('stores the provided category_id', () => {
    expect(emptyTag('cat-42').category_id).toBe('cat-42');
  });

  it('label defaults to empty string', () => {
    expect(emptyTag('cat-1').label).toBe('');
  });

  it('accepts an explicit label', () => {
    expect(emptyTag('cat-1', 'my-label').label).toBe('my-label');
  });
});

describe('emptyPageSection', () => {
  it('text section has correct shape', () => {
    const s = emptyPageSection('text', 0);
    expect(s.id).toMatch(UUID_RE);
    expect(s.type).toBe('text');
    expect(s.order).toBe(0);
    expect((s as Extract<typeof s, { type: 'text' }>).content).toBe('');
  });

  it('faq section has correct shape', () => {
    const s = emptyPageSection('faq', 1);
    expect(s.type).toBe('faq');
    expect(s.order).toBe(1);
    expect((s as Extract<typeof s, { type: 'faq' }>).faq_ids).toEqual([]);
  });

  it('rules section has correct shape', () => {
    const s = emptyPageSection('rules', 2);
    expect(s.type).toBe('rules');
    expect(s.order).toBe(2);
    expect((s as Extract<typeof s, { type: 'rules' }>).rule_ids).toEqual([]);
  });

  it('components section has correct shape', () => {
    const s = emptyPageSection('components', 3);
    expect(s.type).toBe('components');
    expect(s.order).toBe(3);
    expect((s as Extract<typeof s, { type: 'components' }>).component_ids).toEqual([]);
  });

  it('each call produces a unique id', () => {
    const a = emptyPageSection('text', 0);
    const b = emptyPageSection('text', 0);
    expect(a.id).not.toBe(b.id);
  });
});

describe('emptyPageData', () => {
  it('frame dimensions are 480x320', () => {
    const pd = emptyPageData();
    expect(pd.frame_width).toBe(480);
    expect(pd.frame_height).toBe(320);
  });

  it('description is an empty string', () => {
    expect(emptyPageData().description).toBe('');
  });

  it('all array fields are empty', () => {
    const pd = emptyPageData();
    expect(pd.tag_ids).toEqual([]);
    expect(pd.sections).toEqual([]);
    expect(pd.canvas_slots).toEqual([]);
    expect(pd.faq_ids).toEqual([]);
    expect(pd.rule_ids).toEqual([]);
    expect(pd.props).toEqual([]);
  });
});

describe('SEED_PRIMITIVES', () => {
  it('has exactly 13 entries', () => {
    expect(SEED_PRIMITIVES).toHaveLength(13);
  });

  it('every entry has component_type "primitive"', () => {
    for (const p of SEED_PRIMITIVES) {
      expect(p.component_type).toBe('primitive');
    }
  });

  it('all ids are unique', () => {
    const ids = SEED_PRIMITIVES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes seed-prim-button', () => {
    const ids = SEED_PRIMITIVES.map((p) => p.id);
    expect(ids).toContain('seed-prim-button');
  });
});

describe('emptyKnowledgeBase', () => {
  it('schema_version is "4.0"', () => {
    expect(emptyKnowledgeBase()._meta.schema_version).toBe('4.0');
  });

  it('components equals SEED_PRIMITIVES (same length and ids)', () => {
    const kb = emptyKnowledgeBase();
    expect(kb.components).toHaveLength(SEED_PRIMITIVES.length);
    kb.components.forEach((c, i) => {
      expect(c.id).toBe(SEED_PRIMITIVES[i]!.id);
    });
  });

  it('components array is a copy, not the same reference', () => {
    const kb = emptyKnowledgeBase();
    expect(kb.components).not.toBe(SEED_PRIMITIVES);
  });

  it('map has empty nodes and edges', () => {
    const kb = emptyKnowledgeBase();
    expect(kb.map.nodes).toEqual([]);
    expect(kb.map.edges).toEqual([]);
  });

  it('all other top-level arrays are empty', () => {
    const kb = emptyKnowledgeBase();
    expect(kb.tag_categories).toEqual([]);
    expect(kb.tags).toEqual([]);
    expect(kb.faq).toEqual([]);
    expect(kb.rules).toEqual([]);
    expect(kb.glossary).toEqual([]);
  });

  it('last_updated is an ISO date string', () => {
    const { last_updated } = emptyKnowledgeBase()._meta;
    expect(() => new Date(last_updated).toISOString()).not.toThrow();
    expect(last_updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
