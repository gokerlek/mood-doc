// lib/types.ts

// --- Map ---

export type SectionType = 'text' | 'faq' | 'rules' | 'components';

export type PageSection =
  | { id: string; type: 'text';       order: number; content: string }
  | { id: string; type: 'faq';        order: number; faq_ids: string[] }
  | { id: string; type: 'rules';      order: number; rule_ids: string[] }
  | { id: string; type: 'components'; order: number; component_ids: string[] };

export interface PageData {
  description: string;
  tag_ids: string[];
  sections: PageSection[];
  canvas_slots?: ComponentSlot[];
  frame_width?: number;   // default 480
  frame_height?: number;  // default 320
  faq_ids?: string[];
  rule_ids?: string[];
  props?: ComponentPropDef[];
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
  sourceHandle?: string | null;
  targetHandle?: string | null;
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

export type ComponentType = 'primitive' | 'composite' | 'section' | 'page';

export interface ComponentPropDef {
  id: string;
  name: string;        // prop adı, örn. "title"
  type: string;        // "string" | "boolean" | "ReactNode" | "fn" | serbest metin
  required: boolean;
  description: string; // ne yapar, ne zaman görünür
}

export interface ComponentVariant {
  id: string;
  name: string;        // "primary", "secondary", "ghost"
  description: string; // bu variant görsel olarak nasıl görünür
}

export interface ComponentCondition {
  id: string;
  propId: string;      // ComponentPropDef.id'ye referans (comp.props listesinden)
  propValue: string;   // "true", "false", "sm", "lg" vb. serbest metin
  description: string; // bu koşulda görsel olarak ne değişir
}

export interface SlotPropBinding {
  childPropName: string;  // child component'in prop adı, örn. "label"
  parentPropId: string;   // parent KbComponent.props[i].id, örn. "uuid-count"
}

export interface ComponentSlot {
  id: string;
  name: string;        // bölge adı, örn. "Header", "Body", "Actions"
  description: string;
  props: ComponentPropDef[];
  component_ids?: string[];   // bu slot'ta hangi bileşenler render edilir
  prop_bindings?: SlotPropBinding[];
  zone?: 'body' | 'header' | 'footer'; // default 'body'
  // canvas koordinatları — PIXEL (px), normalize oran değil
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KbComponent {
  id: string;
  name: string;
  description: string;
  component_type: ComponentType;    // primitive | composite | section | page
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
  // Primitive'e özel
  props: ComponentPropDef[];
  variants: ComponentVariant[];
  conditions: ComponentCondition[];
  // Composite/Section/Page için
  slots: ComponentSlot[];
  has_header?: boolean;    // default false
  has_footer?: boolean;    // default false
  header_height?: number;  // default 48
  footer_height?: number;  // default 48
  frame_width?: number;    // default 480
  frame_height?: number;   // default 320
}

// --- Shared Context ---

export type KbItemContext =
  | { type: 'global' }
  | { type: 'page';          node_id: string }
  | { type: 'component';     component_id: string }
  | { type: 'template';      template_id: string }
  | { type: 'driver';        driver_id: string }
  | { type: 'question_type'; question_type_key: string };

// --- FAQ ---

export interface KbFaq {
  id: string;
  question: string;
  answer: string;
  tag_ids: string[];
  context: KbItemContext;
}

// --- Rules ---

export interface KbRule {
  id: string;
  title: string;
  description: string;
  tag_ids: string[];
  context: KbItemContext;
}

// --- Glossary ---

export interface KbGlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

// --- Survey ---

export type QuestionType =
  | 'likert'
  | 'yes_no'
  | 'single_choice'
  | 'multiple_choice'
  | 'star'
  | 'emoji'
  | 'text';

// Sabit 7 tip — key is primary identifier (intentional exception to id convention)
export interface SurveyQuestionTypeDef {
  key: QuestionType;
  name: string;
  description: string;
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
}

export interface SurveyDriver {
  id: string;
  name: string;
  description: string;
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
}

export interface SurveyQuestion {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  is_pool_question: boolean;
  has_comment: boolean;
  scale_min?: number;
  scale_max?: number;
  driver_id?: string | null;
  options?: string[];
  multi_min?: number | null;
  multi_max?: number | null;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  purpose: string;
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
  glossary_ids: string[];
  question_ids: string[];
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
  survey_question_types: SurveyQuestionTypeDef[];
  survey_drivers: SurveyDriver[];
  survey_templates: SurveyTemplate[];
  survey_questions: SurveyQuestion[];
  agent_behavior: {
    tone: string;
    fallback_message: string;
    escalation_message: string;
    max_answer_sentences: number;
    escalation_triggers: string[];
  };
}
