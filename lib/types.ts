// lib/types.ts

// --- Map ---

export type SectionType = 'text' | 'faq' | 'rules' | 'components';

export interface PageSection {
  id: string;
  type: SectionType;
  order: number;
  // type === 'text'
  content?: string;
  // type === 'faq'
  faq_ids?: string[];
  // type === 'rules'
  rule_ids?: string[];
  // type === 'components'
  component_ids?: string[];
}

export interface PageData {
  description: string;
  tag_ids: string[];
  sections: PageSection[];
}

export interface MapNodeData {
  id: string;
  label: string;
  color?: string;
  x: number;
  y: number;
  parent_id?: string | null;
  node_type?: 'group';
  component_id?: string | null;
  width?: number;
  height?: number;
  page_data?: PageData | null;
}

export interface MapEdgeData {
  id: string;
  source: string;
  target: string;
}

// --- Tags ---

export interface TagCategory {
  id: string;
  label: string;
}

export interface KbTag {
  id: string;
  label: string;
  category_id: string;
}

// --- Components ---

export interface KbComponent {
  id: string;
  name: string;
  description: string;
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
}

// --- FAQ ---

export type FaqContext =
  | { type: 'global' }
  | { type: 'page'; node_id: string }
  | { type: 'component'; component_id: string };

export interface KbFaq {
  id: string;
  question: string;
  answer: string;
  tag_ids: string[];
  context: FaqContext;
}

// --- Rules ---

export type RuleContext =
  | { type: 'global' }
  | { type: 'page'; node_id: string }
  | { type: 'component'; component_id: string };

export interface KbRule {
  id: string;
  title: string;
  description: string;
  tag_ids: string[];
  context: RuleContext;
}

// --- Glossary ---

export interface KbGlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

// --- Knowledge Base Root ---

export interface KbMeta {
  schema_version: string;
  last_updated: string;
}

export interface KnowledgeBase {
  _meta: KbMeta;
  tag_categories: TagCategory[];
  tags: KbTag[];
  components: KbComponent[];
  map: {
    nodes: MapNodeData[];
    edges: MapEdgeData[];
  };
  faq: KbFaq[];
  rules: KbRule[];
  glossary: KbGlossaryTerm[];
  agent_behavior: {
    tone: string;
    fallback_message: string;
    escalation_message: string;
    max_answer_sentences: number;
    escalation_triggers: string[];
  };
}
