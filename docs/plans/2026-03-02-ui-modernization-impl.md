# UI Modernizasyon Implementation Planı

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** mood-doc uygulamasının tüm sayfalarını modern, bold & color yapısal tasarıma geçirmek.

**Architecture:** Renkler değişmez. Yapısal değişiklikler: kart anatomisi (shadow, rounded-xl, accent bar), grid layout, güçlü sayfa header'ları, section container pattern. Sıralı implementation — her task bağımsız çalışır ve commit edilir.

**Tech Stack:** Next.js 16 App Router, TypeScript, shadcn/ui, Tailwind CSS 4, @tabler/icons-react

---

## Genel Notlar

- Test framework yok — her task sonunda tarayıcıda manuel doğrulama
- `dev` server: `bash -c "cd /Volumes/projects/mood-doc && npm run dev"`
- TypeScript kontrol: `bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"`
- Arbitrary Tailwind değerleri yasak (`w-[123px]` gibi). Sadece `border-l-4`, `rounded-xl`, standart spacing kullan.
- Renkler: sadece CSS variable'ları (`text-primary`, `bg-muted`, `border-border` vb.) — hardcoded renk yok.
- **İstisna:** `amber-500`, `amber-600` rule accent için kabul edilebilir (tema tokenı yok).

---

## PHASE 1: App Shell

### Task 1: Sidebar Modernizasyonu

**Files:**
- Modify: `app/(app)/layout.tsx`

**Hedef:** Sidebar'ı daha belirgin active state'ler, güçlü brand area ve pill-shaped save indicator ile güncelle.

**Step 1: `app/(app)/layout.tsx` dosyasını oku**

```bash
bash -c "cat /Volumes/projects/mood-doc/app/'(app)'/layout.tsx"
```

**Step 2: Sidebar component'ini güncelle**

`Sidebar` fonksiyonundaki return değerini aşağıdakiyle değiştir:

```tsx
return (
  <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">

    {/* Brand */}
    <div className="px-4 pt-5 pb-4 border-b border-sidebar-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <IconBook2 size={16} className="text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sidebar-foreground text-sm leading-tight tracking-tight">Moodivation</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-medium">KB Manager</p>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          <p className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ label, icon: Icon, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-100',
                    active
                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[6px]'
                      : 'text-sidebar-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <Icon
                    size={15}
                    strokeWidth={active ? 2 : 1.75}
                    className={active ? 'text-primary' : 'text-muted-foreground'}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    {/* Footer / Save */}
    <div className="p-3 border-t border-sidebar-border space-y-2">
      {isDirty && (
        <div className="flex items-center gap-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
          <p className="text-[11px] text-amber-600 font-medium">Kaydedilmemiş değişiklik</p>
        </div>
      )}
      <Button
        onClick={() => isDirty && save('KB updated')}
        disabled={!isDirty || isPending}
        variant={isDirty ? 'default' : 'ghost'}
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
      >
        {isPending ? (
          <><IconLoader2 size={13} className="animate-spin" />Kaydediliyor...</>
        ) : isDirty ? (
          <><IconDeviceFloppy size={13} />GitHub&apos;a Kaydet</>
        ) : (
          <><IconBrandGithub size={13} className="text-muted-foreground" />Kaydedildi</>
        )}
      </Button>
    </div>
  </aside>
);
```

**Step 3: App shell arka planını güncelle**

`AppLayout` içindeki wrapper div'i güncelle:

```tsx
// Önce:
<div className="flex min-h-screen bg-muted/30">
  <Sidebar />
  <main className="flex-1 flex flex-col overflow-y-auto">

// Sonra:
<div className="flex min-h-screen bg-muted/20">
  <Sidebar />
  <main className="flex-1 flex flex-col overflow-y-auto">
```

**Step 4: TypeScript kontrol**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

Beklenen: hata yok.

**Step 5: Doğrula**

`npm run dev` çalışıyorsa tarayıcıda sidebar'ı kontrol et:
- Active item'da sol border ve primary/10 arka plan görünmeli
- Brand area daha belirgin olmalı
- Save button rounded-lg olmalı

**Step 6: Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add app/'(app)'/layout.tsx && git commit -m 'feat: sidebar modernizasyonu - active state border, bold brand, pill save indicator'"
```

---

## PHASE 2: Reusable PageHeader Component

### Task 2: PageHeader Component Oluştur

**Files:**
- Create: `components/shared/PageHeader.tsx`

**Hedef:** Tüm list sayfalarında kullanılacak tutarlı header component. Büyük başlık, icon container, açıklama, action button.

**Step 1: `components/shared/PageHeader.tsx` oluştur**

```tsx
// components/shared/PageHeader.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ icon, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between pb-6 mb-6 border-b border-border', className)}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="shrink-0 ml-4">{action}</div>
      )}
    </div>
  );
}
```

**Step 2: TypeScript kontrol**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

**Step 3: Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add components/shared/PageHeader.tsx && git commit -m 'feat: PageHeader component - tutarlı sayfa başlığı pattern'"
```

---

## PHASE 3: Card Anatomisi

### Task 3: ComponentCard Yeniden Tasarımı

**Files:**
- Modify: `components/kb-components/ComponentCard.tsx`

**Hedef:** shadow-sm, rounded-xl, sol accent bar, hover animasyonu, tip badge.

**Step 1: `components/kb-components/ComponentCard.tsx` dosyasını güncelle**

```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent } from '@/lib/types';
import { TagBadge } from '@/components/tags/TagBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Badge } from '@/components/ui/badge';
import { IconAtom, IconChevronRight, IconPuzzle, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  component: KbComponent;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const data = useKbStore.useData();
  const deleteComponent = useKbStore.useDeleteComponent();

  const isPrimitive = component.component_type === 'primitive';
  const tags = (data?.tags ?? []).filter(t => component.tag_ids?.includes(t.id) ?? false);
  const faqCount = component.faq_ids.length;
  const ruleCount = component.rule_ids.length;
  // tag_ids'in max 3 tanesini göster, kalanı +N olarak göster
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <>
      <div className={cn(
        'flex items-center justify-between bg-card border border-border rounded-xl shadow-sm',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-150 group',
        isPrimitive ? 'border-l-4 border-l-muted-foreground/40' : 'border-l-4 border-l-primary',
      )}>
        <Link
          href={`/components/${component.id}`}
          className="flex items-start gap-3 flex-1 min-w-0 p-4"
        >
          <div className={cn(
            'p-1.5 rounded-lg shrink-0 mt-0.5',
            isPrimitive ? 'bg-muted' : 'bg-primary/10',
          )}>
            {isPrimitive
              ? <IconAtom size={16} className="text-muted-foreground" />
              : <IconPuzzle size={16} className="text-primary" />
            }
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-foreground">
                {component.name || 'İsimsiz Component'}
              </p>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-medium">
                {isPrimitive ? 'Atom' : 'Composite'}
              </Badge>
            </div>
            {component.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {component.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {visibleTags.map(t => <TagBadge key={t.id} label={t.label} />)}
              {extraTagCount > 0 && (
                <span className="text-[11px] text-muted-foreground">+{extraTagCount}</span>
              )}
              {(faqCount > 0 || ruleCount > 0) && (
                <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                  {faqCount > 0 && `${faqCount} FAQ`}
                  {faqCount > 0 && ruleCount > 0 && ' · '}
                  {ruleCount > 0 && `${ruleCount} Kural`}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isPrimitive && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              aria-label="Component sil"
            >
              <IconTrash size={14} />
            </button>
          )}
          <IconChevronRight size={14} className="text-muted-foreground" />
        </div>
      </div>

      {!isPrimitive && (
        <ConfirmModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            deleteComponent(component.id);
            setConfirmOpen(false);
          }}
          title="Component silinsin mi?"
          description="Bu işlem geri alınamaz. Bu component'e ait FAQ ve kurallar listede kalır."
        />
      )}
    </>
  );
}
```

**Step 2: TypeScript kontrol**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

**Step 3: Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add components/kb-components/ComponentCard.tsx && git commit -m 'feat: ComponentCard modernizasyonu - shadow, rounded-xl, accent bar, tip badge'"
```

---

### Task 4: PageCard Yeniden Tasarımı

**Files:**
- Modify: `components/pages/PageCard.tsx`

**Hedef:** ComponentCard ile aynı kart anatomisi — shadow, rounded-xl, sol accent bar, hover.

**Step 1: `components/pages/PageCard.tsx` dosyasını güncelle**

```tsx
'use client';
import Link from 'next/link';
import type { MapNodeData } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from '@/components/tags/TagBadge';
import { Badge } from '@/components/ui/badge';
import { IconLayoutDashboard, IconChevronRight } from '@tabler/icons-react';

interface PageCardProps {
  node: MapNodeData;
}

export function PageCard({ node }: PageCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => node.page_data?.tag_ids?.includes(t.id) ?? false);
  const sectionCount = node.page_data?.sections.length ?? 0;
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <Link
      href={`/pages/${node.id}`}
      className="flex items-center justify-between bg-card border border-border border-l-4 border-l-primary/60 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-150 group"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0 p-4">
        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
          <IconLayoutDashboard size={16} className="text-primary" />
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-foreground">{node.label}</p>
            {sectionCount > 0 && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-medium">
                {sectionCount} section
              </Badge>
            )}
          </div>
          {node.page_data?.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {node.page_data.description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleTags.map(t => <TagBadge key={t.id} label={t.label} />)}
              {extraTagCount > 0 && (
                <span className="text-[11px] text-muted-foreground">+{extraTagCount}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="pr-3">
        <IconChevronRight
          size={14}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </Link>
  );
}
```

**Step 2: TypeScript kontrol**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

**Step 3: Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add components/pages/PageCard.tsx && git commit -m 'feat: PageCard modernizasyonu - shadow, rounded-xl, accent bar, section badge'"
```

---

### Task 5: FaqRow Yeniden Tasarımı

**Files:**
- Modify: `components/faq/FaqRow.tsx`

**Hedef:** shadow-sm, rounded-xl, sol accent bar (primary/60), context badge daha belirgin.

**Step 1: `components/faq/FaqRow.tsx` dosyasını güncelle**

`return` bloğundaki JSX'i değiştir (editingId === faq.id dalı aynı kalır):

```tsx
return (
  <div className="bg-card border border-border border-l-4 border-l-primary/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 group">
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="font-semibold text-foreground text-sm leading-snug">{faq.question}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {ctxLabel && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              {ctxLabel}
            </Badge>
          )}
          {faq.tag_ids.map(t => (
            <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>
          ))}
        </div>
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <IconPencil size={14} />
        </Button>
        <Button variant="destructive" size="icon-sm" onClick={onDelete}>
          <IconTrash size={14} />
        </Button>
      </div>
    </div>
  </div>
);
```

**Step 2: TypeScript kontrol**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

**Step 3: Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add components/faq/FaqRow.tsx && git commit -m 'feat: FaqRow modernizasyonu - shadow, rounded-xl, accent bar'"
```

---

## PHASE 4: List Sayfaları Grid Layout

### Task 6: Components Sayfası — Grid Layout + PageHeader

**Files:**
- Modify: `app/(app)/components/page.tsx`

**Hedef:** `max-w-2xl` tek kolon listeden grid layout'a geç. PageHeader component kullan. Section container pattern uygula.

**Step 1: `app/(app)/components/page.tsx` dosyasını güncelle**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { emptyComponent } from '@/lib/defaults';
import { ComponentCard } from '@/components/kb-components/ComponentCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { IconAtom, IconLock, IconPlus, IconPuzzle } from '@tabler/icons-react';

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

  const primitives = data.components.filter(c => (c.component_type ?? 'composite') === 'primitive');
  const composites = data.components.filter(c => (c.component_type ?? 'composite') === 'composite');

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <PageHeader
        icon={<IconPuzzle size={22} className="text-primary" />}
        title="Componentler"
        description="Client-UI widget ve componentlerini buradan tanımlayın."
        action={
          <Button onClick={handleCreate}>
            <IconPlus size={14} />
            Yeni Component
          </Button>
        }
      />

      {primitives.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconAtom size={14} className="text-muted-foreground" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Atomlar
            </p>
            <IconLock size={10} className="text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground ml-1">{primitives.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {primitives.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <IconPuzzle size={14} className="text-primary" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
            Composite Componentler
          </p>
          <span className="text-[10px] text-muted-foreground ml-1">{composites.length}</span>
        </div>
        {composites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {composites.map(comp => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
            <IconPuzzle size={28} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Henüz composite component yok.
            </p>
            <Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">
              İlk component&apos;i ekle →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: TypeScript kontrol**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

**Step 3: Doğrula**

Tarayıcıda `/components` sayfasını aç. Grid layout görünmeli, PageHeader belirgin olmalı.

**Step 4: Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add app/'(app)'/components/page.tsx && git commit -m 'feat: components sayfası - grid layout, PageHeader, section labels'"
```

---

### Task 7: Pages Sayfası — Grid Layout + PageHeader

**Files:**
- Modify: `app/(app)/pages/page.tsx`

**Step 1: `app/(app)/pages/page.tsx` dosyasını güncelle**

```tsx
'use client';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { PageCard } from '@/components/pages/PageCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import { IconSitemap, IconLayoutDashboard } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function PagesPage() {
  const data = useKbStore.useData();

  if (!data) return null;

  const parentIds = new Set(
    data.map.nodes
      .map(n => n.parent_id)
      .filter((id): id is string => id != null)
  );
  const leafNodes = data.map.nodes.filter(n => !parentIds.has(n.id));

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <PageHeader
        icon={<IconLayoutDashboard size={22} className="text-primary" />}
        title="Sayfalar"
        description="Map'teki her leaf node bir sayfadır. Map'ten node ekleyerek sayfa oluşturun."
        action={
          <Link
            href="/map"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}
          >
            <IconSitemap size={14} />
            Map&apos;e Git
          </Link>
        }
      />

      {leafNodes.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <IconLayoutDashboard size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Henüz sayfa yok.
          </p>
          <Link href="/map" className={cn(buttonVariants({ variant: 'link' }), 'mt-1 h-auto p-0 text-sm')}>
            Map&apos;e git ve node ekle →
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconLayoutDashboard size={14} className="text-primary" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Sayfalar
            </p>
            <span className="text-[10px] text-muted-foreground ml-1">{leafNodes.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leafNodes.map(node => (
              <PageCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: TypeScript kontrol + Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1 && git add app/'(app)'/pages/page.tsx && git commit -m 'feat: pages sayfası - grid layout, PageHeader, empty state'"
```

---

### Task 8: FAQ Sayfası — PageHeader + Modernize

**Files:**
- Modify: `app/(app)/faq/page.tsx`

**Hedef:** PageHeader component kullan, max-w-2xl → max-w-4xl, tag filter pill'leri daha belirgin.

**Step 1: `app/(app)/faq/page.tsx` dosyasında şu değişiklikleri yap:**

1. Import'a `PageHeader` ekle:
```tsx
import { PageHeader } from '@/components/shared/PageHeader';
import { IconHelp } from '@tabler/icons-react';
```

2. Wrapper div'i değiştir:
```tsx
// Önce:
<div className="max-w-2xl mx-auto p-8 space-y-6">

// Sonra:
<div className="p-6 max-w-4xl space-y-6">
```

3. Mevcut header bloğunu (`<div className="flex items-start justify-between">...`) PageHeader ile değiştir:
```tsx
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
```

4. Empty state'i güncelle:
```tsx
// Önce:
<div className="text-center py-16 text-muted-foreground text-sm">
  No FAQs yet.{' '}
  <Button variant="link" onClick={() => setAdding(true)} className="p-0 h-auto">
    Add first question →
  </Button>
</div>

// Sonra:
<div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
  <IconHelp size={28} className="text-muted-foreground/40 mx-auto mb-2" />
  <p className="text-sm text-muted-foreground">Henüz FAQ yok.</p>
  <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
    İlk soruyu ekle →
  </Button>
</div>
```

**Step 2: TypeScript kontrol + Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1 && git add app/'(app)'/faq/page.tsx && git commit -m 'feat: FAQ sayfası - PageHeader, max-w-4xl, modern empty state'"
```

---

## PHASE 5: Section Container Pattern

### Task 9: CollapsibleSection Modernizasyonu

**Files:**
- Modify: `components/faq/CollapsibleSection.tsx`

**Hedef:** Section container'ları `bg-muted/40 rounded-2xl p-5` pattern'ine çek.

**Step 1: Mevcut `CollapsibleSection.tsx` dosyasını oku**

```bash
bash -c "cat /Volumes/projects/mood-doc/components/faq/CollapsibleSection.tsx"
```

**Step 2: Section başlığını güncelle**

Mevcut section wrapper div'ini şu pattern'e çek:

```tsx
// Wrapper:
<div className="bg-muted/30 rounded-2xl overflow-hidden">
  {/* Başlık */}
  <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </p>
      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
        {count}
      </span>
    </div>
    <IconChevronDown size={14} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} />
  </button>
  {/* İçerik */}
  {open && (
    <div className="px-5 pb-5 space-y-2">
      {children}
    </div>
  )}
</div>
```

**Step 3: Gerekli import'ları ekle** (`IconChevronDown` eksikse).

**Step 4: TypeScript kontrol + Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1 && git add components/faq/CollapsibleSection.tsx && git commit -m 'feat: CollapsibleSection - section container pattern, modern toggle'"
```

---

## PHASE 6: Editor Panel

### Task 10: ComponentRightPanel — Shadow & Divider

**Files:**
- Modify: `components/kb-components/ComponentRightPanel.tsx`

**Hedef:** Right panel'e `shadow-lg rounded-2xl` ekle. Bölümler arası divider pattern uygula.

**Step 1: `components/kb-components/ComponentRightPanel.tsx` dosyasını oku**

```bash
bash -c "head -60 /Volumes/projects/mood-doc/components/kb-components/ComponentRightPanel.tsx"
```

**Step 2: Wrapper div'i güncelle**

En dıştaki panel wrapper'ı bul (genellikle `border border-border` olan), şuna çevir:

```tsx
// Önce: border border-border ... (ne ise)
// Sonra:
className="... border border-border rounded-2xl shadow-lg overflow-hidden"
```

**Step 3: Tab içeriklerinde section'lar arası divider ekle**

Her tab içeriği arasına (metadata bölümü, FAQ bölümü, Rules bölümü):

```tsx
<div className="h-px bg-border" />
```

**Step 4: TypeScript kontrol + Commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1 && git add components/kb-components/ComponentRightPanel.tsx && git commit -m 'feat: ComponentRightPanel - shadow-lg, rounded-2xl, bölüm divider'"
```

---

## PHASE 7: Son Kontrol

### Task 11: TypeScript + Build Kontrolü

**Step 1: TypeScript**

```bash
bash -c "cd /Volumes/projects/mood-doc && npx tsc --noEmit 2>&1"
```

Beklenen: 0 hata.

**Step 2: Build**

```bash
bash -c "cd /Volumes/projects/mood-doc && npm run build 2>&1 | tail -30"
```

Beklenen: Başarılı build.

**Step 3: Hata varsa düzelt ve commit**

```bash
bash -c "cd /Volumes/projects/mood-doc && git add -A && git commit -m 'fix: UI modernizasyon build hataları'"
```

---

## Özet

| Task | Dosya | Değişiklik |
|------|-------|------------|
| 1 | layout.tsx | Sidebar active border, bold brand |
| 2 | shared/PageHeader.tsx | Yeni reusable component |
| 3 | ComponentCard.tsx | shadow, rounded-xl, accent bar, badge |
| 4 | PageCard.tsx | shadow, rounded-xl, accent bar, badge |
| 5 | FaqRow.tsx | shadow, rounded-xl, accent bar |
| 6 | components/page.tsx | Grid layout, PageHeader |
| 7 | pages/page.tsx | Grid layout, PageHeader |
| 8 | faq/page.tsx | PageHeader, max-w-4xl, empty state |
| 9 | CollapsibleSection.tsx | Section container pattern |
| 10 | ComponentRightPanel.tsx | shadow-lg, divider |
| 11 | — | Build kontrolü |
