# Component Editor — 3-Kolon Layout Redesign

**Tarih:** 2026-03-01
**Konu:** Komponent detay sayfasının 3-kolon layout'a geçişi

---

## Hedef

Komponent editor sayfasını Figma/Builder.io tarzı 3-kolon layout'a taşımak:
- Sol: Palette (sürüklenebilir atom/composite listesi)
- Orta: Canvas (görsel kompozisyon alanı)
- Sağ: Metadata + Tabs (Props, FAQ, Kurallar)

"Slot Ekle" butonu ve slot detay paneli kalkıyor — slot oluşturma tamamen palette'ten canvas'a sürükle-bırak ile yapılıyor.

---

## Layout

### Composite / Section / Page

```
┌──────────────┬──────────────────────────────┬─────────────────────┐
│  LEFT ~w-44  │      CENTER flex-1            │  RIGHT ~w-72        │
├──────────────┼──────────────────────────────┼─────────────────────┤
│ Bileşenler   │  ╔══════════════════╗         │  Ad:  [__________]  │
│              │  ║   Container      ║  resize │  Açıklama:          │
│ atom         │  ║  ┌──────┐        ║         │  [________________] │
│  Button      │  ║  │Button│        ║         │  Taglar / Type      │
│  Input       │  ║  └──────┘        ║         │                     │
│  Container   │  ╚══════════════════╝         │ [Props][FAQ][Kural] │
│  ──────────  │                               │ ─────────────────── │
│ composite    │  ← sürükle & bırak →          │  Props tab:         │
│  Card        │                               │  prop1: string      │
│  ...         │                               │  + Prop Ekle        │
└──────────────┴──────────────────────────────┴─────────────────────┘
```

### Primitive (Atom)

```
┌──────────────┬──────────────────────────────┬─────────────────────┐
│  LEFT ~w-44  │      CENTER flex-1            │  RIGHT ~w-72        │
├──────────────┼──────────────────────────────┼─────────────────────┤
│ 🔒 Atom      │  Props / Variants /           │  Ad (read-only)     │
│              │  Conditions                   │  Açıklama (r/o)     │
│  Bu bileşen  │  (ComponentPrimitiveSection)  │                     │
│  atom'dur —  │                               │ [FAQ] [Kurallar]    │
│  paletlerde  │                               │ ─────────────────── │
│  kullanılır  │                               │  FAQ items...       │
└──────────────┴──────────────────────────────┴─────────────────────┘
```

---

## Değişiklikler

### Kaldırılanlar
- "Slot Ekle" butonu
- Slot detay paneli (slot adı edit, slot-spesifik prop ekle, bileşen atama popover'ı)

### Yeni Seed Primitive
- `Container` primitive eklenir (id: `seed-prim-container`) — layout wrapper olarak palette'te görünür

### Canvas Değişiklikleri
- `ComponentSketchCanvas`: palette çıkar, sadece canvas + drop zone + slot rendering
- Canvas'ta görsel outer container (resizable, component sınırını temsil eder)
- Slot'lar canvas'ta grip+resize ile move/resize (mevcut davranış korunur)
- Empty state: "Sol panelden bileşen sürükle"

### Sayfa Layout (`page.tsx`)
- `max-w-2xl` → `w-full` full-width
- 3-kolon: `grid grid-cols-[theme(spacing.44)_1fr_theme(spacing.72)]` veya `flex`
- Back link üste kalır (full width)
- Composite: Sol=Palette, Orta=Canvas, Sağ=ad+açıklama+tabs
- Primitive: Sol=AtomInfo, Orta=PrimitiveSection, Sağ=ad+tabs

### Yeni / Güncellenen Bileşenler

| Dosya | Durum | Açıklama |
|---|---|---|
| `components/kb-components/ComponentPalette.tsx` | Var | Palette içeriği aynı, sayfa level'a taşınır |
| `components/kb-components/ComponentSketchCanvas.tsx` | Güncelle | Palette çıkar, outer container frame eklenir |
| `components/kb-components/ComponentSlotSection.tsx` | Büyük güncelleme | Sadece canvas wrapper'a dönüşür, slot detay paneli kaldırılır |
| `components/kb-components/ComponentRightPanel.tsx` | **YENİ** | Sağ kolon: ad/açıklama/tags + Tabs (Props, FAQ, Kurallar) |
| `app/(app)/components/[id]/page.tsx` | Büyük güncelleme | 3-kolon layout, bileşenler yeniden dağıtılır |
| `lib/defaults.ts` | Küçük güncelleme | Container seed primitive eklenir |

### Sağ Panel (ComponentRightPanel)
- Ad input + Açıklama textarea + Tags + Type selector (üstte, tab dışında)
- Tabs:
  - **Props** (composite için): komponent-level prop ekle/düzenle/sil
  - **FAQ**: ComponentFaqSection
  - **Kurallar**: ComponentRuleSection
- Primitives için: ad+açıklama read-only, tabs = [FAQ][Kurallar]

---

## Veri Modeli

- `ComponentSlot` yapısı değişmez — her sürüklenen item bir slot oluşturur
- `component_ids: [componentId]` drop sırasında set edilir
- Slot'un `name` = bileşen adı (sürüklenenden)
- Slot-spesifik `props` artık UI'da düzenlenemiyor (basitleştirme)

---

## Doğrulama

1. `npx tsc --noEmit` → 0 hata
2. Composite sayfasında 3-kolon görünür
3. Primitive sayfasında tutarlı 3-kolon görünür (sol=atom info, orta=primitive section)
4. Palette'ten canvas'a sürükle → slot oluşur
5. Sağ panelde Props/FAQ/Kurallar tabları çalışır
6. Back link, kaydet durumu bozulmaz
