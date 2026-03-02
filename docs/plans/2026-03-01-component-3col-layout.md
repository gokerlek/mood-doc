# Component Editor 3-Kolon Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Komponent detay sayfasını tam genişlik 3-kolon layout'a taşı: sol=palette, orta=canvas, sağ=metadata+tabs.

**Architecture:** DndContext sayfaya (page.tsx) taşınır. ComponentSketchCanvas `useDndMonitor` ile drop event'larını dinler — canvasRef dışarı çıkmaz. Sağ panel yeni `ComponentRightPanel.tsx` bileşeni olur.

**Tech Stack:** Next.js App Router, dnd-kit/core v6 (useDndMonitor), Radix Tabs, Zustand (kbStore), TypeScript

---

## Kritik Dosyalar

| Dosya | Değişim |
|---|---|
| `lib/defaults.ts` | Container seed primitive ekle |
| `components/kb-components/ComponentSketchCanvas.tsx` | DndContext/Palette kaldır, useDndMonitor ekle |
| `components/kb-components/ComponentSlotSection.tsx` | "Slot Ekle" + slot detay paneli kaldır |
| `components/kb-components/ComponentRightPanel.tsx` | **YENİ** — ad/açıklama/tabs(Props,FAQ,Kural) |
| `app/(app)/components/[id]/page.tsx` | 3-kolon layout, DndContext burada |

---

### Task 1: Container Seed Primitive

**Files:**
- Modify: `lib/defaults.ts`

`SEED_PRIMITIVES` dizisine en sona `seed-prim-container` ekle (diğer primitive'lerle aynı pattern):

```typescript
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
```

**Verification:** `npx tsc --noEmit` → 0 hata

---

### Task 2: ComponentSketchCanvas — DndContext çıkar, useDndMonitor ekle

**Files:**
- Modify: `components/kb-components/ComponentSketchCanvas.tsx`

**Yapılacak değişiklikler:**

**a) Import değişiklikleri:**

Kaldır:
```typescript
import { DndContext, DragOverlay, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { ComponentPalette } from './ComponentPalette';
import { useKbStore } from '@/stores/kbStore';
import { emptySlot } from '@/lib/defaults';
```

Ekle:
```typescript
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { emptySlot } from '@/lib/defaults';
```

**b) State değişiklikleri:**

Kaldır:
```typescript
const [activeDragName, setActiveDragName] = useState('');
const data = useKbStore.useData();
const pickable = ...;
const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
const setCanvasRef = (el: HTMLDivElement | null) => { canvasRef.current = el; setDropRef(el); };
```

Ekle:
```typescript
const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
const setCanvasRef = (el: HTMLDivElement | null) => {
  canvasRef.current = el;
  setDropRef(el);
};
```

**c) useDndMonitor ile drop handler:**

`slotsRef` tanımından hemen sonra ekle:

```typescript
useDndMonitor({
  onDragEnd(event) {
    const { active, over } = event;
    if (!over || over.id !== 'canvas-drop-zone') return;
    if (!active.data.current) return;
    const { componentId, componentName } = active.data.current as {
      componentId: string;
      componentName: string;
    };
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
    const droppedRect = active.rect.current.translated;
    if (!droppedRect) return;
    const x = Math.max(0, Math.min((droppedRect.left - canvasRect.left) / canvasRect.width, 0.85));
    const y = Math.max(0, Math.min((droppedRect.top - canvasRect.top) / canvasRect.height, 0.85));
    const newSlot = {
      ...emptySlot(),
      name: componentName || '',
      component_ids: [componentId],
      x,
      y,
    };
    onUpdateSlots([...slotsRef.current, newSlot]);
  },
});
```

**d) JSX'i sadeleştir:**

Tüm return bloğunu şöyle yenile (DndContext, DragOverlay, flex wrapper, ComponentPalette hepsi çıkar):

```tsx
return (
  <div>
    {/* Canvas area */}
    <div
      ref={setCanvasRef}
      style={{ height: canvasHeight }}
      className={cn(
        'relative w-full border border-border rounded-t-lg bg-background overflow-hidden',
        isOver && 'ring-2 ring-primary/40'
      )}
      onClick={() => onSelectSlot(null)}
    >
      {slots.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs text-muted-foreground">
            Sol panelden bileşen sürükle
          </p>
        </div>
      ) : (
        slots.map(slot => (
          <div
            key={slot.id}
            onClick={e => { e.stopPropagation(); onSelectSlot(slot.id); }}
            style={{
              position: 'absolute',
              left:   `${(slot.x ?? 0.05) * 100}%`,
              top:    `${(slot.y ?? 0.05) * 100}%`,
              width:  `${(slot.w ?? 0.4)  * 100}%`,
              height: `${(slot.h ?? 0.35) * 100}%`,
            }}
            className={cn(
              'rounded border-2 flex flex-col select-none transition-colors',
              selectedSlotId === slot.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground'
            )}
          >
            <div
              className="flex items-center gap-0.5 px-1 py-0.5 cursor-grab active:cursor-grabbing shrink-0"
              onMouseDown={e => handleMoveStart(e, slot.id)}
              title="Taşı"
            >
              <IconGripVertical size={10} className="shrink-0 opacity-40" />
              <span className="text-xs font-medium truncate leading-tight">
                {slot.name || 'Slot'}
              </span>
            </div>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-30 hover:opacity-70 transition-opacity"
              onMouseDown={e => handleResizeStart(e, slot.id)}
              style={{ background: 'linear-gradient(135deg, transparent 50%, currentColor 50%)' }}
            />
          </div>
        ))
      )}
    </div>

    {/* Canvas height resize handle */}
    <div
      className="w-full h-3 border-x border-b border-border rounded-b-lg flex items-center justify-center cursor-row-resize hover:bg-muted/40 transition-colors group"
      onMouseDown={handleCanvasResizeStart}
      title="Canvas yüksekliğini ayarla"
    >
      <div className="w-8 h-0.5 rounded-full bg-border group-hover:bg-muted-foreground transition-colors" />
    </div>
  </div>
);
```

**Verification:** `npx tsc --noEmit` → 0 hata

---

### Task 3: ComponentSlotSection'ı sadeleştir

**Files:**
- Modify: `components/kb-components/ComponentSlotSection.tsx`

"Slot Ekle" butonu ve slot detay panelini kaldır. Sadece `ComponentSketchCanvas` wrapper'ı kalır:

```tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent, ComponentSlot } from '@/lib/types';
import { ComponentSketchCanvas } from './ComponentSketchCanvas';
import { useState } from 'react';

interface ComponentSlotSectionProps { comp: KbComponent; }

export function ComponentSlotSection({ comp }: ComponentSlotSectionProps) {
  const upsertComponent = useKbStore.useUpsertComponent();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const updateSlots = (updated: ComponentSlot[]) =>
    upsertComponent({ ...comp, slots: updated });

  return (
    <ComponentSketchCanvas
      comp={comp}
      selectedSlotId={selectedSlotId}
      onSelectSlot={setSelectedSlotId}
      onUpdateSlots={updateSlots}
    />
  );
}
```

**Verification:** `npx tsc --noEmit` → 0 hata

---

### Task 4: ComponentRightPanel.tsx — YENİ bileşen

**Files:**
- Create: `components/kb-components/ComponentRightPanel.tsx`

Sağ kolon bileşeni. Üstte ad/açıklama/tags/type (her zaman görünür), altında tablar.

**Radix Tabs kurulu mu kontrol:** `npx tsc --noEmit` zaten kullanılan import'ları doğrular. Tabs import: `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';`

```tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent, ComponentType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagSelector } from '@/components/tags/TagSelector';
import { ComponentFaqSection } from './ComponentFaqSection';
import { ComponentRuleSection } from './ComponentRuleSection';
import { ComponentPropEditList } from './ComponentPropEditList';
import { IconLock } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ComponentRightPanelProps {
  comp: KbComponent;
}

export function ComponentRightPanel({ comp }: ComponentRightPanelProps) {
  const upsertComponent = useKbStore.useUpsertComponent();
  const isPrimitive = comp.component_type === 'primitive';

  const update = (patch: Partial<KbComponent>) =>
    upsertComponent({ ...comp, ...patch });

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full px-4 py-4">
      {/* Ad + Açıklama + Tags + Type */}
      <div className="space-y-3">
        <Input
          value={comp.name}
          onChange={e => !isPrimitive && update({ name: e.target.value })}
          readOnly={isPrimitive}
          placeholder="Component adı..."
          className="text-base font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        />
        <Textarea
          value={comp.description}
          onChange={e => !isPrimitive && update({ description: e.target.value })}
          readOnly={isPrimitive}
          placeholder="Ne işe yarar, nasıl kullanılır..."
          rows={3}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
          <TagSelector
            selectedIds={comp.tag_ids}
            onChange={isPrimitive ? () => {} : tag_ids => update({ tag_ids })}
          />
        </div>

        {isPrimitive ? (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground bg-muted/40 flex items-center gap-1">
              <IconLock size={11} /> atom
            </span>
            <span className="text-xs text-muted-foreground">Standart primitive — düzenlenemez</span>
          </div>
        ) : (
          <div className="flex gap-1.5">
            {(['composite', 'section'] as ComponentType[]).map(t => (
              <button key={t} type="button"
                onClick={() => upsertComponent({ ...comp, component_type: t })}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md border transition-colors',
                  (comp.component_type ?? 'composite') === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={isPrimitive ? 'faq' : 'props'} className="flex-1 min-h-0">
        <TabsList className="w-full">
          {!isPrimitive && <TabsTrigger value="props" className="flex-1">Props</TabsTrigger>}
          <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
          <TabsTrigger value="rules" className="flex-1">Kurallar</TabsTrigger>
        </TabsList>

        {!isPrimitive && (
          <TabsContent value="props" className="mt-3">
            <ComponentPropEditList comp={comp} />
          </TabsContent>
        )}

        <TabsContent value="faq" className="mt-3">
          <ComponentFaqSection componentId={comp.id} faqIds={comp.faq_ids} />
        </TabsContent>

        <TabsContent value="rules" className="mt-3">
          <ComponentRuleSection componentId={comp.id} ruleIds={comp.rule_ids} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Not:** `ComponentPropEditList` adında yeni bir bileşen gerekiyor — Task 5'te oluşturulur.

**Verification:** Sadece dosya oluştur, TS hatası olabilir (ComponentPropEditList henüz yok). Task 5 sonrası `npx tsc --noEmit`.

---

### Task 5: ComponentPropEditList.tsx — YENİ bileşen

**Files:**
- Create: `components/kb-components/ComponentPropEditList.tsx`

Composite bileşenler için sağ paneldeki Props tab içeriği. `ComponentPrimitiveSection`'dan sadece Props bölümü alınır:

```tsx
'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyPropDef } from '@/lib/defaults';
import type { KbComponent, ComponentPropDef } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const PROP_TYPE_OPTIONS = ['string', 'boolean', 'ReactNode', 'fn'] as const;

interface ComponentPropEditListProps { comp: KbComponent; }

export function ComponentPropEditList({ comp }: ComponentPropEditListProps) {
  const upsertComponent = useKbStore.useUpsertComponent();
  const props: ComponentPropDef[] = comp.props ?? [];

  const updateProps = (updated: ComponentPropDef[]) =>
    upsertComponent({ ...comp, props: updated });

  const addProp = () => updateProps([...props, emptyPropDef()]);
  const deleteProp = (id: string) => updateProps(props.filter(p => p.id !== id));
  const updateProp = (id: string, patch: Partial<ComponentPropDef>) =>
    updateProps(props.map(p => p.id === id ? { ...p, ...patch } : p));

  return (
    <div className="space-y-3">
      {props.map(prop => (
        <div key={prop.id} className="space-y-1.5 border border-border rounded-md p-2">
          <div className="flex gap-1.5">
            <Input
              value={prop.name}
              onChange={e => updateProp(prop.id, { name: e.target.value })}
              placeholder="propAdı"
              className="font-mono text-xs"
            />
            <button type="button"
              onClick={() => updateProp(prop.id, { required: !prop.required })}
              className="shrink-0 focus:outline-none">
              <Badge variant={prop.required ? 'default' : 'outline'} className="text-xs">
                {prop.required ? 'Zorunlu' : 'Ops.'}
              </Badge>
            </button>
            <button type="button" onClick={() => deleteProp(prop.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
              <IconTrash size={13} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {PROP_TYPE_OPTIONS.map(opt => (
              <button key={opt} type="button"
                onClick={() => updateProp(prop.id, { type: opt })}
                className="focus:outline-none">
                <Badge variant={prop.type === opt ? 'default' : 'outline'}
                  className="cursor-pointer text-xs px-1.5 py-0">
                  {opt}
                </Badge>
              </button>
            ))}
          </div>
          <Input
            value={prop.description}
            onChange={e => updateProp(prop.id, { description: e.target.value })}
            placeholder="Ne yapar, ne zaman görünür..."
            className="text-xs"
          />
        </div>
      ))}
      {props.length === 0 && (
        <p className="text-xs text-muted-foreground">Henüz prop yok.</p>
      )}
      <Button size="sm" variant="ghost" onClick={addProp}
        className="w-full justify-start text-muted-foreground hover:text-foreground">
        <IconPlus size={13} /> Prop Ekle
      </Button>
    </div>
  );
}
```

**Verification:** `npx tsc --noEmit` → 0 hata (ComponentRightPanel artık import'unu bulur)

---

### Task 6: page.tsx — 3-kolon layout + DndContext

**Files:**
- Modify: `app/(app)/components/[id]/page.tsx`

Tüm dosyayı yeniden yaz:

```tsx
'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { DndContext, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { ComponentPalette } from '@/components/kb-components/ComponentPalette';
import { ComponentSlotSection } from '@/components/kb-components/ComponentSlotSection';
import { ComponentPrimitiveSection } from '@/components/kb-components/ComponentPrimitiveSection';
import { ComponentRightPanel } from '@/components/kb-components/ComponentRightPanel';
import { IconArrowLeft, IconCube } from '@tabler/icons-react';
import type { ComponentType } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ComponentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const [activeDragName, setActiveDragName] = useState('');

  if (!data) return null;

  const comp = data.components.find(c => c.id === id);
  if (!comp) return notFound();

  const isPrimitive = comp.component_type === 'primitive';
  const backHref = comp.component_type === 'section' ? '/sections' : '/components';
  const backLabel = comp.component_type === 'section' ? 'Sections' : 'Componentler';

  const pickable = data.components.filter(
    c => c.component_type === 'primitive' || c.component_type === 'composite'
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={14} />
          {backLabel}
        </Link>
      </div>

      {/* 3-kolon */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {isPrimitive ? (
          /* Primitive: sol=atom info, orta=PrimitiveSection, sağ=panel */
          <>
            {/* Sol: atom info */}
            <div className="w-44 shrink-0 border-r border-border flex flex-col items-center justify-center gap-2 text-center p-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <IconCube size={20} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-medium">Atom Bileşen</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bu bileşen standart bir atom&apos;dur. Composite bileşenlerin
                paletinde görünür.
              </p>
            </div>

            {/* Orta: primitive props/variants/conditions */}
            <div className="flex-1 overflow-y-auto p-4">
              <ComponentPrimitiveSection comp={comp} />
            </div>

            {/* Sağ: metadata + tabs */}
            <div className="w-72 shrink-0 border-l border-border overflow-hidden">
              <ComponentRightPanel comp={comp} />
            </div>
          </>
        ) : (
          /* Composite/Section/Page: sol=palette, orta=canvas, sağ=panel */
          <DndContext
            onDragStart={(e: DragStartEvent) =>
              setActiveDragName(e.active.data.current?.componentName ?? '')
            }
            onDragEnd={() => setActiveDragName('')}
            onDragCancel={() => setActiveDragName('')}
          >
            {/* Sol: palette */}
            <div className="w-44 shrink-0 border-r border-border p-2 overflow-y-auto">
              <ComponentPalette components={pickable} />
            </div>

            {/* Orta: canvas */}
            <div className="flex-1 overflow-y-auto p-4">
              <ComponentSlotSection comp={comp} />
            </div>

            {/* Sağ: metadata + tabs */}
            <div className="w-72 shrink-0 border-l border-border overflow-hidden">
              <ComponentRightPanel comp={comp} />
            </div>

            <DragOverlay>
              {activeDragName && (
                <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded shadow-lg pointer-events-none">
                  {activeDragName}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
```

**Verification:** `npx tsc --noEmit` → 0 hata

---

### Task 7: Son TypeScript + Genel Kontrol

```bash
npx tsc --noEmit
```

Beklenen: `0 hata`

Kontrol listesi:
1. `npx tsc --noEmit` → 0 hata
2. Composite sayfası: sol palette, orta canvas, sağ panel görünür
3. Palette'ten canvas'a sürükle → slot oluşur (drop pozisyonunda)
4. Sağ panelde Props / FAQ / Kurallar tabları çalışır
5. Primitive sayfası: sol atom-info paneli, orta props/variants/conditions, sağ FAQ/Kurallar
6. Back link çalışır
7. Canvas move/resize (slot grip/corner) çalışır
