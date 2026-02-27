// --- Map Canvas ---

export interface MapNodeData {
  id: string;
  label: string;
  description?: string;
  color?: string;
  x: number;
  y: number;
  parentId?: string;
  nodeType?: 'group';
  width?: number;
  height?: number;
}

export interface MapEdgeData {
  id: string;
  source: string;
  target: string;
}

// --- Knowledge Base ---

export interface KbMeta {
  schema_version: string;
  last_updated: string;
  changelog: { date: string; summary: string }[];
}

export interface KbFaq {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  module_id?: string;
}

export interface KbModule {
  id: string;
  name: string;
  description: string;
  who_uses: string;
  key_features: string[];
  nav_path: string;
}

export interface KbGlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

export interface KbRule {
  id: string;
  title: string;
  description: string;
}

export interface KnowledgeBase {
  _meta: KbMeta;
  map?: { nodes: MapNodeData[]; edges: MapEdgeData[] };
  platform: {
    name: string;
    description: string;
    target_users: string;
    key_benefits: string[];
  };
  modules: KbModule[];
  glossary: KbGlossaryTerm[];
  global_rules: {
    anonymity_limit: { value: number; description: string };
    reporting_limit: { value: number; description: string };
    other_rules: KbRule[];
  };
  faq: KbFaq[];
  agent_behavior: {
    tone: string;
    fallback_message: string;
    escalation_message: string;
    max_answer_sentences: number;
    escalation_triggers: string[];
  };
}
