// lib/defaults.ts
import type {
  KbFaq, KbRule, KbGlossaryTerm, KbComponent,
  TagCategory, KbTag, PageSection, PageData, KnowledgeBase
} from './types';

export const emptyFaq = (context: KbFaq['context'] = { type: 'global' }): KbFaq => ({
  id: crypto.randomUUID(),
  question: '',
  answer: '',
  tag_ids: [],
  context,
});

export const emptyRule = (context: KbRule['context'] = { type: 'global' }): KbRule => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  tag_ids: [],
  context,
});

export const emptyGlossaryTerm = (): KbGlossaryTerm => ({
  id: crypto.randomUUID(),
  term: '',
  definition: '',
});

export const emptyComponent = (): KbComponent => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  tag_ids: [],
  faq_ids: [],
  rule_ids: [],
});

export const emptyTagCategory = (): TagCategory => ({
  id: crypto.randomUUID(),
  label: '',
});

export const emptyTag = (category_id: string, label = ''): KbTag => ({
  id: crypto.randomUUID(),
  label,
  category_id,
});

export const emptyPageSection = (type: PageSection['type'], order: number): PageSection => {
  switch (type) {
    case 'text':       return { id: crypto.randomUUID(), type: 'text',       order, content: '' };
    case 'faq':        return { id: crypto.randomUUID(), type: 'faq',        order, faq_ids: [] };
    case 'rules':      return { id: crypto.randomUUID(), type: 'rules',      order, rule_ids: [] };
    case 'components': return { id: crypto.randomUUID(), type: 'components', order, component_ids: [] };
  }
};

export const emptyPageData = (): PageData => ({
  description: '',
  tag_ids: [],
  sections: [],
});

export const emptyKnowledgeBase = (): KnowledgeBase => ({
  _meta: {
    schema_version: '3.0',
    last_updated: new Date().toISOString(),
  },
  tag_categories: [],
  tags: [],
  components: [],
  map: { nodes: [], edges: [] },
  faq: [],
  rules: [],
  glossary: [],
  agent_behavior: {
    tone: 'friendly',
    fallback_message: '',
    escalation_message: '',
    max_answer_sentences: 3,
    escalation_triggers: [],
  },
});
