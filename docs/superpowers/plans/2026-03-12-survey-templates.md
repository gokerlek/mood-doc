# Survey Templates Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add survey template management (question types, drivers, templates) with a TypeForm-like 3-column editor to the Moodivation KB Manager.

**Architecture:** New survey entities (SurveyQuestionTypeDef, SurveyDriver, SurveyQuestion, SurveyTemplate) extend the existing KnowledgeBase store with the same upsert/delete action pattern. Pages follow established List + Detail conventions; the template detail uses a 3-column TypeForm-like layout with DnD question ordering.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Zustand 5 (auto-zustand-selectors-hook), DnD Kit, shadcn/ui, Tabler icons, Vitest

**Spec:** `docs/superpowers/specs/2026-03-12-survey-templates-design.md`

---

## Chunk 1: Foundation — Types, Defaults, Store

### Task 1: Extend `lib/types.ts`

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add `QuestionType` union and new interfaces after the Glossary section (line 161)**

Open `lib/types.ts` and append after the `KbGlossaryTerm` interface:

```ts
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
  // Likert / Star / Emoji
  scale_min?: number;
  scale_max?: number;
  driver_id?: string | null;   // Likert only
  // Choice types
  options?: string[];
  // Multiple choice constraints
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
```

- [ ] **Step 2: Extend `KbItemContext` union (currently line 129)**

Replace:
```ts
export type KbItemContext =
  | { type: 'global' }
  | { type: 'page'; node_id: string }
  | { type: 'component'; component_id: string };
```
With:
```ts
export type KbItemContext =
  | { type: 'global' }
  | { type: 'page';          node_id: string }
  | { type: 'component';     component_id: string }
  | { type: 'template';      template_id: string }
  | { type: 'driver';        driver_id: string }
  | { type: 'question_type'; question_type_key: string };
```

- [ ] **Step 3: Add 4 new fields to `KnowledgeBase` interface (currently ends ~line 188)**

Add inside the `KnowledgeBase` interface body:
```ts
  survey_question_types: SurveyQuestionTypeDef[];
  survey_drivers: SurveyDriver[];
  survey_templates: SurveyTemplate[];
  survey_questions: SurveyQuestion[];
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | head -40
```
Expected: build succeeds or only pre-existing errors.

---

### Task 2: Add factories and seeds to `lib/defaults.ts`

**Files:**
- Modify: `lib/defaults.ts`

- [ ] **Step 1: Update imports at top of file**

Add `SurveyQuestionTypeDef`, `SurveyDriver`, `SurveyQuestion`, `SurveyTemplate`, `QuestionType` to the import from `'./types'`.

- [ ] **Step 2: Add `SEED_QUESTION_TYPES` constant before `emptyKnowledgeBase`**

```ts
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
```

- [ ] **Step 3: Add factory functions after `emptyGlossaryTerm`**

```ts
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
  ...(type === 'likert'          ? { scale_min: 1, scale_max: 5, driver_id: null } : {}),
  ...(type === 'star'            ? { scale_min: 1, scale_max: 5 }                  : {}),
  ...(type === 'emoji'           ? { scale_min: 1, scale_max: 5 }                  : {}),
  ...(type === 'single_choice'   ? { options: [] }                                 : {}),
  ...(type === 'multiple_choice' ? { options: [], multi_min: null, multi_max: null }: {}),
});
```

- [ ] **Step 4: Update `emptyKnowledgeBase()` to include the 4 new arrays and bump schema version**

Find the `emptyKnowledgeBase` function. Update the `_meta` schema version and add the 4 new fields:
```ts
  _meta: { schema_version: '4.0', last_updated: new Date().toISOString() },
  // ... (keep all other existing fields unchanged)
  survey_question_types: [...SEED_QUESTION_TYPES],
  survey_drivers: [],
  survey_templates: [],
  survey_questions: [],
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | head -40
```
Expected: build succeeds or only pre-existing errors.

---

### Task 3: Write store tests for survey actions

**Files:**
- Create: `__tests__/stores/surveyStore.test.ts`

- [ ] **Step 1: Create the test file**

```ts
// __tests__/stores/surveyStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useKbStoreBase } from '@/stores/kbStore';
import { emptyDriver, emptyTemplate, emptyQuestion, SEED_QUESTION_TYPES } from '@/lib/defaults';

// Access raw store state (before createSelectorHooks wraps it)
// The store is created with create() — we test via getState/setState
function getStore() {
  return useKbStoreBase.getState();
}

describe('Survey store actions', () => {
  beforeEach(() => {
    // Reset to a fresh KB with survey arrays
    // Note: schema_version is bumped to '4.0' in Task 4 — here we use a dummy value
    // since setData does not validate schema_version
    getStore().setData({
      _meta: { schema_version: '3.0', last_updated: new Date().toISOString() },
      tag_categories: [], tags: [], components: [],
      map: { nodes: [], edges: [] },
      faq: [], rules: [], glossary: [],
      agent_behavior: { tone: 'friendly', fallback_message: '', escalation_message: '', max_answer_sentences: 3, escalation_triggers: [] },
      survey_question_types: [...SEED_QUESTION_TYPES],
      survey_drivers: [],
      survey_templates: [],
      survey_questions: [],
    });
  });

  describe('upsertSurveyDriver', () => {
    it('adds a new driver', () => {
      const driver = emptyDriver();
      driver.name = 'Motivasyon';
      getStore().upsertSurveyDriver(driver);
      expect(getStore().data?.survey_drivers).toHaveLength(1);
      expect(getStore().data?.survey_drivers[0].name).toBe('Motivasyon');
    });

    it('updates an existing driver', () => {
      const driver = emptyDriver();
      getStore().upsertSurveyDriver(driver);
      getStore().upsertSurveyDriver({ ...driver, name: 'Updated' });
      expect(getStore().data?.survey_drivers).toHaveLength(1);
      expect(getStore().data?.survey_drivers[0].name).toBe('Updated');
    });

    it('sets isDirty', () => {
      getStore().upsertSurveyDriver(emptyDriver());
      expect(getStore().isDirty).toBe(true);
    });
  });

  describe('deleteSurveyDriver', () => {
    it('removes the driver', () => {
      const driver = emptyDriver();
      getStore().upsertSurveyDriver(driver);
      getStore().deleteSurveyDriver(driver.id);
      expect(getStore().data?.survey_drivers).toHaveLength(0);
    });

    it('nullifies driver_id on related questions (cascade)', () => {
      const driver = emptyDriver();
      getStore().upsertSurveyDriver(driver);
      const q = emptyQuestion('likert');
      q.driver_id = driver.id;
      getStore().upsertSurveyQuestion(q);
      getStore().deleteSurveyDriver(driver.id);
      expect(getStore().data?.survey_questions[0].driver_id).toBeNull();
    });
  });

  describe('upsertSurveyQuestion / deleteSurveyQuestion', () => {
    it('adds a question', () => {
      const q = emptyQuestion('text');
      getStore().upsertSurveyQuestion(q);
      expect(getStore().data?.survey_questions).toHaveLength(1);
    });

    it('removes question from template question_ids on delete (cascade)', () => {
      const q = emptyQuestion('text');
      getStore().upsertSurveyQuestion(q);
      const tmpl = emptyTemplate();
      tmpl.question_ids = [q.id];
      getStore().upsertSurveyTemplate(tmpl);
      getStore().deleteSurveyQuestion(q.id);
      expect(getStore().data?.survey_questions).toHaveLength(0);
      expect(getStore().data?.survey_templates[0].question_ids).toHaveLength(0);
    });
  });

  describe('reorderTemplateQuestions', () => {
    it('updates question_ids order', () => {
      const tmpl = emptyTemplate();
      tmpl.question_ids = ['a', 'b', 'c'];
      getStore().upsertSurveyTemplate(tmpl);
      getStore().reorderTemplateQuestions(tmpl.id, ['c', 'a', 'b']);
      expect(getStore().data?.survey_templates[0].question_ids).toEqual(['c', 'a', 'b']);
    });
  });

  describe('upsertSurveyQuestionType', () => {
    it('updates documentation fields but preserves key', () => {
      getStore().upsertSurveyQuestionType({ ...SEED_QUESTION_TYPES[0], name: 'Updated Name' });
      const qt = getStore().data?.survey_question_types.find(t => t.key === 'likert');
      expect(qt?.name).toBe('Updated Name');
      expect(qt?.key).toBe('likert');
    });
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL (store actions not yet implemented)**

```bash
cd /Volumes/projects/mood-doc && bun run test __tests__/stores/surveyStore.test.ts 2>&1 | tail -20
```
Expected: errors about missing store actions (`upsertSurveyDriver` is not a function, etc.)

---

### Task 4: Implement survey actions in `stores/kbStore.ts`

**Files:**
- Modify: `stores/kbStore.ts`

- [ ] **Step 1: Update imports — add new types**

Add to the import from `@/lib/types`:
```ts
SurveyQuestionTypeDef, SurveyDriver, SurveyQuestion, SurveyTemplate,
```

Add to the import from `@/lib/defaults`:
```ts
SEED_QUESTION_TYPES,
```

- [ ] **Step 2: Add new actions to `KbState` interface**

After the `// Agent` block, add:
```ts
  // Survey Question Types
  upsertSurveyQuestionType: (qt: SurveyQuestionTypeDef) => void;

  // Survey Drivers
  upsertSurveyDriver: (driver: SurveyDriver) => void;
  deleteSurveyDriver: (id: string) => void;

  // Survey Templates
  upsertSurveyTemplate: (template: SurveyTemplate) => void;
  deleteSurveyTemplate: (id: string) => void;

  // Survey Questions
  upsertSurveyQuestion: (question: SurveyQuestion) => void;
  deleteSurveyQuestion: (id: string) => void;
  reorderTemplateQuestions: (templateId: string, question_ids: string[]) => void;
```

- [ ] **Step 3: Update `setData` normalization — add 4 new fields**

Inside `setData`, in the `normalized` object, add:
```ts
survey_question_types: data.survey_question_types ?? defaults.survey_question_types,
survey_drivers:        data.survey_drivers        ?? defaults.survey_drivers,
survey_templates:      data.survey_templates      ?? defaults.survey_templates,
survey_questions:      data.survey_questions      ?? defaults.survey_questions,
```

- [ ] **Step 4: Update `merge` callback — inject missing seed question types**

In the `merge` function, after the SEED_PRIMITIVES injection block, add:
```ts
// Inject missing seed question types
if (!Array.isArray(p.data.survey_question_types)) {
  p.data.survey_question_types = defaults.survey_question_types;
} else {
  const existingKeys = new Set(p.data.survey_question_types.map((qt: SurveyQuestionTypeDef) => qt.key));
  const missingTypes = SEED_QUESTION_TYPES.filter(qt => !existingKeys.has(qt.key));
  if (missingTypes.length > 0) {
    p.data.survey_question_types = [...missingTypes, ...p.data.survey_question_types];
  }
}
// Initialize missing survey arrays
if (!Array.isArray(p.data.survey_drivers))   p.data.survey_drivers   = defaults.survey_drivers;
if (!Array.isArray(p.data.survey_templates)) p.data.survey_templates = defaults.survey_templates;
if (!Array.isArray(p.data.survey_questions)) p.data.survey_questions = defaults.survey_questions;
```

- [ ] **Step 5: Bump persist key**

Change:
```ts
name: 'moodivation-kb-v3',
```
To:
```ts
name: 'moodivation-kb-v4',
```

- [ ] **Step 6: Implement the new store action handlers** (add after `updateAgentBehavior`)

```ts
upsertSurveyQuestionType: (qt) =>
  set((s) => {
    if (!s.data) return s;
    const exists = s.data.survey_question_types.findIndex(t => t.key === qt.key);
    const survey_question_types = exists >= 0
      ? s.data.survey_question_types.map(t => t.key === qt.key ? qt : t)
      : [...s.data.survey_question_types, qt];
    return { isDirty: true, data: { ...s.data, survey_question_types } };
  }),

upsertSurveyDriver: (driver) =>
  set((s) => {
    if (!s.data) return s;
    const exists = s.data.survey_drivers.findIndex(d => d.id === driver.id);
    const survey_drivers = exists >= 0
      ? s.data.survey_drivers.map(d => d.id === driver.id ? driver : d)
      : [...s.data.survey_drivers, driver];
    return { isDirty: true, data: { ...s.data, survey_drivers } };
  }),

deleteSurveyDriver: (id) =>
  set((s) => {
    if (!s.data) return s;
    return {
      isDirty: true,
      data: {
        ...s.data,
        survey_drivers: s.data.survey_drivers.filter(d => d.id !== id),
        // CASCADE: null out driver_id on related questions
        survey_questions: s.data.survey_questions.map(q =>
          q.driver_id === id ? { ...q, driver_id: null } : q
        ),
      },
    };
  }),

upsertSurveyTemplate: (template) =>
  set((s) => {
    if (!s.data) return s;
    const exists = s.data.survey_templates.findIndex(t => t.id === template.id);
    const survey_templates = exists >= 0
      ? s.data.survey_templates.map(t => t.id === template.id ? template : t)
      : [...s.data.survey_templates, template];
    return { isDirty: true, data: { ...s.data, survey_templates } };
  }),

deleteSurveyTemplate: (id) =>
  set((s) =>
    s.data ? {
      isDirty: true,
      data: { ...s.data, survey_templates: s.data.survey_templates.filter(t => t.id !== id) },
    } : s
  ),

upsertSurveyQuestion: (question) =>
  set((s) => {
    if (!s.data) return s;
    const exists = s.data.survey_questions.findIndex(q => q.id === question.id);
    const survey_questions = exists >= 0
      ? s.data.survey_questions.map(q => q.id === question.id ? question : q)
      : [...s.data.survey_questions, question];
    return { isDirty: true, data: { ...s.data, survey_questions } };
  }),

deleteSurveyQuestion: (id) =>
  set((s) => {
    if (!s.data) return s;
    return {
      isDirty: true,
      data: {
        ...s.data,
        survey_questions: s.data.survey_questions.filter(q => q.id !== id),
        // CASCADE: remove from all templates
        survey_templates: s.data.survey_templates.map(t => ({
          ...t,
          question_ids: t.question_ids.filter(qid => qid !== id),
        })),
      },
    };
  }),

reorderTemplateQuestions: (templateId, question_ids) =>
  set((s) => {
    if (!s.data) return s;
    const survey_templates = s.data.survey_templates.map(t =>
      t.id === templateId ? { ...t, question_ids } : t
    );
    return { isDirty: true, data: { ...s.data, survey_templates } };
  }),
```

- [ ] **Step 7: Export `useKbStoreBase` for testing**

In `kbStore.ts` line 92, `const useKbStoreBase` is not exported. Add the `export` keyword:

Change:
```ts
const useKbStoreBase = create<KbState>()(
```
To:
```ts
export const useKbStoreBase = create<KbState>()(
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
cd /Volumes/projects/mood-doc && bun run test __tests__/stores/surveyStore.test.ts 2>&1 | tail -20
```
Expected: all tests pass.

- [ ] **Step 9: Run full test suite — no regressions**

```bash
cd /Volumes/projects/mood-doc && bun run test 2>&1 | tail -20
```
Expected: all previous tests pass.

- [ ] **Step 10: Commit**

```bash
cd /Volumes/projects/mood-doc && git add lib/types.ts lib/defaults.ts stores/kbStore.ts __tests__/stores/surveyStore.test.ts && git commit -m "feat: add survey types, defaults, and store actions"
```

---

## Chunk 2: Question Types Pages

### Task 5: Shared survey components — badge + FAQ/Rule sections

**Files:**
- Create: `components/survey/QuestionTypeBadge.tsx`
- Create: `components/survey/SurveyFaqSection.tsx`
- Create: `components/survey/SurveyRuleSection.tsx`

- [ ] **Step 1a: Add question-type CSS variables to `app/globals.css`**

In `app/globals.css`, inside the light-mode `:root` block (after the `/* Zone colors */` section, around line 131), add:

```css
  /* Question type badge colors */
  --qt-likert-bg:  oklch(0.93 0.05 260 / 0.6);
  --qt-likert-fg:  oklch(0.42 0.18 260);
  --qt-yesno-bg:   oklch(0.95 0.06 80 / 0.6);
  --qt-yesno-fg:   oklch(0.50 0.15 65);
  --qt-single-bg:  oklch(0.93 0.05 300 / 0.6);
  --qt-single-fg:  oklch(0.42 0.16 300);
  --qt-multi-bg:   oklch(0.95 0.06 40 / 0.6);
  --qt-multi-fg:   oklch(0.48 0.16 40);
  --qt-star-bg:    oklch(0.96 0.07 90 / 0.6);
  --qt-star-fg:    oklch(0.50 0.16 80);
  --qt-emoji-bg:   oklch(0.94 0.06 340 / 0.6);
  --qt-emoji-fg:   oklch(0.45 0.17 340);
  --qt-text-bg:    oklch(0.94 0.04 155 / 0.6);
  --qt-text-fg:    oklch(0.42 0.14 155);
```

In the dark-mode `.dark` block (after the dark `/* Zone colors */` section, around line 203), add the matching dark variants:

```css
  /* Question type badge colors */
  --qt-likert-bg:  oklch(0.30 0.07 260 / 0.5);
  --qt-likert-fg:  oklch(0.78 0.14 255);
  --qt-yesno-bg:   oklch(0.32 0.07 75 / 0.5);
  --qt-yesno-fg:   oklch(0.80 0.13 70);
  --qt-single-bg:  oklch(0.30 0.07 295 / 0.5);
  --qt-single-fg:  oklch(0.78 0.13 295);
  --qt-multi-bg:   oklch(0.32 0.07 38 / 0.5);
  --qt-multi-fg:   oklch(0.80 0.14 38);
  --qt-star-bg:    oklch(0.33 0.08 85 / 0.5);
  --qt-star-fg:    oklch(0.82 0.14 82);
  --qt-emoji-bg:   oklch(0.30 0.07 340 / 0.5);
  --qt-emoji-fg:   oklch(0.78 0.14 340);
  --qt-text-bg:    oklch(0.30 0.05 155 / 0.5);
  --qt-text-fg:    oklch(0.75 0.12 155);
```

Also register the tokens in the `@theme inline` block (after the `--color-zone-footer-border` line, around line 78):

```css
  --color-qt-likert-bg:  var(--qt-likert-bg);
  --color-qt-likert-fg:  var(--qt-likert-fg);
  --color-qt-yesno-bg:   var(--qt-yesno-bg);
  --color-qt-yesno-fg:   var(--qt-yesno-fg);
  --color-qt-single-bg:  var(--qt-single-bg);
  --color-qt-single-fg:  var(--qt-single-fg);
  --color-qt-multi-bg:   var(--qt-multi-bg);
  --color-qt-multi-fg:   var(--qt-multi-fg);
  --color-qt-star-bg:    var(--qt-star-bg);
  --color-qt-star-fg:    var(--qt-star-fg);
  --color-qt-emoji-bg:   var(--qt-emoji-bg);
  --color-qt-emoji-fg:   var(--qt-emoji-fg);
  --color-qt-text-bg:    var(--qt-text-bg);
  --color-qt-text-fg:    var(--qt-text-fg);
```

- [ ] **Step 1b: Create `QuestionTypeBadge`**

```tsx
// components/survey/QuestionTypeBadge.tsx
'use client';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/lib/types';

const TYPE_CONFIG: Record<QuestionType, { label: string; className: string }> = {
  likert:          { label: 'LİKERT',  className: 'bg-qt-likert-bg text-qt-likert-fg' },
  yes_no:          { label: 'E/H',     className: 'bg-qt-yesno-bg text-qt-yesno-fg' },
  single_choice:   { label: 'TEK',     className: 'bg-qt-single-bg text-qt-single-fg' },
  multiple_choice: { label: 'ÇOKLU',   className: 'bg-qt-multi-bg text-qt-multi-fg' },
  star:            { label: 'YILDIZ',  className: 'bg-qt-star-bg text-qt-star-fg' },
  emoji:           { label: 'EMOJİ',   className: 'bg-qt-emoji-bg text-qt-emoji-fg' },
  text:            { label: 'METİN',   className: 'bg-qt-text-bg text-qt-text-fg' },
};

interface QuestionTypeBadgeProps {
  type: QuestionType;
  className?: string;
}

export function QuestionTypeBadge({ type, className }: QuestionTypeBadgeProps) {
  const { label, className: colorClass } = TYPE_CONFIG[type];
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold', colorClass, className)}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create `SurveyFaqSection`** — identical pattern to `ComponentFaqSection` but generic for any survey entity

```tsx
// components/survey/SurveyFaqSection.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyFaq } from '@/lib/defaults';
import type { KbItemContext } from '@/lib/types';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

interface SurveyFaqSectionProps {
  faqIds: string[];
  context: KbItemContext;
  onAddFaqId: (id: string) => void;
  onRemoveFaqId: (id: string) => void;
}

export function SurveyFaqSection({ faqIds, context, onAddFaqId, onRemoveFaqId }: SurveyFaqSectionProps) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  if (!data) return null;

  const faqs = data.faq.filter(f => faqIds.includes(f.id));

  const handleAdd = () => {
    const faq = emptyFaq(context);
    upsertFaq(faq);
    onAddFaqId(faq.id);
  };

  const handleDelete = (faqId: string) => {
    deleteFaq(faqId);
    onRemoveFaqId(faqId);
    toast.success('Silindi');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">FAQ&apos;lar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} /> Ekle
        </Button>
      </div>
      {faqs.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz FAQ yok.</p>
      ) : (
        faqs.map(faq => (
          <Card key={faq.id} className="p-3 space-y-2">
            <Input
              value={faq.question}
              onChange={e => upsertFaq({ ...faq, question: e.target.value })}
              placeholder="Soru..."
            />
            <Textarea
              value={faq.answer}
              onChange={e => upsertFaq({ ...faq, answer: e.target.value })}
              placeholder="Cevap..."
              rows={2}
            />
            <div className="flex items-center justify-between">
              <TagSelector selectedIds={faq.tag_ids} onChange={tag_ids => upsertFaq({ ...faq, tag_ids })} />
              <Button type="button" variant="ghost" size="sm"
                onClick={() => handleDelete(faq.id)}
                className="text-muted-foreground hover:text-destructive" aria-label="FAQ sil">
                <IconTrash size={14} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `SurveyRuleSection`**

```tsx
// components/survey/SurveyRuleSection.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyRule } from '@/lib/defaults';
import type { KbItemContext } from '@/lib/types';
import { TagSelector } from '@/components/tags/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';

interface SurveyRuleSectionProps {
  ruleIds: string[];
  context: KbItemContext;
  onAddRuleId: (id: string) => void;
  onRemoveRuleId: (id: string) => void;
}

export function SurveyRuleSection({ ruleIds, context, onAddRuleId, onRemoveRuleId }: SurveyRuleSectionProps) {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();

  if (!data) return null;

  const rules = data.rules.filter(r => ruleIds.includes(r.id));

  const handleAdd = () => {
    const rule = emptyRule(context);
    upsertRule(rule);
    onAddRuleId(rule.id);
  };

  const handleDelete = (ruleId: string) => {
    deleteRule(ruleId);
    onRemoveRuleId(ruleId);
    toast.success('Silindi');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Kurallar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} /> Ekle
        </Button>
      </div>
      {rules.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz kural yok.</p>
      ) : (
        rules.map(rule => (
          <Card key={rule.id} className="p-3 space-y-2">
            <Input
              value={rule.title}
              onChange={e => upsertRule({ ...rule, title: e.target.value })}
              placeholder="Kural başlığı..."
            />
            <Textarea
              value={rule.description}
              onChange={e => upsertRule({ ...rule, description: e.target.value })}
              placeholder="Kural açıklaması..."
              rows={2}
            />
            <div className="flex items-center justify-between">
              <TagSelector selectedIds={rule.tag_ids} onChange={tag_ids => upsertRule({ ...rule, tag_ids })} />
              <Button type="button" variant="ghost" size="sm"
                onClick={() => handleDelete(rule.id)}
                className="text-muted-foreground hover:text-destructive" aria-label="Kural sil">
                <IconTrash size={14} />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | grep -E "error|Error" | head -20
```

---

### Task 6: Question Type list + detail pages

**Files:**
- Create: `components/survey/QuestionTypeCard.tsx`
- Create: `app/(app)/question-types/page.tsx`
- Create: `app/(app)/question-types/[key]/page.tsx`

- [ ] **Step 1: Create `QuestionTypeCard`**

```tsx
// components/survey/QuestionTypeCard.tsx
'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import type { SurveyQuestionTypeDef } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';

interface QuestionTypeCardProps {
  typeDef: SurveyQuestionTypeDef;
}

export function QuestionTypeCard({ typeDef }: QuestionTypeCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => typeDef.tag_ids.includes(t.id));

  return (
    <Link href={`/question-types/${typeDef.key}`}>
      <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <QuestionTypeBadge type={typeDef.key} />
          <span className="font-semibold text-sm">{typeDef.name}</span>
        </div>
        {typeDef.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{typeDef.description}</p>
        )}
        <div className="flex gap-1 flex-wrap mt-auto">
          {tags.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.label}</Badge>)}
          {typeDef.faq_ids.length > 0 && (
            <Badge variant="outline" className="text-xs">FAQ ({typeDef.faq_ids.length})</Badge>
          )}
          {typeDef.rule_ids.length > 0 && (
            <Badge variant="outline" className="text-xs">Kural ({typeDef.rule_ids.length})</Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create `/question-types/page.tsx`**

```tsx
// app/(app)/question-types/page.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { QuestionTypeCard } from '@/components/survey/QuestionTypeCard';
import { IconListDetails } from '@tabler/icons-react';

export default function QuestionTypesPage() {
  const data = useKbStore.useData();
  if (!data) return null;

  return (
    <ListPageLayout
      icon={<IconListDetails size={22} className="text-primary" />}
      title="Soru Tipleri"
      description="Anketlerde kullanılabilen sabit soru tipi tanımları."
      maxWidth="5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.survey_question_types.map(typeDef => (
          <QuestionTypeCard key={typeDef.key} typeDef={typeDef} />
        ))}
      </div>
    </ListPageLayout>
  );
}
```

- [ ] **Step 3: Create `/question-types/[key]/page.tsx`**

```tsx
// app/(app)/question-types/[key]/page.tsx
'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TagSelector } from '@/components/tags/TagSelector';
import { SurveyFaqSection } from '@/components/survey/SurveyFaqSection';
import { SurveyRuleSection } from '@/components/survey/SurveyRuleSection';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import { IconArrowLeft } from '@tabler/icons-react';
import type { QuestionType } from '@/lib/types';

interface PageProps {
  params: Promise<{ key: string }>;
}

export default function QuestionTypeDetailPage({ params }: PageProps) {
  const { key } = use(params);
  const data = useKbStore.useData();
  const upsertSurveyQuestionType = useKbStore.useUpsertSurveyQuestionType();

  if (!data) return null;

  const typeDef = data.survey_question_types.find(t => t.key === key);
  if (!typeDef) return notFound();

  const update = (patch: Partial<typeof typeDef>) =>
    upsertSurveyQuestionType({ ...typeDef, ...patch });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link href="/question-types" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <IconArrowLeft size={14} /> Soru Tipleri
        </Link>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Info */}
        <div className="w-72 shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <QuestionTypeBadge type={typeDef.key as QuestionType} />
            <span className="text-xs text-muted-foreground">sabit tip</span>
          </div>
          <Input
            value={typeDef.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Tip adı..."
            className="font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
          />
          <Textarea
            value={typeDef.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="Açıklama..."
            rows={4}
          />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
            <TagSelector selectedIds={typeDef.tag_ids} onChange={tag_ids => update({ tag_ids })} />
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="faq">
            <TabsList>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="rules">Kurallar</TabsTrigger>
            </TabsList>
            <Separator className="my-3" />
            <TabsContent value="faq">
              <SurveyFaqSection
                faqIds={typeDef.faq_ids}
                context={{ type: 'question_type', question_type_key: typeDef.key }}
                onAddFaqId={id => update({ faq_ids: [...typeDef.faq_ids, id] })}
                onRemoveFaqId={id => update({ faq_ids: typeDef.faq_ids.filter(f => f !== id) })}
              />
            </TabsContent>
            <TabsContent value="rules">
              <SurveyRuleSection
                ruleIds={typeDef.rule_ids}
                context={{ type: 'question_type', question_type_key: typeDef.key }}
                onAddRuleId={id => update({ rule_ids: [...typeDef.rule_ids, id] })}
                onRemoveRuleId={id => update({ rule_ids: typeDef.rule_ids.filter(r => r !== id) })}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add Soru Tipleri to sidebar**

In `components/shared/AppSidebar.tsx`, add a new group after the existing `İçerik` group (only Soru Tipleri for now — Driverlar and Templateler will be added in Chunks 3 and 4):

```ts
{ label: 'Anketler', items: [
  { label: 'Soru Tipleri', icon: IconListDetails, href: '/question-types' },
]},
```

Also import the new icon at the top of `AppSidebar.tsx`:
```ts
import { IconListDetails } from '@tabler/icons-react';
```

- [ ] **Step 5: Build and verify**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 6: Commit**

```bash
cd /Volumes/projects/mood-doc && git add components/survey/ app/\(app\)/question-types/ components/shared/AppSidebar.tsx app/globals.css && git commit -m "feat: add question types pages and shared survey components"
```

---

## Chunk 3: Drivers Pages

### Task 7: Drivers list and detail

**Files:**
- Create: `hooks/useDriverActions.ts`
- Create: `components/survey/DriverCard.tsx`
- Create: `app/(app)/drivers/page.tsx`
- Create: `app/(app)/drivers/[id]/page.tsx`

- [ ] **Step 1: Create `useDriverActions` hook**

```ts
// hooks/useDriverActions.ts
import { useKbStore } from '@/stores/kbStore';
import { emptyDriver } from '@/lib/defaults';
import { toast } from 'sonner';

export function useDriverActions() {
  const upsertDriver = useKbStore.useUpsertSurveyDriver();
  const deleteDriver = useKbStore.useDeleteSurveyDriver();

  const createDriver = () => {
    const driver = emptyDriver();
    upsertDriver(driver);
    return driver;
  };

  const removeDriver = (id: string) => {
    deleteDriver(id);
    toast.success('Driver silindi');
  };

  return { createDriver, removeDriver, upsertDriver };
}
```

- [ ] **Step 2: Create `DriverCard`**

```tsx
// components/survey/DriverCard.tsx
'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTrash } from '@tabler/icons-react';
import type { SurveyDriver } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';

interface DriverCardProps {
  driver: SurveyDriver;
  onDelete: (id: string) => void;
}

export function DriverCard({ driver, onDelete }: DriverCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => driver.tag_ids.includes(t.id));

  return (
    <Card className="p-4 flex flex-col gap-2 group hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/drivers/${driver.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
            {driver.name || <span className="text-muted-foreground italic">İsimsiz driver</span>}
          </p>
        </Link>
        <Button
          variant="ghost" size="icon"
          className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(driver.id)}
        >
          <IconTrash size={13} />
        </Button>
      </div>
      {driver.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{driver.description}</p>
      )}
      <div className="flex gap-1 flex-wrap mt-auto">
        {tags.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.label}</Badge>)}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create `/drivers/page.tsx`**

```tsx
// app/(app)/drivers/page.tsx
'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { DriverCard } from '@/components/survey/DriverCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { Button } from '@/components/ui/button';
import { useDriverActions } from '@/hooks/useDriverActions';
import { useSearchParam } from '@/hooks/useSearchParam';
import { IconRoute, IconPlus } from '@tabler/icons-react';

export default function DriversPage() {
  const data = useKbStore.useData();
  const { createDriver, removeDriver } = useDriverActions();
  const router = useRouter();
  const [search] = useSearchParam('q');
  const [activeTag, setActiveTag] = useSearchParam('tag');

  const allTagIds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.survey_drivers.flatMap(d => d.tag_ids))].sort();
  }, [data]);

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.survey_drivers
    .filter(d => !activeTag || d.tag_ids.includes(activeTag))
    .filter(d => !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));

  const handleCreate = () => {
    const driver = createDriver();
    router.push(`/drivers/${driver.id}`);
  };

  return (
    <ListPageLayout
      icon={<IconRoute size={22} className="text-primary" />}
      title="Driverlar"
      description="Likert sorularının ölçtüğü boyutlar."
      action={<Button onClick={handleCreate}><IconPlus size={14} /> Yeni Driver</Button>}
      maxWidth="5xl"
    >
      <div className="flex flex-col gap-3">
        <SearchBar placeholder="Driver ara..." />
        <TagFilterBar tagIds={allTagIds} tags={data.tags} activeTag={activeTag} onSelect={setActiveTag} />
      </div>

      {data.survey_drivers.length === 0 ? (
        <EmptyState
          icon={<IconRoute size={28} />}
          title="Henüz driver yok."
          action={<Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">İlk driver'ı ekle →</Button>}
        />
      ) : filtered.length === 0 ? (
        <NoResults message="Eşleşen driver bulunamadı." onClear={() => setActiveTag('')} clearLabel="Filtreyi temizle" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(driver => (
            <DriverCard key={driver.id} driver={driver} onDelete={removeDriver} />
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
```

- [ ] **Step 4: Create `/drivers/[id]/page.tsx`**

```tsx
// app/(app)/drivers/[id]/page.tsx
'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TagSelector } from '@/components/tags/TagSelector';
import { SurveyFaqSection } from '@/components/survey/SurveyFaqSection';
import { SurveyRuleSection } from '@/components/survey/SurveyRuleSection';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DriverDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const upsertDriver = useKbStore.useUpsertSurveyDriver();

  if (!data) return null;

  const driver = data.survey_drivers.find(d => d.id === id);
  if (!driver) return notFound();

  const update = (patch: Partial<typeof driver>) =>
    upsertDriver({ ...driver, ...patch });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link href="/drivers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <IconArrowLeft size={14} /> Driverlar
        </Link>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Info */}
        <div className="w-72 shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
          <Input
            value={driver.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Driver adı..."
            className="font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
          />
          <Textarea
            value={driver.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="Açıklama..."
            rows={4}
          />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
            <TagSelector selectedIds={driver.tag_ids} onChange={tag_ids => update({ tag_ids })} />
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="faq">
            <TabsList>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="rules">Kurallar</TabsTrigger>
            </TabsList>
            <Separator className="my-3" />
            <TabsContent value="faq">
              <SurveyFaqSection
                faqIds={driver.faq_ids}
                context={{ type: 'driver', driver_id: driver.id }}
                onAddFaqId={id => update({ faq_ids: [...driver.faq_ids, id] })}
                onRemoveFaqId={id => update({ faq_ids: driver.faq_ids.filter(f => f !== id) })}
              />
            </TabsContent>
            <TabsContent value="rules">
              <SurveyRuleSection
                ruleIds={driver.rule_ids}
                context={{ type: 'driver', driver_id: driver.id }}
                onAddRuleId={id => update({ rule_ids: [...driver.rule_ids, id] })}
                onRemoveRuleId={id => update({ rule_ids: driver.rule_ids.filter(r => r !== id) })}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add Driverlar to sidebar**

In `components/shared/AppSidebar.tsx`, extend the existing `Anketler` group (added in Chunk 2) to include Driverlar:

```ts
{ label: 'Anketler', items: [
  { label: 'Soru Tipleri', icon: IconListDetails, href: '/question-types' },
  { label: 'Driverlar',    icon: IconRoute,        href: '/drivers' },
]},
```

Also import `IconRoute` alongside the existing `IconListDetails`:
```ts
import { IconListDetails, IconRoute } from '@tabler/icons-react';
```

- [ ] **Step 6: Build and verify**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 7: Commit**

```bash
cd /Volumes/projects/mood-doc && git add hooks/useDriverActions.ts components/survey/DriverCard.tsx app/\(app\)/drivers/ components/shared/AppSidebar.tsx && git commit -m "feat: add drivers list and detail pages"
```

---

## Chunk 4: Templates List + Shared Template Components

### Task 8: GlossarySection component

**Files:**
- Create: `components/survey/GlossarySection.tsx`

- [ ] **Step 1: Create `GlossarySection`**

```tsx
// components/survey/GlossarySection.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { IconTrash } from '@tabler/icons-react';

interface GlossarySectionProps {
  glossaryIds: string[];
  onAddId: (id: string) => void;
  onRemoveId: (id: string) => void;
}

export function GlossarySection({ glossaryIds, onAddId, onRemoveId }: GlossarySectionProps) {
  const data = useKbStore.useData();

  if (!data) return null;

  const selected = data.glossary.filter(t => glossaryIds.includes(t.id));
  const available = data.glossary.filter(t => !glossaryIds.includes(t.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Sözlük Terimleri</h3>
      </div>

      {available.length > 0 && (
        <Combobox
          options={available.map(t => ({ value: t.id, label: t.term }))}
          placeholder="Terim ekle..."
          onSelect={id => { if (id) onAddId(id); }}
        />
      )}

      {selected.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz terim eklenmemiş.</p>
      ) : (
        selected.map(term => (
          <Card key={term.id} className="p-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{term.term}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{term.definition}</p>
            </div>
            <Button
              type="button" variant="ghost" size="icon"
              className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveId(term.id)} aria-label="Kaldır"
            >
              <IconTrash size={13} />
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
```

---

### Task 9: Templates list page

**Files:**
- Create: `hooks/useSurveyTemplateActions.ts`
- Create: `components/survey/TemplateCard.tsx`
- Create: `app/(app)/templates/page.tsx`

- [ ] **Step 1: Create `useSurveyTemplateActions`**

```ts
// hooks/useSurveyTemplateActions.ts
import { useKbStore } from '@/stores/kbStore';
import { emptyTemplate } from '@/lib/defaults';
import { toast } from 'sonner';

export function useSurveyTemplateActions() {
  const upsertTemplate = useKbStore.useUpsertSurveyTemplate();
  const deleteTemplate = useKbStore.useDeleteSurveyTemplate();

  const createTemplate = () => {
    const template = emptyTemplate();
    upsertTemplate(template);
    return template;
  };

  const removeTemplate = (id: string) => {
    deleteTemplate(id);
    toast.success('Template silindi');
  };

  return { createTemplate, removeTemplate, upsertTemplate };
}
```

- [ ] **Step 2: Create `TemplateCard`**

```tsx
// components/survey/TemplateCard.tsx
'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTrash, IconQuestionMark } from '@tabler/icons-react';
import type { SurveyTemplate } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';

interface TemplateCardProps {
  template: SurveyTemplate;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => template.tag_ids.includes(t.id));
  const questionCount = template.question_ids.length;

  return (
    <Card className="p-4 flex flex-col gap-2 group hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/templates/${template.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
            {template.name || <span className="text-muted-foreground italic">İsimsiz template</span>}
          </p>
        </Link>
        <Button
          variant="ghost" size="icon"
          className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(template.id)}
        >
          <IconTrash size={13} />
        </Button>
      </div>
      {template.purpose && (
        <p className="text-xs text-muted-foreground line-clamp-2">{template.purpose}</p>
      )}
      <div className="flex gap-1 flex-wrap items-center mt-auto">
        <Badge variant="outline" className="text-xs gap-1">
          <IconQuestionMark size={9} />{questionCount} soru
        </Badge>
        {tags.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.label}</Badge>)}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create `/templates/page.tsx`**

```tsx
// app/(app)/templates/page.tsx
'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { TemplateCard } from '@/components/survey/TemplateCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { Button } from '@/components/ui/button';
import { useSurveyTemplateActions } from '@/hooks/useSurveyTemplateActions';
import { useSearchParam } from '@/hooks/useSearchParam';
import { IconTemplate, IconPlus } from '@tabler/icons-react';

export default function TemplatesPage() {
  const data = useKbStore.useData();
  const { createTemplate, removeTemplate } = useSurveyTemplateActions();
  const router = useRouter();
  const [search] = useSearchParam('q');
  const [activeTag, setActiveTag] = useSearchParam('tag');

  const allTagIds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.survey_templates.flatMap(t => t.tag_ids))].sort();
  }, [data]);

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.survey_templates
    .filter(t => !activeTag || t.tag_ids.includes(activeTag))
    .filter(t => !q || t.name.toLowerCase().includes(q) || t.purpose.toLowerCase().includes(q));

  const handleCreate = () => {
    const template = createTemplate();
    router.push(`/templates/${template.id}`);
  };

  return (
    <ListPageLayout
      icon={<IconTemplate size={22} className="text-primary" />}
      title="Templateler"
      description="Anket şablonları."
      action={<Button onClick={handleCreate}><IconPlus size={14} /> Yeni Template</Button>}
      maxWidth="5xl"
    >
      <div className="flex flex-col gap-3">
        <SearchBar placeholder="Template ara..." />
        <TagFilterBar tagIds={allTagIds} tags={data.tags} activeTag={activeTag} onSelect={setActiveTag} />
      </div>

      {data.survey_templates.length === 0 ? (
        <EmptyState
          icon={<IconTemplate size={28} />}
          title="Henüz template yok."
          action={<Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">İlk template'i ekle →</Button>}
        />
      ) : filtered.length === 0 ? (
        <NoResults message="Eşleşen template bulunamadı." onClear={() => setActiveTag('')} clearLabel="Filtreyi temizle" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <TemplateCard key={template.id} template={template} onDelete={removeTemplate} />
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
```

- [ ] **Step 4: Add Templateler to sidebar**

In `components/shared/AppSidebar.tsx`, extend the `Anketler` group to include Templateler:

```ts
{ label: 'Anketler', items: [
  { label: 'Soru Tipleri', icon: IconListDetails, href: '/question-types' },
  { label: 'Driverlar',    icon: IconRoute,        href: '/drivers' },
  { label: 'Templateler',  icon: IconTemplate,     href: '/templates' },
]},
```

Also import `IconTemplate` alongside the existing imports:
```ts
import { IconListDetails, IconRoute, IconTemplate } from '@tabler/icons-react';
```

- [ ] **Step 5: Build and verify**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 6: Commit**

```bash
cd /Volumes/projects/mood-doc && git add hooks/useSurveyTemplateActions.ts components/survey/GlossarySection.tsx components/survey/TemplateCard.tsx app/\(app\)/templates/page.tsx components/shared/AppSidebar.tsx && git commit -m "feat: add templates list page and shared template components"
```

---

## Chunk 5: Template Detail — Left Panel and Question List

### Task 10: Question actions hook and DnD question list

**Files:**
- Create: `hooks/useQuestionActions.ts`
- Create: `components/survey/ChoiceOptionList.tsx`
- Create: `components/survey/QuestionList.tsx`

- [ ] **Step 1: Create `useQuestionActions`**

```ts
// hooks/useQuestionActions.ts
import { useKbStore } from '@/stores/kbStore';
import { emptyQuestion } from '@/lib/defaults';
import type { QuestionType, SurveyTemplate } from '@/lib/types';
import { toast } from 'sonner';

export function useQuestionActions(template: SurveyTemplate) {
  const upsertQuestion = useKbStore.useUpsertSurveyQuestion();
  const deleteQuestion = useKbStore.useDeleteSurveyQuestion();
  const upsertTemplate = useKbStore.useUpsertSurveyTemplate();
  const reorder = useKbStore.useReorderTemplateQuestions();

  const addQuestion = (type: QuestionType) => {
    const q = emptyQuestion(type);
    upsertQuestion(q);
    upsertTemplate({ ...template, question_ids: [...template.question_ids, q.id] });
    return q;
  };

  const removeQuestion = (id: string) => {
    deleteQuestion(id);
    toast.success('Soru silindi');
  };

  const reorderQuestions = (question_ids: string[]) => {
    reorder(template.id, question_ids);
  };

  return { addQuestion, removeQuestion, reorderQuestions };
}
```

- [ ] **Step 2: Create `ChoiceOptionList`**

```tsx
// components/survey/ChoiceOptionList.tsx
'use client';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

interface ChoiceOptionListProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function ChoiceOptionList({ options, onChange }: ChoiceOptionListProps) {
  const lastRef = useRef<HTMLInputElement>(null);

  const update = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...options, '']);
    // Focus new input on next render
    setTimeout(() => lastRef.current?.focus(), 50);
  };

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{String.fromCharCode(65 + i)}</span>
          <Input
            ref={i === options.length - 1 ? lastRef : undefined}
            value={opt}
            onChange={e => update(i, e.target.value)}
            placeholder={`Seçenek ${i + 1}...`}
            className="flex-1"
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); add(); }
            }}
          />
          <Button
            type="button" variant="ghost" size="icon"
            className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => remove(i)} disabled={options.length <= 1}
          >
            <IconTrash size={12} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={add}>
        <IconPlus size={13} /> Seçenek Ekle
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create `QuestionList`** (DnD sortable)

```tsx
// components/survey/QuestionList.tsx
'use client';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import { Button } from '@/components/ui/button';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { SurveyQuestion } from '@/lib/types';

interface QuestionListProps {
  questions: SurveyQuestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
}

function SortableItem({
  question, index, isSelected, onSelect, onDelete,
}: {
  question: SurveyQuestion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50',
        isDragging && 'opacity-50',
      )}
      onClick={onSelect}
    >
      <button
        {...attributes} {...listeners}
        className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        onClick={e => e.stopPropagation()}
      >
        <IconGripVertical size={13} />
      </button>
      <span className="text-xs text-muted-foreground w-4 shrink-0">{index + 1}</span>
      <QuestionTypeBadge type={question.type} className="shrink-0" />
      <span className="text-xs flex-1 truncate">
        {question.text || <span className="text-muted-foreground italic">Soru metni yok</span>}
      </span>
      <Button
        type="button" variant="ghost" size="icon"
        className="shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive"
        onClick={e => { e.stopPropagation(); onDelete(); }}
      >
        <IconTrash size={11} />
      </Button>
    </div>
  );
}

export function QuestionList({ questions, selectedId, onSelect, onDelete, onReorder }: QuestionListProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);
    onReorder(arrayMove(questions, oldIndex, newIndex).map(q => q.id));
  };

  if (questions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Henüz soru yok. Aşağıdan ekleyin.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {questions.map((q, i) => (
            <SortableItem
              key={q.id}
              question={q}
              index={i}
              isSelected={selectedId === q.id}
              onSelect={() => onSelect(q.id)}
              onDelete={() => onDelete(q.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

---

### Task 11: TemplateLeftPanel

**Files:**
- Create: `components/survey/AddQuestionModal.tsx` ← created first (TemplateLeftPanel imports it)
- Create: `components/survey/TemplateLeftPanel.tsx`

- [ ] **Step 0: Create AddQuestionModal (required by TemplateLeftPanel)**

```tsx
// components/survey/AddQuestionModal.tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/lib/types';

const TYPES: { type: QuestionType; label: string; description: string; preview: string }[] = [
  { type: 'likert',          label: 'Likert Ölçeği', description: 'Sayısal derecelendirme (1-5, 1-10...)', preview: '1  2  3  4  5' },
  { type: 'yes_no',          label: 'Evet / Hayır',  description: '3 sabit seçenek',                       preview: 'Evet · Kararsızım · Hayır' },
  { type: 'single_choice',   label: 'Tek Seçim',     description: 'Özel liste, bir cevap',                 preview: '○ Seçenek A  ○ Seçenek B' },
  { type: 'multiple_choice', label: 'Çoklu Seçim',   description: 'Özel liste, birden fazla',              preview: '☑ Seçenek A  ☐ Seçenek B' },
  { type: 'star',            label: 'Yıldız',        description: 'Yıldız derecelendirme',                 preview: '★ ★ ★ ★ ☆' },
  { type: 'emoji',           label: 'Emoji',         description: '5 emoji seçenek',                       preview: '😢 😕 😐 🙂 😄' },
  { type: 'text',            label: 'Açık Metin',    description: 'Serbest metin girişi',                  preview: 'Yazın...' },
];

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: QuestionType) => void;
}

export function AddQuestionModal({ open, onClose, onAdd }: AddQuestionModalProps) {
  const [selected, setSelected] = useState<QuestionType | null>(null);

  const handleAdd = () => {
    if (!selected) return;
    onAdd(selected);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Soru Tipi Seç</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {TYPES.map(({ type, label, description, preview }) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                selected === type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground mb-1.5">{description}</p>
              <p className="text-xs text-muted-foreground/70 font-mono">{preview}</p>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button disabled={!selected} onClick={handleAdd}>Ekle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 1: Create TemplateLeftPanel**

```tsx
// components/survey/TemplateLeftPanel.tsx
'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { useSurveyTemplateActions } from '@/hooks/useSurveyTemplateActions';
import { useQuestionActions } from '@/hooks/useQuestionActions';
import { QuestionList } from '@/components/survey/QuestionList';
import { SurveyFaqSection } from '@/components/survey/SurveyFaqSection';
import { SurveyRuleSection } from '@/components/survey/SurveyRuleSection';
import { GlossarySection } from '@/components/survey/GlossarySection';
import { AddQuestionModal } from '@/components/survey/AddQuestionModal';
import { TagSelector } from '@/components/tags/TagSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IconPlus } from '@tabler/icons-react';
import type { SurveyTemplate, SurveyQuestion } from '@/lib/types';

interface TemplateLeftPanelProps {
  template: SurveyTemplate;
  questions: SurveyQuestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TemplateLeftPanel({ template, questions, selectedId, onSelect }: TemplateLeftPanelProps) {
  const { upsertTemplate } = useSurveyTemplateActions();
  const { addQuestion, removeQuestion, reorderQuestions } = useQuestionActions(template);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const update = (patch: Partial<SurveyTemplate>) =>
    upsertTemplate({ ...template, ...patch });

  return (
    <div className="flex flex-col h-full">
      {/* Template metadata */}
      <div className="p-3 border-b border-border space-y-2 shrink-0">
        <Input
          value={template.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="Template adı..."
          className="font-semibold border-none px-0 focus-visible:ring-0 shadow-none text-sm"
        />
        <Textarea
          value={template.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="Açıklama..."
          rows={2}
          className="text-xs resize-none"
        />
        <Textarea
          value={template.purpose}
          onChange={e => update({ purpose: e.target.value })}
          placeholder="Ne işe yarar?"
          rows={2}
          className="text-xs resize-none"
        />
        <TagSelector selectedIds={template.tag_ids} onChange={tag_ids => update({ tag_ids })} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full rounded-none border-b border-border shrink-0 h-8">
          <TabsTrigger value="questions" className="flex-1 text-xs h-7">Sorular</TabsTrigger>
          <TabsTrigger value="faq"       className="flex-1 text-xs h-7">FAQ</TabsTrigger>
          <TabsTrigger value="rules"     className="flex-1 text-xs h-7">Kurallar</TabsTrigger>
          <TabsTrigger value="glossary"  className="flex-1 text-xs h-7">Sözlük</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
          <QuestionList
            questions={questions}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={removeQuestion}
            onReorder={reorderQuestions}
          />
          <Separator />
          <Button
            size="sm" variant="outline" className="w-full text-xs"
            onClick={() => setAddModalOpen(true)}
          >
            <IconPlus size={12} /> Yeni Soru Ekle
          </Button>
        </TabsContent>

        <TabsContent value="faq" className="flex-1 overflow-y-auto p-3">
          <SurveyFaqSection
            faqIds={template.faq_ids}
            context={{ type: 'template', template_id: template.id }}
            onAddFaqId={id => update({ faq_ids: [...template.faq_ids, id] })}
            onRemoveFaqId={id => update({ faq_ids: template.faq_ids.filter(f => f !== id) })}
          />
        </TabsContent>

        <TabsContent value="rules" className="flex-1 overflow-y-auto p-3">
          <SurveyRuleSection
            ruleIds={template.rule_ids}
            context={{ type: 'template', template_id: template.id }}
            onAddRuleId={id => update({ rule_ids: [...template.rule_ids, id] })}
            onRemoveRuleId={id => update({ rule_ids: template.rule_ids.filter(r => r !== id) })}
          />
        </TabsContent>

        <TabsContent value="glossary" className="flex-1 overflow-y-auto p-3">
          <GlossarySection
            glossaryIds={template.glossary_ids}
            onAddId={id => update({ glossary_ids: [...template.glossary_ids, id] })}
            onRemoveId={id => update({ glossary_ids: template.glossary_ids.filter(g => g !== id) })}
          />
        </TabsContent>
      </Tabs>

      <AddQuestionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={type => {
          const q = addQuestion(type);
          onSelect(q.id);
          setAddModalOpen(false);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Volumes/projects/mood-doc && git add hooks/useQuestionActions.ts components/survey/ChoiceOptionList.tsx components/survey/QuestionList.tsx components/survey/AddQuestionModal.tsx components/survey/TemplateLeftPanel.tsx && git commit -m "feat: add question list, DnD ordering, add-question modal, and template left panel"
```

---

## Chunk 6: Template Detail — Middle, Settings Panel, Modal, Page

### Task 12: AddQuestionModal

> **Already completed in Task 11 Step 0.** `AddQuestionModal` was created before `TemplateLeftPanel` to satisfy the import dependency. No action needed here.

---

### Task 13: QuestionForm (middle column)

**Files:**
- Create: `components/survey/QuestionForm.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/survey/QuestionForm.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { ChoiceOptionList } from '@/components/survey/ChoiceOptionList';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SurveyQuestion } from '@/lib/types';

interface QuestionFormProps {
  question: SurveyQuestion;
  index: number;
}

export function QuestionForm({ question, index }: QuestionFormProps) {
  const upsert = useKbStore.useUpsertSurveyQuestion();
  const update = (patch: Partial<SurveyQuestion>) => upsert({ ...question, ...patch });

  const scaleMax = question.scale_max ?? 5;
  const scaleItems = Array.from({ length: scaleMax }, (_, i) => i + (question.scale_min ?? 1));

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Soru {index + 1}</span>
        <span>·</span>
        <QuestionTypeBadge type={question.type} />
      </div>

      {/* Question text */}
      <Input
        value={question.text}
        onChange={e => update({ text: e.target.value })}
        placeholder="Soru metnini yazın..."
        className="text-base font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        autoFocus
      />

      {/* Description */}
      <Input
        value={question.description ?? ''}
        onChange={e => update({ description: e.target.value || undefined })}
        placeholder="Açıklama ekle (opsiyonel)"
        className="text-sm text-muted-foreground border-none px-0 focus-visible:ring-0 shadow-none"
      />

      {/* Type-specific preview/edit */}
      <div className="rounded-lg border border-border p-4 bg-muted/20">
        {(question.type === 'likert' || question.type === 'star' || question.type === 'emoji') && (
          <div className="flex items-end gap-2 flex-wrap">
            {scaleItems.map((val, i) => (
              <div key={val} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-semibold transition-colors',
                  i === scaleItems.length - 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
                )}>
                  {question.type === 'star' ? '★' : question.type === 'emoji' ? ['😢','😕','😐','🙂','😄','😁','🤩'][i] ?? val : val}
                </div>
                {(i === 0 || i === scaleItems.length - 1) && (
                  <span className="text-xs text-muted-foreground">
                    {i === 0 ? question.scale_min ?? 1 : question.scale_max ?? 5}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {question.type === 'yes_no' && (
          <div className="flex gap-2">
            {['Evet', 'Kararsızım', 'Hayır'].map(label => (
              <Badge key={label} variant="outline" className="text-sm px-4 py-1.5">{label}</Badge>
            ))}
          </div>
        )}

        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <ChoiceOptionList
            options={question.options ?? []}
            onChange={options => update({ options })}
          />
        )}

        {question.type === 'text' && (
          <Textarea placeholder="Kullanıcı buraya yazacak..." rows={3} disabled className="cursor-default" />
        )}
      </div>
    </div>
  );
}
```

---

### Task 14: QuestionSettingsPanel (right column)

**Files:**
- Create: `components/survey/QuestionSettingsPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/survey/QuestionSettingsPanel.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { SurveyQuestion, QuestionType } from '@/lib/types';

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'likert',          label: 'Likert Ölçeği' },
  { value: 'yes_no',          label: 'Evet / Hayır' },
  { value: 'single_choice',   label: 'Tek Seçim' },
  { value: 'multiple_choice', label: 'Çoklu Seçim' },
  { value: 'star',            label: 'Yıldız' },
  { value: 'emoji',           label: 'Emoji' },
  { value: 'text',            label: 'Açık Metin' },
];

const LIKERT_PRESETS = [4, 5, 7, 10];

interface QuestionSettingsPanelProps {
  question: SurveyQuestion;
}

export function QuestionSettingsPanel({ question }: QuestionSettingsPanelProps) {
  const data = useKbStore.useData();
  const upsert = useKbStore.useUpsertSurveyQuestion();
  const update = (patch: Partial<SurveyQuestion>) => upsert({ ...question, ...patch });

  if (!data) return null;

  const drivers = data.survey_drivers;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Soru Ayarları</p>

        {/* Type selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Soru Tipi</Label>
          <Select
            value={question.type}
            onValueChange={val => update({ type: val as QuestionType })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Likert: scale presets */}
        {question.type === 'likert' && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Ölçek Aralığı</Label>
            <div className="flex gap-1.5 flex-wrap">
              {LIKERT_PRESETS.map(n => (
                <button
                  key={n}
                  onClick={() => update({ scale_max: n })}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded border transition-colors',
                    question.scale_max === n
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  1–{n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Star / Emoji: count */}
        {(question.type === 'star' || question.type === 'emoji') && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Seçenek Sayısı</Label>
            <Input
              type="number"
              min={2}
              max={10}
              value={question.scale_max ?? 5}
              onChange={e => update({ scale_max: Math.min(10, Math.max(2, Number(e.target.value))) })}
              className="h-8 text-xs"
            />
          </div>
        )}

        {/* Multiple choice: min/max */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Seçim Sınırları</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">En az</Label>
                <Input
                  type="number"
                  min={1}
                  value={question.multi_min ?? ''}
                  onChange={e => update({ multi_min: e.target.value ? Number(e.target.value) : null })}
                  placeholder="—"
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">En fazla</Label>
                <Input
                  type="number"
                  min={question.multi_min ?? 1}
                  value={question.multi_max ?? ''}
                  onChange={e => update({ multi_max: e.target.value ? Number(e.target.value) : null })}
                  placeholder="—"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Driver selector — Likert only */}
        {question.type === 'likert' && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Driver <span className="text-muted-foreground font-normal">(sadece Likert)</span></Label>
            <Select
              value={question.driver_id ?? '__none__'}
              onValueChange={val => update({ driver_id: val === '__none__' ? null : val })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Driver seç..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="text-xs text-muted-foreground">— Yok —</SelectItem>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">{d.name || 'İsimsiz driver'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Toggles */}
        <div className="space-y-2">
          {[
            { key: 'required',        label: 'Zorunlu soru',   description: 'Boş geçilemez' },
            { key: 'is_pool_question', label: 'Havuz sorusu',  description: 'Diğer templatelerden seçilebilir' },
            { key: 'has_comment',      label: 'Yorum alanı',   description: 'Cevap altında açık metin kutusu' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={!!question[key as keyof SurveyQuestion]}
                onCheckedChange={v => update({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
```

---

### Task 15: Template detail page

**Files:**
- Create: `app/(app)/templates/[id]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/(app)/templates/[id]/page.tsx
'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { TemplateLeftPanel } from '@/components/survey/TemplateLeftPanel';
import { QuestionForm } from '@/components/survey/QuestionForm';
import { QuestionSettingsPanel } from '@/components/survey/QuestionSettingsPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  if (!data) return null;

  const template = data.survey_templates.find(t => t.id === id);
  if (!template) return notFound();

  const questions = template.question_ids
    .map(qid => data.survey_questions.find(q => q.id === qid))
    .filter((q): q is NonNullable<typeof q> => q != null);

  const selectedQuestion = selectedQuestionId
    ? questions.find(q => q.id === selectedQuestionId) ?? null
    : null;

  const selectedIndex = selectedQuestion
    ? questions.findIndex(q => q.id === selectedQuestion.id)
    : -1;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="px-4 py-2 border-b border-border shrink-0 flex items-center gap-3">
        <Link href="/templates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <IconArrowLeft size={14} /> Templateler
        </Link>
        <span className="text-sm font-semibold text-foreground">
          {template.name || 'İsimsiz Template'}
        </span>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: 268px */}
        <div className="shrink-0 border-r border-border overflow-hidden flex flex-col" style={{ width: '268px' }}>
          <TemplateLeftPanel
            template={template}
            questions={questions}
            selectedId={selectedQuestionId}
            onSelect={setSelectedQuestionId}
          />
        </div>

        {/* Middle: flex-1 */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-8">
          {selectedQuestion ? (
            <QuestionForm question={selectedQuestion} index={selectedIndex} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <p className="text-muted-foreground text-sm">
                {questions.length === 0
                  ? 'Soldan "+ Yeni Soru Ekle" ile başlayın.'
                  : 'Düzenlemek için soldan bir soru seçin.'}
              </p>
            </div>
          )}
        </div>

        {/* Right: 296px */}
        <div className="shrink-0 border-l border-border overflow-hidden" style={{ width: '296px' }}>
          {selectedQuestion ? (
            <QuestionSettingsPanel question={selectedQuestion} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted-foreground text-center px-4">
                Bir soru seçince ayarlar burada görünür.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Keyboard navigation — add `useEffect` for arrow key navigation**

In `TemplateDetailPage`, add after the `selectedIndex` line:

```tsx
import { useEffect } from 'react';

// ... inside component:
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!questions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = selectedIndex < questions.length - 1 ? selectedIndex + 1 : 0;
      setSelectedQuestionId(questions[next].id);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = selectedIndex > 0 ? selectedIndex - 1 : questions.length - 1;
      setSelectedQuestionId(questions[prev].id);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [questions, selectedIndex]);
```

- [ ] **Step 3: Final build — no errors**

```bash
cd /Volumes/projects/mood-doc && bun run build 2>&1 | grep -E "error|Error" | head -30
```
Expected: clean build.

- [ ] **Step 4: Run full test suite**

```bash
cd /Volumes/projects/mood-doc && bun run test 2>&1 | tail -10
```
Expected: all tests pass.

- [ ] **Step 5: Final commit**

```bash
cd /Volumes/projects/mood-doc && git add components/survey/QuestionForm.tsx components/survey/QuestionSettingsPanel.tsx app/\(app\)/templates/\[id\]/page.tsx && git commit -m "feat: add template detail editor (TypeForm-like 3-column layout)"
```

- [ ] **Step 6: Lint**

```bash
cd /Volumes/projects/mood-doc && bun run lint 2>&1 | grep -v "^$" | head -30
```
Fix any reported errors, then commit with:
```bash
git add -u && git commit -m "fix: resolve lint errors in survey template components"
```
