// lib/defaults.ts
import type {
  KbFaq, KbRule, KbGlossaryTerm, KbComponent,
  TagCategory, KbTag, PageSection, PageData, KnowledgeBase,
  ComponentSlot, ComponentPropDef, ComponentVariant, ComponentCondition,
  SurveyQuestionTypeDef, SurveyDriver, SurveyQuestion, SurveyTemplate, QuestionType
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

export const emptyDriver = (): SurveyDriver => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  tag_ids: [],
  faq_ids: [],
  rule_ids: [],
});

export const emptyTemplate = (): SurveyTemplate => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  purpose: '',
  survey_title: '',
  survey_description: '',
  measured_topics: [],
  why_take_survey: '',
  short_description: '',
  tag_ids: [],
  faq_ids: [],
  rule_ids: [],
  glossary_ids: [],
  question_ids: [],
});

export const emptyQuestion = (type: QuestionType): SurveyQuestion => ({
  id: crypto.randomUUID(),
  text: '',
  type,
  required: true,
  is_pool_question: false,
  has_comment: false,
  ...(type === 'likert'          ? { scale_min: 1, scale_max: 5, driver_id: null, is_enps: false } : {}),
  ...(type === 'star'            ? { scale_min: 1, scale_max: 5 }                  : {}),
  ...(type === 'emoji'           ? { scale_min: 1, scale_max: 5 }                  : {}),
  ...(type === 'single_choice'   ? { options: [] }                                 : {}),
  ...(type === 'multiple_choice' ? { options: [], multi_min: null, multi_max: null }: {}),
});

export const emptyPropDef = (): ComponentPropDef => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'string',
  required: false,
  description: '',
});

export const emptySlot = (): ComponentSlot => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  props: [],
  component_ids: [],
  prop_bindings: [],
  zone: 'body',
  x: 20,
  y: 20,
  w: 160,
  h: 36,
});

export const emptyVariant = (): ComponentVariant => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
});

export const emptyCondition = (): ComponentCondition => ({
  id: crypto.randomUUID(),
  propId: '',
  propValue: '',
  description: '',
});

export const emptyComponent = (): KbComponent => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  component_type: 'composite',
  tag_ids: [],
  faq_ids: [],
  rule_ids: [],
  props: [],
  variants: [],
  conditions: [],
  slots: [],
  has_header: false,
  has_footer: false,
  header_height: 200,
  footer_height: 200,
  frame_width: 480,
  frame_height: 320,
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
  canvas_slots: [],
  frame_width: 480,
  frame_height: 320,
  faq_ids: [],
  rule_ids: [],
  props: [],
});

export const SEED_PRIMITIVES: KbComponent[] = [
  {
    id: 'seed-prim-button',
    name: 'Button',
    description: 'Tıklanabilir aksiyon tetikleyici.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [
      { id: 'seed-prim-button-v1', name: 'primary',     description: 'Dolu arka plan, beyaz metin' },
      { id: 'seed-prim-button-v2', name: 'secondary',   description: 'Soluk arka plan, koyu metin' },
      { id: 'seed-prim-button-v3', name: 'ghost',       description: 'Saydam, hover\'da arka plan belirir' },
      { id: 'seed-prim-button-v4', name: 'destructive', description: 'Kırmızı ton, silme/tehlikeli aksiyonlar' },
    ],
    props: [
      { id: 'seed-prim-button-p1', name: 'label',    type: 'string',  required: true,  description: 'Buton metni' },
      { id: 'seed-prim-button-p2', name: 'disabled', type: 'boolean', required: false, description: 'Devre dışı durumu' },
      { id: 'seed-prim-button-p3', name: 'loading',  type: 'boolean', required: false, description: 'Yükleme spinner\'ı gösterir' },
      { id: 'seed-prim-button-p4', name: 'size',     type: 'string',  required: false, description: 'sm | md | lg' },
      { id: 'seed-prim-button-p5', name: 'onClick',  type: 'fn',      required: false, description: 'Tıklama handler\'ı' },
    ],
    conditions: [
      { id: 'seed-prim-button-c1', propId: 'seed-prim-button-p2', propValue: 'true',  description: 'Opaklık azalır, tıklama engellenir' },
      { id: 'seed-prim-button-c2', propId: 'seed-prim-button-p3', propValue: 'true',  description: 'Metin gizlenir, spinner görünür' },
    ],
  },
  {
    id: 'seed-prim-input',
    name: 'Input',
    description: 'Tek satır metin girişi.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [
      { id: 'seed-prim-input-v1', name: 'default', description: 'Normal kenarlık' },
      { id: 'seed-prim-input-v2', name: 'error',   description: 'Kırmızı kenarlık + hata mesajı' },
    ],
    props: [
      { id: 'seed-prim-input-p1', name: 'value',       type: 'string',  required: false, description: 'Kontrollü değer' },
      { id: 'seed-prim-input-p2', name: 'placeholder', type: 'string',  required: false, description: 'Boş hâlde gösterilen metin' },
      { id: 'seed-prim-input-p3', name: 'disabled',    type: 'boolean', required: false, description: 'Devre dışı durumu' },
      { id: 'seed-prim-input-p4', name: 'type',        type: 'string',  required: false, description: 'text | password | email | number' },
      { id: 'seed-prim-input-p5', name: 'onChange',    type: 'fn',      required: false, description: 'Değişim handler\'ı' },
    ],
    conditions: [
      { id: 'seed-prim-input-c1', propId: 'seed-prim-input-p3', propValue: 'true', description: 'Soluk görünüm, yazma engellenir' },
    ],
  },
  {
    id: 'seed-prim-textarea',
    name: 'Textarea',
    description: 'Çok satır metin girişi.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-textarea-p1', name: 'value',       type: 'string',  required: false, description: 'Kontrollü değer' },
      { id: 'seed-prim-textarea-p2', name: 'placeholder', type: 'string',  required: false, description: 'Boş hâlde gösterilen metin' },
      { id: 'seed-prim-textarea-p3', name: 'rows',        type: 'string',  required: false, description: 'Görünür satır sayısı' },
      { id: 'seed-prim-textarea-p4', name: 'disabled',    type: 'boolean', required: false, description: 'Devre dışı durumu' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-select',
    name: 'Select',
    description: 'Açılır liste seçici.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-select-p1', name: 'value',       type: 'string',  required: false, description: 'Seçili değer' },
      { id: 'seed-prim-select-p2', name: 'options',     type: 'string',  required: true,  description: '{ value, label }[] dizisi' },
      { id: 'seed-prim-select-p3', name: 'placeholder', type: 'string',  required: false, description: 'Seçim yapılmamışken görünen metin' },
      { id: 'seed-prim-select-p4', name: 'disabled',    type: 'boolean', required: false, description: 'Devre dışı durumu' },
      { id: 'seed-prim-select-p5', name: 'onChange',    type: 'fn',      required: false, description: 'Seçim değişim handler\'ı' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-badge',
    name: 'Badge',
    description: 'Küçük durum veya etiket göstergesi.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [
      { id: 'seed-prim-badge-v1', name: 'default',     description: 'Dolu arka plan' },
      { id: 'seed-prim-badge-v2', name: 'outline',     description: 'Kenarlıklı, saydam arka plan' },
      { id: 'seed-prim-badge-v3', name: 'secondary',   description: 'İkincil renk tonu' },
      { id: 'seed-prim-badge-v4', name: 'destructive', description: 'Kırmızı ton' },
    ],
    props: [
      { id: 'seed-prim-badge-p1', name: 'label', type: 'string', required: true, description: 'Rozet metni' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-checkbox',
    name: 'Checkbox',
    description: 'İşaretlenebilir onay kutusu.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-checkbox-p1', name: 'checked',  type: 'boolean', required: false, description: 'İşaretli mi?' },
      { id: 'seed-prim-checkbox-p2', name: 'label',    type: 'string',  required: false, description: 'Yanındaki metin etiketi' },
      { id: 'seed-prim-checkbox-p3', name: 'disabled', type: 'boolean', required: false, description: 'Devre dışı durumu' },
      { id: 'seed-prim-checkbox-p4', name: 'onChange', type: 'fn',      required: false, description: 'Değişim handler\'ı' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-switch',
    name: 'Switch',
    description: 'Açık/kapalı toggle anahtarı.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-switch-p1', name: 'checked',  type: 'boolean', required: false, description: 'Açık mı?' },
      { id: 'seed-prim-switch-p2', name: 'disabled', type: 'boolean', required: false, description: 'Devre dışı durumu' },
      { id: 'seed-prim-switch-p3', name: 'onChange', type: 'fn',      required: false, description: 'Değişim handler\'ı' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-avatar',
    name: 'Avatar',
    description: 'Kullanıcı profil fotoğrafı veya baş harf göstergesi.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-avatar-p1', name: 'src',      type: 'string', required: false, description: 'Resim URL\'i' },
      { id: 'seed-prim-avatar-p2', name: 'alt',      type: 'string', required: false, description: 'Erişilebilirlik metni' },
      { id: 'seed-prim-avatar-p3', name: 'fallback', type: 'string', required: false, description: 'Resim yokken gösterilen baş harfler' },
      { id: 'seed-prim-avatar-p4', name: 'size',     type: 'string', required: false, description: 'sm | md | lg' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-tooltip',
    name: 'Tooltip',
    description: 'Hover\'da açılan bağlam ipucu.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-tooltip-p1', name: 'content',  type: 'string',    required: true,  description: 'Tooltip içeriği' },
      { id: 'seed-prim-tooltip-p2', name: 'side',     type: 'string',    required: false, description: 'top | right | bottom | left' },
      { id: 'seed-prim-tooltip-p3', name: 'children', type: 'ReactNode', required: true,  description: 'Tooltip\'i tetikleyen element' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-container',
    name: 'Container',
    description: 'Genel amaçlı layout sarmalayıcı. Children/slot içerir.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [
      { id: 'seed-prim-container-v1', name: 'default', description: 'Düz sarmalayıcı, görsel stil yok' },
      { id: 'seed-prim-container-v2', name: 'card',    description: 'Kenarlık + gölge, kart görünümü' },
      { id: 'seed-prim-container-v3', name: 'section', description: 'Dikey padding ile bölüm alanı' },
    ],
    props: [
      { id: 'seed-prim-container-p1', name: 'children', type: 'ReactNode', required: false, description: 'İç içerik' },
      { id: 'seed-prim-container-p2', name: 'className', type: 'string',    required: false, description: 'Ek CSS sınıfları' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-label',
    name: 'Label',
    description: 'Form alanı etiketi. Input, Select gibi form elemanlarının üstünde görünür.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [],
    props: [
      { id: 'seed-prim-label-p1', name: 'text',     type: 'string',  required: true,  description: 'Etiket metni' },
      { id: 'seed-prim-label-p2', name: 'htmlFor',  type: 'string',  required: false, description: 'Bağlı input\'un id\'si' },
      { id: 'seed-prim-label-p3', name: 'required', type: 'boolean', required: false, description: 'Zorunlu alanı belirtmek için * işareti ekler' },
    ],
    conditions: [
      { id: 'seed-prim-label-c1', propId: 'seed-prim-label-p3', propValue: 'true', description: 'Metin yanında kırmızı * gösterilir' },
    ],
  },
  {
    id: 'seed-prim-description',
    name: 'Description',
    description: 'Yardımcı açıklama metni. Form alanı altında veya başlık altında kullanılır.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [
      { id: 'seed-prim-description-v1', name: 'default', description: 'Soluk, küçük boyutlu yardımcı metin' },
      { id: 'seed-prim-description-v2', name: 'error',   description: 'Kırmızı ton, hata açıklaması için' },
      { id: 'seed-prim-description-v3', name: 'hint',    description: 'İpucu tonu, bilgi verici' },
    ],
    props: [
      { id: 'seed-prim-description-p1', name: 'text',    type: 'string', required: true,  description: 'Açıklama metni' },
      { id: 'seed-prim-description-p2', name: 'variant', type: 'string', required: false, description: 'default | error | hint' },
    ],
    conditions: [],
  },
  {
    id: 'seed-prim-title',
    name: 'Title',
    description: 'Sayfa veya bölüm başlığı. Hiyerarşik başlık seviyeleri destekler.',
    component_type: 'primitive',
    tag_ids: [], faq_ids: [], rule_ids: [], slots: [],
    variants: [
      { id: 'seed-prim-title-v1', name: 'h1', description: 'Ana sayfa başlığı, en büyük' },
      { id: 'seed-prim-title-v2', name: 'h2', description: 'Bölüm başlığı' },
      { id: 'seed-prim-title-v3', name: 'h3', description: 'Alt bölüm başlığı' },
      { id: 'seed-prim-title-v4', name: 'h4', description: 'Kart veya widget başlığı, en küçük' },
    ],
    props: [
      { id: 'seed-prim-title-p1', name: 'text',    type: 'string', required: true,  description: 'Başlık metni' },
      { id: 'seed-prim-title-p2', name: 'level',   type: 'string', required: false, description: 'h1 | h2 | h3 | h4' },
      { id: 'seed-prim-title-p3', name: 'subtitle', type: 'string', required: false, description: 'Başlık altında daha küçük açıklama satırı' },
    ],
    conditions: [],
  },
];

export const SEED_QUESTION_TYPES: SurveyQuestionTypeDef[] = [
  {
    key: 'likert',
    name: 'Likert Ölçeği',
    description: 'Sayısal derecelendirme skalası. Ölçek aralığı yapılandırılabilir (1-4, 1-5, 1-7, 1-10). Her soru bir driver ile ilişkilendirilebilir.',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
  {
    key: 'yes_no',
    name: 'Evet / Hayır',
    description: 'Sabit üç seçenek: Evet, Kararsızım, Hayır. Özel seçenek tanımlanamaz.',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
  {
    key: 'single_choice',
    name: 'Tek Seçim',
    description: 'Kullanıcı tanımlı seçenekler listesi; yalnızca bir seçenek seçilebilir.',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
  {
    key: 'multiple_choice',
    name: 'Çoklu Seçim',
    description: 'Kullanıcı tanımlı seçenekler; birden fazla seçilebilir. Min/max seçim sayısı kısıtlanabilir.',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
  {
    key: 'star',
    name: 'Yıldız',
    description: 'Yıldız ikonlarıyla derecelendirme. Yıldız sayısı yapılandırılabilir (min 2).',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
  {
    key: 'emoji',
    name: 'Emoji',
    description: 'Emoji ikonlarıyla derecelendirme. Seçenek sayısı yapılandırılabilir (min 2).',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
  {
    key: 'text',
    name: 'Açık Metin',
    description: 'Kullanıcı serbest metin yazar. Seçenek veya ölçek yoktur.',
    tag_ids: [], faq_ids: [], rule_ids: [],
  },
];

export const emptyKnowledgeBase = (): KnowledgeBase => ({
  _meta: {
    schema_version: '4.0',
    last_updated: new Date().toISOString(),
  },
  tag_categories: [],
  tags: [],
  components: [...SEED_PRIMITIVES],
  map: { nodes: [], edges: [] },
  faq: [],
  rules: [],
  glossary: [],
  survey_question_types: [...SEED_QUESTION_TYPES],
  survey_drivers: [],
  survey_templates: [],
  survey_questions: [],
  agent_behavior: {
    tone: 'friendly',
    fallback_message: '',
    escalation_message: '',
    max_answer_sentences: 3,
    escalation_triggers: [],
  },
});
