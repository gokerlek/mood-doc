# KB Mimari Yeniden Tasarım — Implementation Planı

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** mood-doc uygulamasını yeni map-driven KB mimarisine geçirmek; tag sistemi, component yönetimi ve sayfa detay editörü eklemek.

**Architecture:** Map leaf node'ları sayfa, group node'ları component grubu olarak çalışır. Her şey tek `knowledge_base.json` dosyasına yazılır. FAQ ve kurallar `context` alanıyla ilişkilendirilir.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zustand 5, TanStack Query, shadcn/ui, DnD Kit, React Flow, Tailwind CSS 4, Zod

---

## Genel Notlar

- Test framework yok — her task'ta manuel doğrulama adımları var
- localStorage key değişiyor: `moodivation-kb-v2` → `moodivation-kb-v3`
- Map'in ayrı `/api/map` endpoint'i kaldırılıyor, tek endpoint: `/api/knowledge-base`
- `platform`, `modules`, `global_rules.anonymity_limit`, `global_rules.reporting_limit` alanları kaldırılıyor
- ID üretimi için `crypto.randomUUID()` kullan

---

## PHASE 1: Foundation (Types + Store + API)

### Task 1: TypeScript Tiplerini Güncelle

**Files:**
- Modify: `lib/types.ts` (tümü)

**Step 1: `lib/types.ts` dosyasını tamamen yeniden yaz**

```typescript
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
```

**Step 2: TypeScript hatalarını kontrol et**

```bash
cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1 | head -50
```

Beklenen: Birçok hata olacak (henüz store/sayfa güncellenmedi). Sadece types.ts'in kendinde hata olmamalı.

**Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "refactor: KB v3.0 tip sistemi - tag, component, context, map-driven mimari"
```

---

### Task 2: `lib/defaults.ts` Güncelle

**Files:**
- Modify: `lib/defaults.ts`

**Step 1: defaults.ts dosyasını oku ve güncelle**

```typescript
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

export const emptyTag = (category_id: string): KbTag => ({
  id: crypto.randomUUID(),
  label: '',
  category_id,
});

export const emptyPageSection = (type: PageSection['type'], order: number): PageSection => ({
  id: crypto.randomUUID(),
  type,
  order,
  ...(type === 'text' ? { content: '' } : {}),
  ...(type === 'faq' ? { faq_ids: [] } : {}),
  ...(type === 'rules' ? { rule_ids: [] } : {}),
  ...(type === 'components' ? { component_ids: [] } : {}),
});

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
```

**Step 2: Commit**

```bash
git add lib/defaults.ts
git commit -m "refactor: defaults v3.0 - yeni tip yapısına uygun factory fonksiyonları"
```

---

### Task 3: kbStore Güncelle

**Files:**
- Modify: `stores/kbStore.ts`
- Delete: `stores/mapStore.ts`
- Delete: `stores/uiStore.ts`

**Step 1: `stores/kbStore.ts` dosyasını yeniden yaz**

```typescript
// stores/kbStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import type {
  KnowledgeBase, KbFaq, KbRule, KbGlossaryTerm,
  KbComponent, TagCategory, KbTag, MapNodeData, MapEdgeData,
  PageData, PageSection,
} from '@/lib/types';
import { emptyKnowledgeBase } from '@/lib/defaults';

interface KbState {
  data: KnowledgeBase | null;
  isDirty: boolean;
  isSaving: boolean;

  // Core
  setData: (kb: KnowledgeBase) => void;
  setIsSaving: (v: boolean) => void;
  resetDirty: () => void;

  // Tag Categories
  upsertTagCategory: (cat: TagCategory) => void;
  deleteTagCategory: (id: string) => void;

  // Tags
  upsertTag: (tag: KbTag) => void;
  deleteTag: (id: string) => void;

  // Components
  upsertComponent: (comp: KbComponent) => void;
  deleteComponent: (id: string) => void;

  // Map Nodes
  upsertNode: (node: MapNodeData) => void;
  deleteNode: (id: string) => void;
  updatePageData: (nodeId: string, data: PageData) => void;
  upsertPageSection: (nodeId: string, section: PageSection) => void;
  deletePageSection: (nodeId: string, sectionId: string) => void;
  reorderPageSections: (nodeId: string, sections: PageSection[]) => void;

  // Map Edges
  upsertEdge: (edge: MapEdgeData) => void;
  deleteEdge: (id: string) => void;

  // FAQ
  upsertFaq: (faq: KbFaq) => void;
  deleteFaq: (id: string) => void;

  // Rules
  upsertRule: (rule: KbRule) => void;
  deleteRule: (id: string) => void;

  // Glossary
  upsertGlossaryTerm: (term: KbGlossaryTerm) => void;
  deleteGlossaryTerm: (id: string) => void;

  // Agent
  updateAgentBehavior: (patch: Partial<KnowledgeBase['agent_behavior']>) => void;
}

const useKbStoreBase = create<KbState>()(
  persist(
    (set) => ({
      data: null,
      isDirty: false,
      isSaving: false,

      setData: (data) => set({ data, isDirty: false }),
      setIsSaving: (isSaving) => set({ isSaving }),
      resetDirty: () => set({ isDirty: false }),

      upsertTagCategory: (cat) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.tag_categories.findIndex(c => c.id === cat.id);
          const tag_categories = exists >= 0
            ? s.data.tag_categories.map(c => c.id === cat.id ? cat : c)
            : [...s.data.tag_categories, cat];
          return { isDirty: true, data: { ...s.data, tag_categories } };
        }),

      deleteTagCategory: (id) =>
        set((s) => {
          if (!s.data) return s;
          return {
            isDirty: true,
            data: {
              ...s.data,
              tag_categories: s.data.tag_categories.filter(c => c.id !== id),
              tags: s.data.tags.filter(t => t.category_id !== id),
            },
          };
        }),

      upsertTag: (tag) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.tags.findIndex(t => t.id === tag.id);
          const tags = exists >= 0
            ? s.data.tags.map(t => t.id === tag.id ? tag : t)
            : [...s.data.tags, tag];
          return { isDirty: true, data: { ...s.data, tags } };
        }),

      deleteTag: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, tags: s.data.tags.filter(t => t.id !== id) } } : s),

      upsertComponent: (comp) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.components.findIndex(c => c.id === comp.id);
          const components = exists >= 0
            ? s.data.components.map(c => c.id === comp.id ? comp : c)
            : [...s.data.components, comp];
          return { isDirty: true, data: { ...s.data, components } };
        }),

      deleteComponent: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, components: s.data.components.filter(c => c.id !== id) } } : s),

      upsertNode: (node) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.map.nodes.findIndex(n => n.id === node.id);
          const nodes = exists >= 0
            ? s.data.map.nodes.map(n => n.id === node.id ? node : n)
            : [...s.data.map.nodes, node];
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      deleteNode: (id) =>
        set((s) => {
          if (!s.data) return s;
          return {
            isDirty: true,
            data: {
              ...s.data,
              map: {
                nodes: s.data.map.nodes.filter(n => n.id !== id),
                edges: s.data.map.edges.filter(e => e.source !== id && e.target !== id),
              },
            },
          };
        }),

      updatePageData: (nodeId, pageData) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n =>
            n.id === nodeId ? { ...n, page_data: pageData } : n
          );
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      upsertPageSection: (nodeId, section) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n => {
            if (n.id !== nodeId || !n.page_data) return n;
            const exists = n.page_data.sections.findIndex(sec => sec.id === section.id);
            const sections = exists >= 0
              ? n.page_data.sections.map(sec => sec.id === section.id ? section : sec)
              : [...n.page_data.sections, section];
            return { ...n, page_data: { ...n.page_data, sections } };
          });
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      deletePageSection: (nodeId, sectionId) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n => {
            if (n.id !== nodeId || !n.page_data) return n;
            return {
              ...n,
              page_data: {
                ...n.page_data,
                sections: n.page_data.sections.filter(sec => sec.id !== sectionId),
              },
            };
          });
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      reorderPageSections: (nodeId, sections) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n =>
            n.id === nodeId && n.page_data
              ? { ...n, page_data: { ...n.page_data, sections } }
              : n
          );
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      upsertEdge: (edge) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.map.edges.findIndex(e => e.id === edge.id);
          const edges = exists >= 0
            ? s.data.map.edges.map(e => e.id === edge.id ? edge : e)
            : [...s.data.map.edges, edge];
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, edges } } };
        }),

      deleteEdge: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, map: { ...s.data.map, edges: s.data.map.edges.filter(e => e.id !== id) } } } : s),

      upsertFaq: (faq) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.faq.findIndex(f => f.id === faq.id);
          const faqs = exists >= 0
            ? s.data.faq.map(f => f.id === faq.id ? faq : f)
            : [...s.data.faq, faq];
          return { isDirty: true, data: { ...s.data, faq: faqs } };
        }),

      deleteFaq: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, faq: s.data.faq.filter(f => f.id !== id) } } : s),

      upsertRule: (rule) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.rules.findIndex(r => r.id === rule.id);
          const rules = exists >= 0
            ? s.data.rules.map(r => r.id === rule.id ? rule : r)
            : [...s.data.rules, rule];
          return { isDirty: true, data: { ...s.data, rules } };
        }),

      deleteRule: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, rules: s.data.rules.filter(r => r.id !== id) } } : s),

      upsertGlossaryTerm: (term) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.glossary.findIndex(g => g.id === term.id);
          const glossary = exists >= 0
            ? s.data.glossary.map(g => g.id === term.id ? term : g)
            : [...s.data.glossary, term];
          return { isDirty: true, data: { ...s.data, glossary } };
        }),

      deleteGlossaryTerm: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, glossary: s.data.glossary.filter(g => g.id !== id) } } : s),

      updateAgentBehavior: (patch) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, agent_behavior: { ...s.data.agent_behavior, ...patch } } } : s),
    }),
    {
      name: 'moodivation-kb-v3',
      partialize: (state) => ({ data: state.data, isDirty: state.isDirty }),
    }
  )
);

export const useKbStore = createSelectorHooks(useKbStoreBase);
```

**Step 2: mapStore ve uiStore sil**

```bash
rm /Volumes/projects/mood-doc/stores/mapStore.ts
rm /Volumes/projects/mood-doc/stores/uiStore.ts
```

**Step 3: Commit**

```bash
git add stores/kbStore.ts stores/mapStore.ts stores/uiStore.ts
git commit -m "refactor: kbStore v3 - tüm entity'ler tek store, mapStore ve uiStore kaldırıldı"
```

---

### Task 4: API Endpoint Güncelle

**Files:**
- Modify: `app/api/knowledge-base/route.ts`
- Delete: `app/api/knowledge-base/[module]/route.ts`
- Delete: `app/api/map/route.ts`

**Step 1: `/api/knowledge-base/route.ts` oku ve `emptyKnowledgeBase()` fallback'ini güncelle**

`fetchGitHubFile` çağrısında veri yoksa `emptyKnowledgeBase()` dönsün:

```typescript
// app/api/knowledge-base/route.ts — sadece fallback kısmı değişiyor
import { emptyKnowledgeBase } from '@/lib/defaults';

// GET handler içinde, veri yoksa:
return NextResponse.json(emptyKnowledgeBase());
```

**Step 2: Eski route'ları sil**

```bash
rm -rf /Volumes/projects/mood-doc/app/api/knowledge-base/\[module\]
rm -rf /Volumes/projects/mood-doc/app/api/map
```

**Step 3: hooks/useKb.ts içinde mapStore referanslarını kaldır**

`useLoadKb` hook'unda `mapStore` veya `uiStore` import'u varsa sil.

**Step 4: Commit**

```bash
git add app/api/ hooks/useKb.ts
git commit -m "refactor: API sadeleştirme - tek KB endpoint, map ve module API'ları kaldırıldı"
```

---

## PHASE 2: Tag Sistemi

### Task 5: Tag Yönetim Sayfası

**Files:**
- Create: `app/(app)/tags/page.tsx`
- Create: `components/tags/TagCategorySection.tsx`
- Create: `components/tags/TagBadge.tsx`

**Step 1: `components/tags/TagBadge.tsx` oluştur**

```typescript
// components/tags/TagBadge.tsx
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ label, onRemove, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary',
      className
    )}>
      #{label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-destructive transition-colors">
          <IconX size={10} />
        </button>
      )}
    </span>
  );
}
```

**Step 2: `components/tags/TagCategorySection.tsx` oluştur**

```typescript
// components/tags/TagCategorySection.tsx
'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import type { TagCategory, KbTag } from '@/lib/types';
import { emptyTag } from '@/lib/defaults';
import { TagBadge } from './TagBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';

interface Props {
  category: TagCategory;
  tags: KbTag[];
}

export function TagCategorySection({ category, tags }: Props) {
  const [newTagLabel, setNewTagLabel] = useState('');
  const [editingCatLabel, setEditingCatLabel] = useState(false);
  const [catLabel, setCatLabel] = useState(category.label);

  const upsertTag = useKbStore.useUpsertTag();
  const deleteTag = useKbStore.useDeleteTag();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();
  const deleteTagCategory = useKbStore.useDeleteTagCategory();

  const handleAddTag = () => {
    if (!newTagLabel.trim()) return;
    upsertTag(emptyTag(category.id, newTagLabel.trim()));
    setNewTagLabel('');
  };

  const handleSaveCatLabel = () => {
    upsertTagCategory({ ...category, label: catLabel });
    setEditingCatLabel(false);
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        {editingCatLabel ? (
          <div className="flex items-center gap-2">
            <Input
              value={catLabel}
              onChange={e => setCatLabel(e.target.value)}
              className="h-7 text-sm w-40"
              onKeyDown={e => e.key === 'Enter' && handleSaveCatLabel()}
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSaveCatLabel}>Kaydet</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{category.label}</span>
            <button onClick={() => setEditingCatLabel(true)} className="text-muted-foreground hover:text-foreground">
              <IconEdit size={13} />
            </button>
          </div>
        )}
        <button
          onClick={() => deleteTagCategory(category.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <IconTrash size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <TagBadge key={tag.id} label={tag.label} onRemove={() => deleteTag(tag.id)} />
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Yeni tag..."
          value={newTagLabel}
          onChange={e => setNewTagLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTag()}
          className="h-7 text-xs"
        />
        <Button size="sm" variant="outline" onClick={handleAddTag}>
          <IconPlus size={13} />
        </Button>
      </div>
    </div>
  );
}
```

**Step 3: `app/(app)/tags/page.tsx` oluştur**

```typescript
// app/(app)/tags/page.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyTagCategory } from '@/lib/defaults';
import { TagCategorySection } from '@/components/tags/TagCategorySection';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/shared/AppHeader';
import { IconPlus } from '@tabler/icons-react';

export default function TagsPage() {
  const data = useKbStore.useData();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();

  if (!data) return null;

  const { tag_categories, tags } = data;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <AppHeader
        title="Tag Yönetimi"
        description="Tüm tag kategorilerini ve etiketleri buradan yönetin."
        action={
          <Button size="sm" onClick={() => upsertTagCategory({ ...emptyTagCategory(), label: 'Yeni Kategori' })}>
            <IconPlus size={14} />
            Kategori Ekle
          </Button>
        }
      />

      {tag_categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz kategori yok. Ekleyin.</p>
      ) : (
        <div className="space-y-3">
          {tag_categories.map(cat => (
            <TagCategorySection
              key={cat.id}
              category={cat}
              tags={tags.filter(t => t.category_id === cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: `emptyTagCategory` ve `emptyTag` fonksiyonlarında label parametresi eksikse güncelle**

`lib/defaults.ts` içindeki `emptyTag` fonksiyonunu şu şekilde güncelle:
```typescript
export const emptyTag = (category_id: string, label = ''): KbTag => ({
  id: crypto.randomUUID(),
  label,
  category_id,
});
```

**Step 5: Doğrula**

```bash
cd /Volumes/projects/mood-doc && npm run dev
```
Tarayıcıda `/tags` sayfasını aç. Kategori ekle, tag ekle, sil.

**Step 6: Commit**

```bash
git add app/\(app\)/tags/ components/tags/ lib/defaults.ts
git commit -m "feat: tag yönetim sayfası - kategorili ve dinamik tag sistemi"
```

---

### Task 6: Reusable TagSelector Component

**Files:**
- Create: `components/tags/TagSelector.tsx`

**Step 1: `components/tags/TagSelector.tsx` oluştur**

```typescript
// components/tags/TagSelector.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from './TagBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { IconTags } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function TagSelector({ selectedIds, onChange, className }: Props) {
  const data = useKbStore.useData();
  if (!data) return null;

  const { tags, tag_categories } = data;

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(t => t !== id)
      : [...selectedIds, id]
    );
  };

  const selectedTags = tags.filter(t => selectedIds.includes(t.id));

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {selectedTags.map(tag => (
        <TagBadge key={tag.id} label={tag.label} onRemove={() => toggle(tag.id)} />
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="h-6 text-xs gap-1">
            <IconTags size={11} />
            Tag Ekle
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 space-y-3" align="start">
          {tag_categories.map(cat => {
            const catTags = tags.filter(t => t.category_id === cat.id);
            if (!catTags.length) return null;
            return (
              <div key={cat.id}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-1">
                  {catTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggle(tag.id)}
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs transition-colors',
                        selectedIds.includes(tag.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      #{tag.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {tag_categories.length === 0 && (
            <p className="text-xs text-muted-foreground">Önce /tags sayfasından tag oluşturun.</p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/tags/TagSelector.tsx
git commit -m "feat: TagSelector - popover ile kategorili tag seçimi"
```

---

## PHASE 3: Component Sistemi

### Task 7: Component List Sayfası

**Files:**
- Create: `app/(app)/components/page.tsx`
- Create: `components/kb-components/ComponentCard.tsx`

**Step 1: `components/kb-components/ComponentCard.tsx` oluştur**

```typescript
// components/kb-components/ComponentCard.tsx
'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent } from '@/lib/types';
import { TagBadge } from '@/components/tags/TagBadge';
import { IconChevronRight, IconPuzzle, IconTrash } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useState } from 'react';

interface Props {
  component: KbComponent;
}

export function ComponentCard({ component }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const data = useKbStore.useData();
  const deleteComponent = useKbStore.useDeleteComponent();

  const tags = data?.tags.filter(t => component.tag_ids.includes(t.id)) ?? [];
  const faqCount = component.faq_ids.length;
  const ruleCount = component.rule_ids.length;

  return (
    <>
      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors group">
        <Link href={`/components/${component.id}`} className="flex items-start gap-3 flex-1 min-w-0">
          <IconPuzzle size={18} className="text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm">{component.name || 'İsimsiz Component'}</p>
            {component.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{component.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex flex-wrap gap-1">
                {tags.map(t => <TagBadge key={t.id} label={t.label} />)}
              </div>
              <span className="text-[11px] text-muted-foreground">{faqCount} FAQ · {ruleCount} Kural</span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setConfirmOpen(true)} className="p-1.5 hover:text-destructive transition-colors text-muted-foreground">
            <IconTrash size={14} />
          </button>
          <IconChevronRight size={14} className="text-muted-foreground" />
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteComponent(component.id)}
        title="Component silinsin mi?"
        description="Bu işlem geri alınamaz."
      />
    </>
  );
}
```

**Step 2: `app/(app)/components/page.tsx` oluştur**

```typescript
// app/(app)/components/page.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { AppHeader } from '@/components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ComponentsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();

  if (!data) return null;

  const handleCreate = () => {
    const comp = emptyComponent();
    upsertComponent(comp);
    router.push(`/components/${comp.id}`);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <AppHeader
        title="Componentler"
        description="Client-UI'daki widget ve componentleri buradan tanımlayın."
        action={
          <Button size="sm" onClick={handleCreate}>
            <IconPlus size={14} />
            Yeni Component
          </Button>
        }
      />
      {data.components.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz component yok.</p>
      ) : (
        <div className="space-y-2">
          {data.components.map(comp => (
            <ComponentCard key={comp.id} component={comp} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add app/\(app\)/components/page.tsx components/kb-components/
git commit -m "feat: component list sayfası"
```

---

### Task 8: Component Detay Sayfası

**Files:**
- Create: `app/(app)/components/[id]/page.tsx`
- Create: `components/kb-components/ComponentFaqSection.tsx`
- Create: `components/kb-components/ComponentRuleSection.tsx`

**Step 1: `app/(app)/components/[id]/page.tsx` oluştur**

```typescript
// app/(app)/components/[id]/page.tsx
'use client';
import { use } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { TagSelector } from '@/components/tags/TagSelector';
import { ComponentFaqSection } from '@/components/kb-components/ComponentFaqSection';
import { ComponentRuleSection } from '@/components/kb-components/ComponentRuleSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ComponentDetailPage({ params }: Props) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();

  if (!data) return null;
  const comp = data.components.find(c => c.id === id);
  if (!comp) return notFound();

  const update = (patch: Partial<typeof comp>) => upsertComponent({ ...comp, ...patch });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Link href="/components" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <IconArrowLeft size={14} />
        Componentler
      </Link>

      <div className="space-y-4">
        <Input
          value={comp.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="Component adı..."
          className="text-lg font-semibold"
        />
        <Textarea
          value={comp.description}
          onChange={e => update({ description: e.target.value })}
          placeholder="Ne işe yarar, nasıl kullanılır..."
          rows={3}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
          <TagSelector
            selectedIds={comp.tag_ids}
            onChange={tag_ids => update({ tag_ids })}
          />
        </div>
      </div>

      <ComponentFaqSection componentId={id} faqIds={comp.faq_ids} />
      <ComponentRuleSection componentId={id} ruleIds={comp.rule_ids} />
    </div>
  );
}
```

**Step 2: `components/kb-components/ComponentFaqSection.tsx` oluştur**

```typescript
// components/kb-components/ComponentFaqSection.tsx
'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { emptyFaq } from '@/lib/defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from '@/components/tags/TagSelector';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface Props {
  componentId: string;
  faqIds: string[];
}

export function ComponentFaqSection({ componentId, faqIds }: Props) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();
  const upsertComponent = useKbStore.useUpsertComponent();

  if (!data) return null;

  const faqs = data.faq.filter(f => faqIds.includes(f.id));
  const comp = data.components.find(c => c.id === componentId);

  const handleAdd = () => {
    if (!comp) return;
    const faq = emptyFaq({ type: 'component', component_id: componentId });
    upsertFaq(faq);
    upsertComponent({ ...comp, faq_ids: [...comp.faq_ids, faq.id] });
  };

  const handleDelete = (faqId: string) => {
    if (!comp) return;
    deleteFaq(faqId);
    upsertComponent({ ...comp, faq_ids: comp.faq_ids.filter(id => id !== faqId) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">FAQ'lar</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <IconPlus size={13} />
          Ekle
        </Button>
      </div>
      {faqs.map(faq => (
        <div key={faq.id} className="border border-border rounded-lg p-3 space-y-2">
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
            <button onClick={() => handleDelete(faq.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <IconTrash size={14} />
            </button>
          </div>
        </div>
      ))}
      {faqs.length === 0 && <p className="text-xs text-muted-foreground">Henüz FAQ yok.</p>}
    </div>
  );
}
```

**Step 3: `ComponentRuleSection.tsx` oluştur** — ComponentFaqSection ile aynı mantık, `emptyRule` ve `rules` listesiyle:

```typescript
// components/kb-components/ComponentRuleSection.tsx
// ComponentFaqSection ile aynı yapı, faq yerine rule kullan
// emptyRule({ type: 'component', component_id: componentId })
// comp.rule_ids listesini güncelle
```

(Detay için ComponentFaqSection'ı referans al, sadece faq → rule değiştir)

**Step 4: Doğrula**

```bash
npm run dev
```
`/components` → yeni component oluştur → detay sayfasında ad, açıklama, tag, FAQ, kural ekle.

**Step 5: Commit**

```bash
git add app/\(app\)/components/ components/kb-components/
git commit -m "feat: component detay sayfası - FAQ, kural ve tag yönetimi"
```

---

## PHASE 4: Pages Sistemi

### Task 9: Pages List Sayfası

**Files:**
- Create: `app/(app)/pages/page.tsx`
- Create: `components/pages/PageCard.tsx`

**Step 1: `components/pages/PageCard.tsx` oluştur**

```typescript
// components/pages/PageCard.tsx
'use client';
import Link from 'next/link';
import type { MapNodeData } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from '@/components/tags/TagBadge';
import { IconLayoutDashboard, IconChevronRight } from '@tabler/icons-react';

interface Props {
  node: MapNodeData;
}

export function PageCard({ node }: Props) {
  const data = useKbStore.useData();
  const tags = data?.tags.filter(t => node.page_data?.tag_ids.includes(t.id)) ?? [];
  const sectionCount = node.page_data?.sections.length ?? 0;

  return (
    <Link
      href={`/pages/${node.id}`}
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <IconLayoutDashboard size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-sm">{node.label}</p>
          {node.page_data?.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{node.page_data.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex flex-wrap gap-1">
              {tags.map(t => <TagBadge key={t.id} label={t.label} />)}
            </div>
            {sectionCount > 0 && (
              <span className="text-[11px] text-muted-foreground">{sectionCount} section</span>
            )}
          </div>
        </div>
      </div>
      <IconChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
```

**Step 2: `app/(app)/pages/page.tsx` oluştur**

```typescript
// app/(app)/pages/page.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { AppHeader } from '@/components/shared/AppHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { IconSitemap } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PagesPage() {
  const data = useKbStore.useData();
  if (!data) return null;

  // Leaf node'lar: parent_id'si olmayan VE başka node'ların parent'ı olmayan node'lar
  const parentIds = new Set(data.map.nodes.map(n => n.parent_id).filter(Boolean));
  const leafNodes = data.map.nodes.filter(n => !parentIds.has(n.id));

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <AppHeader
        title="Sayfalar"
        description="Map'teki her leaf node bir sayfadır. Map'ten node ekleyebilirsiniz."
        action={
          <Button size="sm" variant="outline" asChild>
            <Link href="/map">
              <IconSitemap size={14} />
              Map'e Git
            </Link>
          </Button>
        }
      />
      {leafNodes.length === 0 ? (
        <EmptyState
          title="Henüz sayfa yok"
          description="Map'e node ekleyerek sayfa oluşturun."
        />
      ) : (
        <div className="space-y-2">
          {leafNodes.map(node => (
            <PageCard key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add app/\(app\)/pages/page.tsx components/pages/
git commit -m "feat: pages listesi - map leaf node'larını listeler"
```

---

### Task 10: Page Detay Editörü — Temel Yapı

**Files:**
- Create: `app/(app)/pages/[id]/page.tsx`
- Create: `components/pages/SectionList.tsx`
- Create: `components/pages/AddSectionPalette.tsx`

**Step 1: `app/(app)/pages/[id]/page.tsx` oluştur**

```typescript
// app/(app)/pages/[id]/page.tsx
'use client';
import { use } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { TagSelector } from '@/components/tags/TagSelector';
import { SectionList } from '@/components/pages/SectionList';
import { AddSectionPalette } from '@/components/pages/AddSectionPalette';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { emptyPageData } from '@/lib/defaults';

interface Props {
  params: Promise<{ id: string }>;
}

export default function PageDetailPage({ params }: Props) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const updatePageData = useKbStore.useUpdatePageData();

  if (!data) return null;
  const node = data.map.nodes.find(n => n.id === id);
  if (!node) return notFound();

  const pageData = node.page_data ?? emptyPageData();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Link href="/pages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <IconArrowLeft size={14} />
        Sayfalar
      </Link>

      <h1 className="text-xl font-semibold">{node.label}</h1>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Sayfa Açıklaması</p>
          <Textarea
            value={pageData.description}
            onChange={e => updatePageData(id, { ...pageData, description: e.target.value })}
            placeholder="Bu sayfa ne işe yarar?..."
            rows={3}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Taglar</p>
          <TagSelector
            selectedIds={pageData.tag_ids}
            onChange={tag_ids => updatePageData(id, { ...pageData, tag_ids })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-sm">İçerik Section'ları</h2>
          <AddSectionPalette nodeId={id} currentSections={pageData.sections} />
        </div>
        <SectionList nodeId={id} sections={pageData.sections} />
      </div>
    </div>
  );
}
```

**Step 2: `components/pages/AddSectionPalette.tsx` oluştur**

```typescript
// components/pages/AddSectionPalette.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyPageSection } from '@/lib/defaults';
import type { PageSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IconPlus, IconFileText, IconHelp, IconShieldCheck, IconPuzzle } from '@tabler/icons-react';

const SECTION_TYPES = [
  { type: 'text' as const, label: 'Metin', icon: IconFileText },
  { type: 'faq' as const, label: 'FAQ', icon: IconHelp },
  { type: 'rules' as const, label: 'Kurallar', icon: IconShieldCheck },
  { type: 'components' as const, label: 'Componentler', icon: IconPuzzle },
];

interface Props {
  nodeId: string;
  currentSections: PageSection[];
}

export function AddSectionPalette({ nodeId, currentSections }: Props) {
  const upsertPageSection = useKbStore.useUpsertPageSection();

  const handleAdd = (type: PageSection['type']) => {
    const section = emptyPageSection(type, currentSections.length);
    upsertPageSection(nodeId, section);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <IconPlus size={13} />
          Section Ekle
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SECTION_TYPES.map(({ type, label, icon: Icon }) => (
          <DropdownMenuItem key={type} onClick={() => handleAdd(type)} className="gap-2">
            <Icon size={14} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 3: Commit**

```bash
git add app/\(app\)/pages/ components/pages/
git commit -m "feat: sayfa detay editörü temel yapısı - açıklama, tag, section ekleme"
```

---

### Task 11: SectionList — DnD ile Section Sıralaması

**Files:**
- Create: `components/pages/SectionList.tsx`
- Create: `components/pages/sections/TextSection.tsx`
- Create: `components/pages/sections/FaqSection.tsx`
- Create: `components/pages/sections/RulesSection.tsx`
- Create: `components/pages/sections/ComponentsSection.tsx`

**Step 1: `components/pages/SectionList.tsx` oluştur**

```typescript
// components/pages/SectionList.tsx
'use client';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKbStore } from '@/stores/kbStore';
import type { PageSection } from '@/lib/types';
import { TextSection } from './sections/TextSection';
import { FaqSection } from './sections/FaqSection';
import { RulesSection } from './sections/RulesSection';
import { ComponentsSection } from './sections/ComponentsSection';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';

function SectionRenderer({ section, nodeId }: { section: PageSection; nodeId: string }) {
  switch (section.type) {
    case 'text': return <TextSection section={section} nodeId={nodeId} />;
    case 'faq': return <FaqSection section={section} nodeId={nodeId} />;
    case 'rules': return <RulesSection section={section} nodeId={nodeId} />;
    case 'components': return <ComponentsSection section={section} nodeId={nodeId} />;
  }
}

function SortableSection({ section, nodeId }: { section: PageSection; nodeId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const deletePageSection = useKbStore.useDeletePageSection();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border border-border rounded-lg p-4 bg-background group ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <IconGripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <SectionRenderer section={section} nodeId={nodeId} />
        </div>
        <button
          onClick={() => deletePageSection(nodeId, section.id)}
          className="mt-0.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}

interface Props {
  nodeId: string;
  sections: PageSection[];
}

export function SectionList({ nodeId, sections }: Props) {
  const reorderPageSections = useKbStore.useReorderPageSections();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex(s => s.id === active.id);
    const newIndex = sorted.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    reorderPageSections(nodeId, reordered);
  };

  if (sorted.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">Henüz section yok. Yukarıdan ekleyin.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sorted.map(section => (
            <SortableSection key={section.id} section={section} nodeId={nodeId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

**Step 2: `TextSection.tsx` oluştur**

```typescript
// components/pages/sections/TextSection.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import type { PageSection } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface Props { section: PageSection; nodeId: string; }

export function TextSection({ section, nodeId }: Props) {
  const upsertPageSection = useKbStore.useUpsertPageSection();
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Metin</p>
      <Textarea
        value={section.content ?? ''}
        onChange={e => upsertPageSection(nodeId, { ...section, content: e.target.value })}
        placeholder="İçerik yazın..."
        rows={4}
      />
    </div>
  );
}
```

**Step 3: `FaqSection.tsx` oluştur**

```typescript
// components/pages/sections/FaqSection.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import type { PageSection } from '@/lib/types';
import { emptyFaq } from '@/lib/defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from '@/components/tags/TagSelector';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface Props { section: PageSection; nodeId: string; }

export function FaqSection({ section, nodeId }: Props) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();
  const upsertPageSection = useKbStore.useUpsertPageSection();

  if (!data) return null;
  const faqIds = section.faq_ids ?? [];
  const faqs = data.faq.filter(f => faqIds.includes(f.id));

  const handleAdd = () => {
    const faq = emptyFaq({ type: 'page', node_id: nodeId });
    upsertFaq(faq);
    upsertPageSection(nodeId, { ...section, faq_ids: [...faqIds, faq.id] });
  };

  const handleDelete = (faqId: string) => {
    deleteFaq(faqId);
    upsertPageSection(nodeId, { ...section, faq_ids: faqIds.filter(id => id !== faqId) });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">FAQ</p>
        <Button size="sm" variant="ghost" onClick={handleAdd}>
          <IconPlus size={12} /> Ekle
        </Button>
      </div>
      {faqs.map(faq => (
        <div key={faq.id} className="border border-border/50 rounded-md p-2.5 space-y-1.5">
          <Input value={faq.question} onChange={e => upsertFaq({ ...faq, question: e.target.value })} placeholder="Soru..." className="h-7 text-xs" />
          <Textarea value={faq.answer} onChange={e => upsertFaq({ ...faq, answer: e.target.value })} placeholder="Cevap..." rows={2} className="text-xs" />
          <div className="flex items-center justify-between">
            <TagSelector selectedIds={faq.tag_ids} onChange={tag_ids => upsertFaq({ ...faq, tag_ids })} />
            <button onClick={() => handleDelete(faq.id)} className="text-muted-foreground hover:text-destructive">
              <IconTrash size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: `RulesSection.tsx` ve `ComponentsSection.tsx` oluştur** (FaqSection mantığıyla):

```
RulesSection: faq yerine rule, emptyRule kullan, rule_ids listesini güncelle
ComponentsSection: component seçimi için data.components listesinden checkbox/badge ile seçim, component_ids listesini güncelle
```

**Step 5: Doğrula**

```bash
npm run dev
```
Bir sayfanın detayına git → section ekle, sürükle-bırak ile sırala, section sil.

**Step 6: Commit**

```bash
git add components/pages/
git commit -m "feat: sayfa detay editörü - DnD section listesi ve section tipleri"
```

---

## PHASE 5: Mevcut Sayfaları Güncelle

### Task 12: FAQ Sayfasını v3 Yapısına Geçir

**Files:**
- Modify: `app/(app)/faq/page.tsx`
- Modify: `components/faq/FaqForm.tsx` (context seçici ekle)

**Step 1: FAQ sayfasında `module_id` referanslarını `context` ile değiştir**

- `data.faq` artık `context` alanı taşıyor
- Global sayfada gösterilecek FAQ'lar: `context.type === 'global'` olanlar + tüm FAQ'lar (filtrelenebilir)
- Yeni FAQ ekleme formuna `context` seçici ekle

**Step 2: `FaqForm.tsx` içine context seçici ekle**

```typescript
// Context seçici için yeni alan:
// "Bu FAQ hangi kapsamda?" → Global | Sayfa | Component
// Sayfa seçilirse → map leaf node'larından dropdown
// Component seçilirse → components listesinden dropdown
```

**Step 3: Commit**

```bash
git add app/\(app\)/faq/ components/faq/
git commit -m "refactor: FAQ sayfası v3 - context alanı ve kapsam seçici"
```

---

### Task 13: Rules Sayfasını v3 Yapısına Geçir

**Files:**
- Modify: `app/(app)/rules/page.tsx`

**Step 1:** FAQ sayfasıyla aynı mantık — `global_rules.other_rules` yapısından düz `rules` listesine geçiş. Context seçici ekle.

**Step 2: Commit**

```bash
git add app/\(app\)/rules/
git commit -m "refactor: rules sayfası v3 - context alanı, global_rules yapısı kaldırıldı"
```

---

### Task 14: Platform Sayfasını Kaldır

**Files:**
- Delete: `app/(app)/page.tsx` (Platform sayfası)

Platform verileri artık yok. Ana sayfa (`/`) yerine `/pages`'e redirect ekle.

```typescript
// app/(app)/page.tsx
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/pages');
}
```

**Step 2: Commit**

```bash
git add app/\(app\)/page.tsx
git commit -m "refactor: platform sayfası kaldırıldı, ana sayfa /pages'e yönlendiriyor"
```

---

### Task 15: Map Sayfasını v3 Yapısına Geçir

**Files:**
- Modify: `app/(app)/map/page.tsx`
- Modify: `components/map/NodeDrawer.tsx`
- Modify: `hooks/map/useMapPersistence.ts`

**Step 1: `useMapPersistence.ts` güncelle** — ayrı `/api/map` endpoint'i yerine kbStore'dan okuyup yazacak:

```typescript
// useMapPersistence.ts
// loadMapData: kbStore.data.map'ten oku
// saveMapData: kbStore.upsertNode / upsertEdge kullan
// API çağrısı yok
```

**Step 2: `NodeDrawer.tsx` güncelle** — node seçilince `/pages/{id}` sayfasına git linki ekle:

```typescript
<Link href={`/pages/${node.id}`}>
  Sayfa Detayını Düzenle →
</Link>
```

**Step 3: MapNode'u oluştururken `page_data` initialize et**

Yeni node eklenirken `emptyPageData()` ile `page_data` set edilsin.

**Step 4: Commit**

```bash
git add app/\(app\)/map/ components/map/ hooks/map/
git commit -m "refactor: map v3 - kbStore entegrasyonu, ayrı API kaldırıldı, sayfa detay linki eklendi"
```

---

## PHASE 6: Navigation Güncelle

### Task 16: Sidebar'ı Güncelle

**Files:**
- Modify: `app/(app)/layout.tsx`

**Step 1: NAV_GROUPS'u güncelle**

```typescript
const NAV_GROUPS = [
  {
    label: 'Yapı',
    items: [
      { label: 'Harita', icon: IconSitemap, href: '/map' },
      { label: 'Sayfalar', icon: IconLayoutDashboard, href: '/pages' },
      { label: 'Componentler', icon: IconPuzzle, href: '/components' },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { label: 'FAQ', icon: IconHelp, href: '/faq' },
      { label: 'Kurallar', icon: IconShieldCheck, href: '/rules' },
      { label: 'Sözlük', icon: IconAlphabetLatin, href: '/glossary' },
      { label: 'Taglar', icon: IconTags, href: '/tags' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Agent', icon: IconRobot, href: '/agent' },
    ],
  },
] as const;
```

**Step 2: Commit**

```bash
git add app/\(app\)/layout.tsx
git commit -m "feat: sidebar güncellendi - yeni navigasyon yapısı"
```

---

## PHASE 7: Temizlik

### Task 17: Kullanılmayan Dosyaları Sil

**Files:**
- Delete: `app/(app)/map` map artık sadece harita, API bağlantısı kaldırıldı
- Delete: `stores/mapStore.ts` (Task 3'te zaten silinmişti)
- Delete: `stores/uiStore.ts` (Task 3'te zaten silinmişti)
- Modify: `lib/map/flowBuilders.ts` — yeni `MapNodeData` tipine uygun güncelle

**Step 1: TypeScript hatalarını sıfıra indir**

```bash
cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1
```

Tüm hatalar giderilene kadar düzelt.

**Step 2: Build al**

```bash
npm run build
```

Beklenen: Başarılı build.

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: v3 temizlik - kullanılmayan dosyalar ve import'lar kaldırıldı"
```

---

## Özet

| Phase | Tasks | Kapsam |
|-------|-------|--------|
| Foundation | 1-4 | Types, Store, API |
| Tag Sistemi | 5-6 | `/tags` sayfası, TagSelector |
| Component Sistemi | 7-8 | `/components`, `/components/[id]` |
| Pages Sistemi | 9-11 | `/pages`, `/pages/[id]`, DnD sections |
| Mevcut Güncellemeler | 12-15 | FAQ, Rules, Platform, Map |
| Navigation | 16 | Sidebar |
| Temizlik | 17 | TypeScript, Build |

**Changelog özelliği bu planda kapsam dışıdır.**
