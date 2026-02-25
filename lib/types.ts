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
  module_id?: string; // which module this FAQ belongs to
  page_id?: string;   // which page this FAQ belongs to (more specific)
}

export interface KbModule {
  id: string;
  name: string;
  description: string;
  who_uses: string;
  key_features: string[];
  nav_path: string;
}

export interface KbPage {
  id: string;
  name: string;
  module_id: string;
  path: string;
  description: string;
  how_to_access: string;
  key_actions: string[];
  tips: string[];
  // Canvas fields (visual map)
  x?: number;
  y?: number;
  connections?: string[]; // page IDs this page navigates to
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
  platform: {
    name: string;
    description: string;
    target_users: string;
    key_benefits: string[];
  };
  modules: KbModule[];
  pages: KbPage[];
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
