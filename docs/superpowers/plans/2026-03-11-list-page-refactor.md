# Liste Sayfası Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate duplicate patterns across 7 list pages by extracting shared components (`ListPageLayout`, `EmptyState`, `NoResults`, `SectionListHeader`, `TagFilterBar`) and hooks (`useLeafNodes`, `useContextSplit`).

**Architecture:** Foundation-first — shared components and hooks are created first, then pages are migrated one at a time. Each migration is self-contained and independently committable. Detail pages (`/[id]`) are untouched.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Zustand 5 (auto-selectors via `useKbStore.useX()`), shadcn/ui, `@tabler/icons-react`, Vitest (pure logic tests only — no jsdom/component tests)

**Spec:** `docs/superpowers/specs/2026-03-11-list-page-refactor-design.md`

---

## Chunk 1: Foundation Components

### Task 1: Export PageHeaderProps

**Files:**
- Modify: `components/shared/PageHeader.tsx:4`

- [ ] **Step 1: Export the interface**

Change line 4 from:
```ts
interface PageHeaderProps {
```
to:
```ts
export interface PageHeaderProps {
```

- [ ] **Step 2: Verify lint passes**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/PageHeader.tsx
git commit -m "refactor: export PageHeaderProps interface"
```

---

### Task 2: Create ListPageLayout

**Files:**
- Create: `components/shared/ListPageLayout.tsx`

`ListPageLayout` owns the outer page skeleton: `flex flex-col min-h-full` wrapper → `border-b` header zone → `max-w-Xkl mx-auto` content zone. Callers pass PageHeader props directly; `className` is intentionally omitted (`Omit`) so internal layout can't be broken from outside.

- [ ] **Step 1: Create the component**

```tsx
// components/shared/ListPageLayout.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import type { PageHeaderProps } from '@/components/shared/PageHeader';

interface ListPageLayoutProps extends Omit<PageHeaderProps, 'className'> {
  maxWidth?: '4xl' | '5xl';
  children: ReactNode;
}

export function ListPageLayout({
  maxWidth = '4xl',
  children,
  ...headerProps
}: ListPageLayoutProps) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border">
        <PageHeader {...headerProps} className="pb-0 mb-0 border-b-0" />
      </div>
      <div
        className={cn(
          'px-6 py-6 w-full mx-auto space-y-5',
          maxWidth === '5xl' ? 'max-w-5xl' : 'max-w-4xl'
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/ListPageLayout.tsx
git commit -m "feat: add ListPageLayout shared component"
```

---

### Task 3: Update EmptyState

**Files:**
- Modify: `components/shared/EmptyState.tsx`

**Note:** The `action` prop is changed from `{ label: string; onClick: () => void }` to `ReactNode`. This is a spec refinement — `pages/page.tsx`'s empty state uses `<Link>` (not a button), so `ReactNode` handles both cases cleanly. All callers pass their own action node.

- [ ] **Step 1: Replace the file contents**

```tsx
// components/shared/EmptyState.tsx
import type { ReactNode } from 'react';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
      <div className="text-muted-foreground/40 flex justify-center mb-2">
        {icon ?? <IconInbox size={28} strokeWidth={1.5} />}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors (EmptyState is not used anywhere yet — no call site breakage)

- [ ] **Step 3: Commit**

```bash
git add components/shared/EmptyState.tsx
git commit -m "refactor: update EmptyState style and action prop to ReactNode"
```

---

### Task 4: Create NoResults

**Files:**
- Create: `components/shared/NoResults.tsx`

`onClear` semantics vary per page: most pages pass `() => setSearch('')`; `faq/page.tsx` passes `() => router.replace(pathname, { scroll: false })` to clear both `?q=` and `?tag=` params. `clearLabel` handles the tag-filter variant ("Filtreyi temizle").

- [ ] **Step 1: Create the component**

```tsx
// components/shared/NoResults.tsx
import { Button } from '@/components/ui/button';

interface NoResultsProps {
  message?: string;
  onClear: () => void;
  clearLabel?: string;
}

export function NoResults({
  message = 'Eşleşen sonuç bulunamadı.',
  onClear,
  clearLabel = 'Temizle',
}: NoResultsProps) {
  return (
    <p className="text-center py-8 text-sm text-muted-foreground">
      {message}{' '}
      <Button variant="link" onClick={onClear} className="p-0 h-auto">
        {clearLabel}
      </Button>
    </p>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/NoResults.tsx
git commit -m "feat: add NoResults shared component"
```

---

### Task 5: Create SectionListHeader

**Files:**
- Create: `components/shared/SectionListHeader.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/shared/SectionListHeader.tsx
import type { ReactNode } from 'react';

interface SectionListHeaderProps {
  icon: ReactNode;
  label: ReactNode;
  count: number;
}

export function SectionListHeader({ icon, label, count }: SectionListHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
      <span className="text-xs text-muted-foreground ml-1">{count}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/SectionListHeader.tsx
git commit -m "feat: add SectionListHeader shared component"
```

---

### Task 6: Create TagFilterBar

**Files:**
- Create: `components/shared/TagFilterBar.tsx`

**Behavioral note:** `faq/page.tsx` currently shows raw `tag_id` strings in tag buttons (`#{tag}`). After migration it will show `tag.label`, consistent with `components/page.tsx`. This is an intentional improvement.

- [ ] **Step 1: Create the component**

```tsx
// components/shared/TagFilterBar.tsx
import type { KbTag } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface TagFilterBarProps {
  tagIds: string[];
  tags: KbTag[];
  activeTag: string;
  onSelect: (tagId: string) => void;
}

export function TagFilterBar({ tagIds, tags, activeTag, onSelect }: TagFilterBarProps) {
  if (tagIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        size="sm"
        variant={!activeTag ? 'default' : 'outline'}
        onClick={() => onSelect('')}
        className="rounded-full"
      >
        Tümü
      </Button>
      {tagIds.map(tagId => {
        const tag = tags.find(t => t.id === tagId);
        return tag ? (
          <Button
            key={tagId}
            size="sm"
            variant={activeTag === tagId ? 'default' : 'outline'}
            onClick={() => onSelect(activeTag === tagId ? '' : tagId)}
            className="rounded-full"
          >
            {tag.label}
          </Button>
        ) : null;
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/TagFilterBar.tsx
git commit -m "feat: add TagFilterBar shared component"
```

---

## Chunk 2: Hooks + Simple Page Migrations

### Task 7: Create useLeafNodes

**Files:**
- Create: `hooks/useLeafNodes.ts`
- Create: `__tests__/useLeafNodes.test.ts`

The pure computation (`getLeafNodes`) is extracted and exported for testing. The hook wraps it with `useMemo` and the Zustand store.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/useLeafNodes.test.ts
import { describe, it, expect } from 'vitest';
import type { MapNodeData } from '@/lib/types';

// Pure function extracted from hook for testability
function getLeafNodes(nodes: MapNodeData[]): MapNodeData[] {
  const parentIds = new Set(
    nodes.map(n => n.parent_id).filter((id): id is string => id != null)
  );
  return nodes.filter(n => !parentIds.has(n.id));
}

const baseNode = (id: string, parent_id?: string | null): MapNodeData => ({
  id,
  label: id,
  x: 0,
  y: 0,
  parent_id,
});

describe('getLeafNodes', () => {
  it('returns all nodes when none have children', () => {
    const nodes = [baseNode('a'), baseNode('b')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['a', 'b']);
  });

  it('excludes nodes that are parents', () => {
    const nodes = [baseNode('parent'), baseNode('child', 'parent')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['child']);
  });

  it('handles empty array', () => {
    expect(getLeafNodes([])).toEqual([]);
  });

  it('handles deep chains — only root parent is excluded', () => {
    const nodes = [baseNode('root'), baseNode('mid', 'root'), baseNode('leaf', 'mid')];
    // root is parent of mid → excluded; mid is parent of leaf → excluded; leaf is a leaf
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['leaf']);
  });

  it('treats null parent_id as a leaf node, not a parent reference', () => {
    const nodes = [baseNode('a', null), baseNode('b')];
    expect(getLeafNodes(nodes).map(n => n.id)).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run test — expect PASS (inline function)**

```bash
bun run test __tests__/useLeafNodes.test.ts
```
Expected: PASS — the pure function is defined inline in the test file at this point, so all 5 tests pass. (TDD flow: green with inline → Step 3 moves the function to the hook → Step 4 replaces inline with import → still green)

- [ ] **Step 3: Create the hook**

```ts
// hooks/useLeafNodes.ts
import { useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import type { MapNodeData } from '@/lib/types';

export function getLeafNodes(nodes: MapNodeData[]): MapNodeData[] {
  const parentIds = new Set(
    nodes.map(n => n.parent_id).filter((id): id is string => id != null)
  );
  return nodes.filter(n => !parentIds.has(n.id));
}

export function useLeafNodes(): MapNodeData[] {
  const data = useKbStore.useData();
  return useMemo(() => {
    if (!data) return [];
    return getLeafNodes(data.map.nodes);
  }, [data]);
}
```

- [ ] **Step 4: Update test to import from hook**

Replace the inline `getLeafNodes` function in the test file with an import:
```ts
import { getLeafNodes } from '@/hooks/useLeafNodes';
```
Remove the inline function definition.

- [ ] **Step 5: Run test — expect PASS**

```bash
bun run test __tests__/useLeafNodes.test.ts
```
Expected: 5 tests pass

- [ ] **Step 6: Commit**

```bash
git add hooks/useLeafNodes.ts __tests__/useLeafNodes.test.ts
git commit -m "feat: add useLeafNodes hook with pure logic tests"
```

---

### Task 8: Create useContextSplit

**Files:**
- Create: `hooks/useContextSplit.ts`
- Create: `__tests__/useContextSplit.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/useContextSplit.test.ts
import { describe, it, expect } from 'vitest';
import type { KbItemContext } from '@/lib/types';

// Pure function extracted for testing
function contextSplit<T>(
  items: T[],
  getType: (item: T) => KbItemContext['type']
): { global: T[]; page: T[]; component: T[] } {
  return {
    global: items.filter(i => getType(i) === 'global'),
    page: items.filter(i => getType(i) === 'page'),
    component: items.filter(i => getType(i) === 'component'),
  };
}

const item = (type: KbItemContext['type'], id: string) => ({ id, type });

describe('contextSplit', () => {
  it('separates items into three buckets', () => {
    const items = [
      item('global', 'g1'),
      item('page', 'p1'),
      item('component', 'c1'),
      item('global', 'g2'),
    ];
    const result = contextSplit(items, i => i.type);
    expect(result.global.map(i => i.id)).toEqual(['g1', 'g2']);
    expect(result.page.map(i => i.id)).toEqual(['p1']);
    expect(result.component.map(i => i.id)).toEqual(['c1']);
  });

  it('returns empty buckets when no items match', () => {
    const items = [item('global', 'g1')];
    const result = contextSplit(items, i => i.type);
    expect(result.page).toEqual([]);
    expect(result.component).toEqual([]);
  });

  it('handles empty input', () => {
    const result = contextSplit([], () => 'global');
    expect(result.global).toEqual([]);
    expect(result.page).toEqual([]);
    expect(result.component).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — expect PASS (inline function)**

```bash
bun run test __tests__/useContextSplit.test.ts
```
Expected: PASS — pure function is defined inline in the test. (Same flow as useLeafNodes: green inline → create hook → import → still green)

- [ ] **Step 3: Create the hook**

```ts
// hooks/useContextSplit.ts
import type { KbItemContext } from '@/lib/types';

export function contextSplit<T>(
  items: T[],
  getType: (item: T) => KbItemContext['type']
): { global: T[]; page: T[]; component: T[] } {
  return {
    global: items.filter(i => getType(i) === 'global'),
    page: items.filter(i => getType(i) === 'page'),
    component: items.filter(i => getType(i) === 'component'),
  };
}
```

> **Note:** `useMemo` was removed. Callers pass inline arrow functions (`r => r.context.type`) which create a new reference each render, making memoization ineffective. The computation is trivial (three `.filter()` passes); no `useMemo` is needed. Pages call `contextSplit` directly (pure function) rather than a hook wrapper.

- [ ] **Step 4: Update test to import from hook**

Replace inline `contextSplit` with:
```ts
import { contextSplit } from '@/hooks/useContextSplit';
```
Remove the inline function definition.

- [ ] **Step 5: Run test — expect PASS**

```bash
bun run test __tests__/useContextSplit.test.ts
```
Expected: 3 tests pass

- [ ] **Step 6: Commit**

```bash
git add hooks/useContextSplit.ts __tests__/useContextSplit.test.ts
git commit -m "feat: add contextSplit utility with pure logic tests"
```

---

### Task 9: Migrate tags/page.tsx

**Files:**
- Modify: `app/(app)/tags/page.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/tags/page.tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyTagCategory } from '@/lib/defaults';
import { TagCategorySection } from '@/components/tags/TagCategorySection';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { Button } from '@/components/ui/button';
import { IconPlus, IconTags } from '@tabler/icons-react';

export default function TagsPage() {
  const data = useKbStore.useData();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const { tag_categories = [], tags = [] } = data;
  const q = search.toLowerCase().trim();
  const filteredCategories = tag_categories.filter(cat => {
    if (!q) return true;
    return (
      cat.label.toLowerCase().includes(q) ||
      tags.some(t => t.category_id === cat.id && t.label.toLowerCase().includes(q))
    );
  });

  const handleAddCategory = () => upsertTagCategory({ ...emptyTagCategory(), label: 'Yeni Kategori' });

  return (
    <ListPageLayout
      icon={<IconTags size={22} className="text-primary" />}
      title="Tag Yönetimi"
      description="Tüm tag kategorilerini ve etiketleri buradan yönetin."
      action={
        <Button onClick={handleAddCategory}>
          <IconPlus size={14} />
          Kategori Ekle
        </Button>
      }
      maxWidth="4xl"
    >
      <SearchBar placeholder="Kategori veya tag ara..." />

      {tag_categories.length === 0 ? (
        <EmptyState
          icon={<IconTags size={28} />}
          title="Henüz kategori yok."
          action={
            <Button variant="link" onClick={handleAddCategory} className="mt-1 h-auto p-0 text-sm">
              İlk kategoriyi ekle →
            </Button>
          }
        />
      ) : filteredCategories.length > 0 ? (
        <div className="space-y-3">
          {filteredCategories.map(cat => (
            <TagCategorySection
              key={cat.id}
              category={cat}
              tags={tags.filter(t => t.category_id === cat.id)}
            />
          ))}
        </div>
      ) : (
        <NoResults
          message="Eşleşen kategori veya tag bulunamadı."
          onClear={() => setSearch('')}
        />
      )}
    </ListPageLayout>
  );
}
```

- [ ] **Step 2: Verify lint and build**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/tags/page.tsx
git commit -m "refactor: migrate tags page to shared components"
```

---

### Task 10: Migrate glossary/page.tsx

**Files:**
- Modify: `app/(app)/glossary/page.tsx`

Note: Glossary has its own inline add form (Card + Input + Textarea) — this stays as-is (it's unique to glossary). Only the outer wrapper, empty state, and no-results are migrated.

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/glossary/page.tsx
'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconCheck, IconX, IconAlphabetLatin } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import type { KbGlossaryTerm } from '@/lib/types';
import { emptyGlossaryTerm } from '@/lib/defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function GlossaryPage() {
  const data = useKbStore.useData();
  const upsertGlossaryTerm = useKbStore.useUpsertGlossaryTerm();
  const deleteGlossaryTerm = useKbStore.useDeleteGlossaryTerm();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<KbGlossaryTerm>(() => emptyGlossaryTerm());
  const [pendingDelete, setPendingDelete] = useState<KbGlossaryTerm | null>(null);
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.glossary.filter(
    t => !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
  );

  const add = () => {
    if (!draft.term || !draft.definition) return;
    upsertGlossaryTerm({ ...draft, id: `term_${Date.now()}` });
    setDraft(emptyGlossaryTerm());
    setAdding(false);
  };

  return (
    <ListPageLayout
      icon={<IconAlphabetLatin size={22} className="text-primary" />}
      title="Sözlük"
      description={`${data.glossary.length} terim toplam`}
      action={
        !adding ? (
          <Button onClick={() => setAdding(true)}>
            <IconPlus size={15} />
            Terim Ekle
          </Button>
        ) : undefined
      }
      maxWidth="4xl"
    >
      <SearchBar placeholder="Terim veya tanım ara..." />

      {adding && (
        <Card className="p-5 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Yeni Terim</p>
          <Input
            placeholder="Terim (örn: eNPS)"
            value={draft.term}
            onChange={e => setDraft(d => ({ ...d, term: e.target.value }))}
          />
          <Textarea
            rows={2}
            placeholder="Tanım..."
            value={draft.definition}
            onChange={e => setDraft(d => ({ ...d, definition: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={!draft.term || !draft.definition}>
              <IconCheck size={13} />Ekle
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              <IconX size={13} />İptal
            </Button>
          </div>
        </Card>
      )}

      {data.glossary.length === 0 && !adding && (
        <EmptyState
          icon={<IconAlphabetLatin size={28} />}
          title="Henüz terim eklenmemiş."
          action={
            <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
              İlk terimi ekle →
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} className="group py-0 gap-0">
              <div className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{t.term}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.definition}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(t)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-auto p-1.5"
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && data.glossary.length > 0 && (
        <NoResults message="Eşleşen terim bulunamadı." onClear={() => setSearch('')} />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`"${pendingDelete?.term}" silinsin mi?`}
        description="Bu terimi sildiğinizde geri alamazsınız."
        onConfirm={() => { if (pendingDelete) deleteGlossaryTerm(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </ListPageLayout>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/glossary/page.tsx
git commit -m "refactor: migrate glossary page to shared components"
```

---

### Task 11: Migrate sections/page.tsx

**Files:**
- Modify: `app/(app)/sections/page.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/sections/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SectionListHeader } from '@/components/shared/SectionListHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { Button } from '@/components/ui/button';
import { IconLayoutColumns, IconPlus } from '@tabler/icons-react';

export default function SectionsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const handleCreate = () => {
    const comp = { ...emptyComponent(), component_type: 'section' as const };
    upsertComponent(comp);
    router.push(`/sections/${comp.id}`);
  };

  const allSections = data.components.filter(c => c.component_type === 'section');
  const q = search.toLowerCase().trim();
  const sections = allSections.filter(
    c => !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
  );

  return (
    <ListPageLayout
      icon={<IconLayoutColumns size={22} className="text-primary" />}
      title="Layout Bileşenleri"
      description="Sayfaya yerleştirilen header, footer ve body bölümlerini (section) yönetin."
      action={
        <Button onClick={handleCreate}>
          <IconPlus size={14} />
          Yeni Layout Bileşeni
        </Button>
      }
      maxWidth="5xl"
    >
      {allSections.length === 0 ? (
        <EmptyState
          icon={<IconLayoutColumns size={28} />}
          title="Henüz layout bileşeni yok."
          action={
            <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
              İlk layout bileşenini ekle →
            </Button>
          }
        />
      ) : (
        <>
          <SearchBar placeholder="Layout bileşeni ara..." />

          {sections.length > 0 ? (
            <div>
              <SectionListHeader
                icon={<IconLayoutColumns size={14} className="text-primary" />}
                label="Layout Bileşenleri"
                count={sections.length}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map(comp => (
                  <ComponentCard key={comp.id} component={comp} />
                ))}
              </div>
            </div>
          ) : (
            <NoResults message="Eşleşen bileşen bulunamadı." onClear={() => setSearch('')} />
          )}
        </>
      )}
    </ListPageLayout>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/sections/page.tsx
git commit -m "refactor: migrate sections page to shared components"
```

---

## Chunk 3: Complex Page Migrations

### Task 12: Migrate pages/page.tsx

**Files:**
- Modify: `app/(app)/pages/page.tsx`

Note: The empty state here uses `<Link>` (not `<Button onClick>`), which is why `EmptyState`'s `action` prop is `ReactNode`.

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/pages/page.tsx
'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SectionListHeader } from '@/components/shared/SectionListHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useLeafNodes } from '@/hooks/useLeafNodes';
import { buttonVariants } from '@/components/ui/button';
import { IconSitemap, IconLayoutDashboard } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function PagesPage() {
  const data = useKbStore.useData();
  const [search, setSearch] = useSearchParam('q');
  const leafNodes = useLeafNodes();

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = leafNodes.filter(n => !q || n.label.toLowerCase().includes(q));

  return (
    <ListPageLayout
      icon={<IconLayoutDashboard size={22} className="text-primary" />}
      title="Sayfalar"
      description="Map'teki her leaf node bir sayfadır. Map'ten node ekleyerek sayfa oluşturun."
      action={
        <Link href="/map" className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}>
          <IconSitemap size={14} />
          Map&apos;e Git
        </Link>
      }
      maxWidth="5xl"
    >
      {leafNodes.length === 0 ? (
        <EmptyState
          icon={<IconLayoutDashboard size={32} />}
          title="Henüz sayfa yok."
          description="Sayfalar, haritadaki leaf node'lardan otomatik oluşur."
          action={
            <Link href="/map" className={cn(buttonVariants({ variant: 'default' }), 'gap-1.5 mt-2')}>
              <IconSitemap size={14} />
              Haritaya Git
            </Link>
          }
        />
      ) : (
        <>
          <SearchBar placeholder="Sayfa ara..." />

          {filtered.length > 0 ? (
            <div>
              <SectionListHeader
                icon={<IconLayoutDashboard size={14} className="text-primary" />}
                label="Sayfalar"
                count={filtered.length}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(node => (
                  <PageCard key={node.id} node={node} />
                ))}
              </div>
            </div>
          ) : (
            <NoResults message="Eşleşen sayfa bulunamadı." onClear={() => setSearch('')} />
          )}
        </>
      )}
    </ListPageLayout>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/pages/page.tsx
git commit -m "refactor: migrate pages page to shared components"
```

---

### Task 13: Migrate rules/page.tsx

**Files:**
- Modify: `app/(app)/rules/page.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/rules/page.tsx
'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconShieldCheck } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { RuleForm } from '@/components/rules/RuleForm';
import { RuleRow } from '@/components/rules/RuleRow';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useLeafNodes } from '@/hooks/useLeafNodes';
import { contextSplit } from '@/hooks/useContextSplit';
import { emptyRule } from '@/lib/defaults';
import type { KbRule } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function RulesPage() {
  const data = useKbStore.useData();
  const upsertRule = useKbStore.useUpsertRule();
  const deleteRule = useKbStore.useDeleteRule();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbRule | null>(null);
  const [search, setSearch] = useSearchParam('q');

  const leafNodes = useLeafNodes();

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.rules.filter(
    r => !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  );

  const { global: globalRules, page: pageRules, component: componentRules } = contextSplit(
    filtered,
    r => r.context.type
  );

  const handleSave = (r: KbRule) => {
    upsertRule({ ...r, id: r.id || `rule_${Date.now()}` });
    setAdding(false);
    setEditingId(null);
  };

  const rowProps = (rule: KbRule) => ({
    rule,
    leafNodes,
    components: data.components,
    onEdit: () => setEditingId(rule.id),
    onDelete: () => setPendingDelete(rule),
    editingId,
    onSave: handleSave,
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <ListPageLayout
      icon={<IconShieldCheck size={22} className="text-primary" />}
      title="Kurallar"
      description={`${data.rules.length} kural toplam`}
      action={
        !adding ? (
          <Button onClick={() => { setAdding(true); setEditingId(null); }}>
            <IconPlus size={15} />
            Kural Ekle
          </Button>
        ) : undefined
      }
      maxWidth="4xl"
    >
      <SearchBar placeholder="Kural başlığı veya açıklama ara..." />

      {adding && (
        <RuleForm
          initial={emptyRule()}
          leafNodes={leafNodes}
          components={data.components}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {data.rules.length === 0 && !adding && (
        <EmptyState
          icon={<IconShieldCheck size={28} />}
          title="Henüz kural eklenmemiş."
          action={
            <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
              İlk kuralı ekle →
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="space-y-4">
          {globalRules.length > 0 && (
            <CollapsibleSection title="Global" count={globalRules.length}>
              {globalRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </CollapsibleSection>
          )}
          {pageRules.length > 0 && (
            <CollapsibleSection title="Sayfaya Bağlı" count={pageRules.length}>
              {pageRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </CollapsibleSection>
          )}
          {componentRules.length > 0 && (
            <CollapsibleSection title="Component'e Bağlı" count={componentRules.length}>
              {componentRules.map(rule => <RuleRow key={rule.id} {...rowProps(rule)} />)}
            </CollapsibleSection>
          )}
        </div>
      )}

      {filtered.length === 0 && data.rules.length > 0 && (
        <NoResults message="Eşleşen kural bulunamadı." onClear={() => setSearch('')} />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Bu kuralı sil?"
        description={pendingDelete?.title}
        onConfirm={() => { if (pendingDelete) deleteRule(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </ListPageLayout>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/rules/page.tsx
git commit -m "refactor: migrate rules page to shared components"
```

---

### Task 14: Migrate faq/page.tsx

**Files:**
- Modify: `app/(app)/faq/page.tsx`

Note: `faq/page.tsx` does NOT use `ListPageLayout` — it renders `PageHeader` directly (its built-in `border-b` is sufficient). The outer wrapper is preserved as-is. `contextSplit` (pure function) and `useLeafNodes` replace the inline logic; `TagFilterBar` replaces the inline filter row (tag display upgrades from raw ID to `tag.label`); `EmptyState` and `NoResults` replace inline blocks.

`onClear` for FAQ must clear both `?q=` and `?tag=` — use `router.replace(pathname, { scroll: false })`.

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/faq/page.tsx
'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconHelp } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { FaqForm } from '@/components/faq/FaqForm';
import { FaqRow } from '@/components/faq/FaqRow';
import { CollapsibleSection } from '@/components/faq/CollapsibleSection';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useLeafNodes } from '@/hooks/useLeafNodes';
import { contextSplit } from '@/hooks/useContextSplit';
import { emptyFaq } from '@/lib/defaults';
import type { KbFaq } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function FaqPage() {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);
  const [activeTag, setActiveTag] = useSearchParam('tag');
  const [search] = useSearchParam('q');

  const leafNodes = useLeafNodes();

  if (!data) return null;

  const allTagIds = [...new Set(data.faq.flatMap(f => f.tag_ids))].sort();

  const q = search.toLowerCase().trim();
  const filtered = data.faq
    .filter(f => !activeTag || f.tag_ids.includes(activeTag))
    .filter(f => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));

  const { global: globalFaqs, page: pageFaqs, component: componentFaqs } = contextSplit(
    filtered,
    f => f.context.type
  );

  const handleSave = (f: KbFaq) => {
    upsertFaq({ ...f, id: f.id || `faq_${Date.now()}` });
    setAdding(false);
    setEditingId(null);
  };

  const rowProps = (faq: KbFaq) => ({
    faq,
    leafNodes,
    components: data.components,
    onEdit: () => setEditingId(faq.id),
    onDelete: () => setPendingDelete(faq),
    editingId,
    onSave: handleSave,
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        icon={<IconHelp size={22} className="text-primary" />}
        title="FAQ"
        description={`${data.faq.length} soru toplam`}
        action={
          !adding ? (
            <Button onClick={() => { setAdding(true); setEditingId(null); }}>
              <IconPlus size={15} />
              FAQ Ekle
            </Button>
          ) : undefined
        }
      />

      <div className="px-6 py-6 w-full max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar placeholder="Soru veya cevap ara..." className="flex-1" />
          <TagFilterBar
            tagIds={allTagIds}
            tags={data.tags}
            activeTag={activeTag}
            onSelect={setActiveTag}
          />
        </div>

        {adding && (
          <FaqForm
            initial={emptyFaq()}
            leafNodes={leafNodes}
            components={data.components}
            onSave={handleSave}
            onCancel={() => setAdding(false)}
          />
        )}

        {data.faq.length === 0 && !adding && (
          <EmptyState
            icon={<IconHelp size={28} />}
            title="Henüz FAQ yok."
            action={
              <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
                İlk soruyu ekle →
              </Button>
            }
          />
        )}

        {filtered.length > 0 && (
          <div className="space-y-4">
            {globalFaqs.length > 0 && (
              <CollapsibleSection title="Global" count={globalFaqs.length}>
                {globalFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
              </CollapsibleSection>
            )}
            {pageFaqs.length > 0 && (
              <CollapsibleSection title="Sayfaya Bağlı" count={pageFaqs.length}>
                {pageFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
              </CollapsibleSection>
            )}
            {componentFaqs.length > 0 && (
              <CollapsibleSection title="Component'e Bağlı" count={componentFaqs.length}>
                {componentFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
              </CollapsibleSection>
            )}
          </div>
        )}

        {filtered.length === 0 && data.faq.length > 0 && (
          <NoResults
            message="Eşleşen FAQ bulunamadı."
            onClear={() => router.replace(pathname, { scroll: false })}
          />
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Bu soruyu sil?"
        description={pendingDelete?.question}
        onConfirm={() => { if (pendingDelete) deleteFaq(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/faq/page.tsx
git commit -m "refactor: migrate faq page to shared components"
```

---

### Task 15: Migrate components/page.tsx

**Files:**
- Modify: `app/(app)/components/page.tsx`

This is the most complex migration: two groups (primitives + composites), each with their own empty/no-results states. The composite group has two "empty" variants: (1) completely empty → `EmptyState`, (2) active tag filter but no results → `NoResults` with `clearLabel="Filtreyi temizle"`. Primitives group hides when empty (no empty state).

> **Spacing note:** The current page uses `space-y-8` in its content wrapper. After migration the content wrapper becomes `ListPageLayout`'s inner `div` which uses `space-y-5`. This is an intentional visual tightening consistent with all other migrated pages.

- [ ] **Step 1: Replace file contents**

```tsx
// app/(app)/components/page.tsx
'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SectionListHeader } from '@/components/shared/SectionListHeader';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { Button } from '@/components/ui/button';
import { IconAtom, IconLock, IconPlus, IconPuzzle } from '@tabler/icons-react';

export default function ComponentsPage() {
  const data = useKbStore.useData();
  const upsertComponent = useKbStore.useUpsertComponent();
  const router = useRouter();

  const [search] = useSearchParam('q');
  const [activeTag, setActiveTag] = useSearchParam('tag');

  const allTagIds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.components.flatMap(c => c.tag_ids))].sort();
  }, [data]);

  if (!data) return null;

  const handleCreate = () => {
    const comp = emptyComponent();
    upsertComponent(comp);
    router.push(`/components/${comp.id}`);
  };

  const allPrimitives = data.components.filter(c => (c.component_type ?? 'composite') === 'primitive');
  const allComposites = data.components.filter(c => (c.component_type ?? 'composite') === 'composite');

  const q = search.toLowerCase().trim();
  const primitives = allPrimitives
    .filter(c => !activeTag || c.tag_ids.includes(activeTag))
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
  const composites = allComposites
    .filter(c => !activeTag || c.tag_ids.includes(activeTag))
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));

  return (
    <ListPageLayout
      icon={<IconPuzzle size={22} className="text-primary" />}
      title="Componentler"
      description="Client-UI widget ve componentlerini buradan tanımlayın."
      action={
        <Button onClick={handleCreate}>
          <IconPlus size={14} />
          Yeni Component
        </Button>
      }
      maxWidth="5xl"
    >
      <div className="flex flex-col gap-3">
        <SearchBar placeholder="Component ara..." />
        <TagFilterBar
          tagIds={allTagIds}
          tags={data.tags}
          activeTag={activeTag}
          onSelect={setActiveTag}
        />
      </div>

      {primitives.length > 0 && (
        <div>
          <SectionListHeader
            icon={<IconAtom size={14} className="text-muted-foreground" />}
            label={
              <span className="flex items-center gap-1">
                Atomlar <IconLock size={10} className="text-muted-foreground/50" />
              </span>
            }
            count={primitives.length}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {primitives.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionListHeader
          icon={<IconPuzzle size={14} className="text-primary" />}
          label="Composite Componentler"
          count={composites.length}
        />
        {composites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {composites.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        ) : allComposites.length > 0 && activeTag ? (
          <NoResults
            message="Bu etikete ait component yok."
            onClear={() => setActiveTag('')}
            clearLabel="Filtreyi temizle"
          />
        ) : (
          <EmptyState
            icon={<IconPuzzle size={28} />}
            title="Henüz composite component yok."
            action={
              <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
                İlk component&apos;i ekle →
              </Button>
            }
          />
        )}
      </div>
    </ListPageLayout>
  );
}
```

- [ ] **Step 2: Verify lint**

```bash
bun run lint
```
Expected: no errors

- [ ] **Step 3: Run all tests**

```bash
bun run test
```
Expected: all tests pass

- [ ] **Step 4: Final build check**

```bash
bun run build
```
Expected: successful build, no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/components/page.tsx
git commit -m "refactor: migrate components page to shared components"
```

---

## Post-Implementation Verification

After all tasks complete, do a final check:

- [ ] Run `bun run test` — all tests pass
- [ ] Run `bun run build` — no TS errors
- [ ] Visually check: pages, sections, components, faq, rules, glossary, tags pages all render correctly
- [ ] Verify `EmptyState` and `NoResults` render on each page (add a temp filter or check an empty environment)
