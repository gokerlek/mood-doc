# Liste Sayfası Refactor — Design Spec

**Tarih:** 2026-03-11
**Kapsam:** Liste sayfaları + shared component'ler (detay/\[id\] sayfaları kapsam dışı)
**Yaklaşım:** ListPageLayout wrapper + component extraction (Yaklaşım B)

---

## Problem

7 liste sayfasında (`pages`, `sections`, `components`, `faq`, `rules`, `glossary`, `tags`) aşağıdaki tekrarlar tespit edildi:

1. **Sayfa iskeleti** — Her sayfa 3-katmanlı wrapper + `PageHeader` override oyununu kendisi yazıyor
2. **`EmptyState` kullanılmıyor** — `components/shared/EmptyState.tsx` var ama 7 sayfa kendi inline empty state'ini yazıyor; tasarımlar da birbirinden farklı
3. **"No results" mesajı** — 5 sayfada kelimesi kelimesine aynı JSX
4. **Grup başlığı** — icon + uppercase label + count pattern'ı 3 sayfada inline
5. **Tag filter satırı** — "Tümü" + tag butonları 2 sayfada neredeyse aynı
6. **`leafNodes` hesaplama** — Aynı `useMemo` bloğu 3 sayfada kopyalanmış
7. **Context split** — `global / page / component` ayrımı 2 sayfada aynı

---

## Hedef

- Her UI pattern tek bir yerde yaşasın
- Sayfalar "ne gösteriyorum" odaklı olsun, "nasıl sarıyorum" detayını taşımasın
- `EmptyState` tutarlı hale gelsin ve gerçekten kullanılsın

---

## Yeni Shared Component'ler

### `ListPageLayout` — `components/shared/ListPageLayout.tsx`

```tsx
interface ListPageLayoutProps extends PageHeaderProps {
  maxWidth?: '4xl' | '5xl';
  children: ReactNode;
}
```

- `PageHeader` prop'larını (`icon`, `title`, `description`, `action`) alır, doğrudan render eder
- `border-b` border'ını kendi yönetir — sayfalardaki `className="pb-0 mb-0 border-b-0"` override kargaşası ortadan kalkar
- `maxWidth` prop'u: `'4xl'` (FAQ, Rules, Glossary, Tags) veya `'5xl'` (Pages, Sections, Components)
- `children` content zone'una render edilir

**Örnek kullanım:**
```tsx
<ListPageLayout
  icon={<IconTags size={22} className="text-primary" />}
  title="Tag Yönetimi"
  description="Tüm tag kategorilerini ve etiketleri buradan yönetin."
  action={<Button onClick={handleAdd}><IconPlus size={14} />Kategori Ekle</Button>}
  maxWidth="4xl"
>
  {/* content */}
</ListPageLayout>
```

---

### `EmptyState` — güncelleme (`components/shared/EmptyState.tsx`)

Interface değişmez. Stil sayfaların kullandığı inline pattern'a hizalanır:

```
py-12 · bg-muted/30 · rounded-2xl · border border-dashed border-border · text-center
```

`action` prop'u: `{ label: string; onClick: () => void }` — link-style buton olarak render edilir (mevcut `variant="outline"` yerine `variant="link"`), sayfaların inline `→` pattern'ıyla eşleşmesi için.

---

### `NoResults` — `components/shared/NoResults.tsx`

```tsx
interface NoResultsProps {
  message?: string;  // default: "Eşleşen sonuç bulunamadı."
  onClear: () => void;
}
```

5 sayfadaki şu bloğun yerini alır:
```tsx
<p className="text-center py-8 text-sm text-muted-foreground">
  Eşleşen X bulunamadı.{' '}
  <Button variant="link" onClick={() => setSearch('')} className="p-0 h-auto">Temizle</Button>
</p>
```

---

### `SectionListHeader` — `components/shared/SectionListHeader.tsx`

```tsx
interface SectionListHeaderProps {
  icon: ReactNode;
  label: string;
  count: number;
}
```

`pages`, `sections`, `components`'taki grid başlığını (icon + uppercase label + count) karşılar.

---

### `TagFilterBar` — `components/shared/TagFilterBar.tsx`

```tsx
interface TagFilterBarProps {
  tagIds: string[];      // sayfadaki item'lardan toplanan tag id'leri
  tags: KbTag[];         // data.tags (label lookup için)
  activeTag: string;
  onSelect: (tagId: string) => void;
}
```

`faq/page.tsx` ve `components/page.tsx`'teki "Tümü + tag butonları" satırını karşılar.

---

## Yeni Hook'lar

### `useLeafNodes` — `hooks/useLeafNodes.ts`

```ts
function useLeafNodes(): MapNodeData[]
```

`pages/page.tsx`, `faq/page.tsx`, `rules/page.tsx`'teki aynı `useMemo` bloğunu tek yere çeker. Store'dan `data` okur, `parentIds` set'ini hesaplar, leaf node'ları döner.

---

### `useContextSplit` — `hooks/useContextSplit.ts`

```ts
function useContextSplit<T>(
  items: T[],
  getType: (item: T) => string
): { global: T[]; page: T[]; component: T[] }
```

`faq/page.tsx` ve `rules/page.tsx`'teki `filtered.filter(f => f.context.type === 'global')` üçlüsünü karşılar. `useMemo` ile sarılır.

---

## Etkilenen Sayfalar

| Sayfa | Gider | Kullanır | Tahmini satır |
|---|---|---|---|
| `pages/page.tsx` | wrapper, inline empty, group header | `ListPageLayout`, `EmptyState`, `SectionListHeader`, `useLeafNodes` | ~99 → ~55 |
| `sections/page.tsx` | wrapper, inline empty, group header | `ListPageLayout`, `EmptyState`, `SectionListHeader`, `NoResults` | ~92 → ~50 |
| `components/page.tsx` | wrapper, inline empty, group header ×2, tag filter | `ListPageLayout`, `EmptyState`, `SectionListHeader`, `TagFilterBar`, `NoResults` | ~149 → ~75 |
| `faq/page.tsx` | inline empty, tag filter, leafNodes, context split | `EmptyState`, `TagFilterBar`, `NoResults`, `useLeafNodes`, `useContextSplit` | ~182 → ~105 |
| `rules/page.tsx` | wrapper, inline empty, leafNodes, context split | `ListPageLayout`, `EmptyState`, `NoResults`, `useLeafNodes`, `useContextSplit` | ~149 → ~80 |
| `glossary/page.tsx` | inline empty | `EmptyState`, `NoResults` | ~141 → ~115 |
| `tags/page.tsx` | wrapper, inline empty | `ListPageLayout`, `EmptyState`, `NoResults` | ~84 → ~55 |

---

## Kapsam Dışı

- Detay sayfaları: `pages/[id]`, `sections/[id]`, `components/[id]`
- `faq` ve `rules`'taki `FaqRow` / `RuleRow` ve form component'leri
- Map sayfası
- Agent sayfası

---

## Dosya Değişiklikleri Özeti

**Yeni dosyalar:**
- `components/shared/ListPageLayout.tsx`
- `components/shared/NoResults.tsx`
- `components/shared/SectionListHeader.tsx`
- `components/shared/TagFilterBar.tsx`
- `hooks/useLeafNodes.ts`
- `hooks/useContextSplit.ts`

**Güncellenen dosyalar:**
- `components/shared/EmptyState.tsx` (stil güncelleme)
- `app/(app)/pages/page.tsx`
- `app/(app)/sections/page.tsx`
- `app/(app)/components/page.tsx`
- `app/(app)/faq/page.tsx`
- `app/(app)/rules/page.tsx`
- `app/(app)/glossary/page.tsx`
- `app/(app)/tags/page.tsx`
