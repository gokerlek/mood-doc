# Survey Templates — Design Spec

**Date:** 2026-03-12
**Status:** Approved
**Scope:** Survey template management with drivers, question types, and a TypeForm-like editor

---

## Overview

Moodivation KB Manager'a anket şablonu yönetimi ekliyoruz. Bu özellik üç bağımsız ama ilişkili varlığı kapsar:

1. **Survey Question Types** — Sabit 7 soru tipi, dokümante edilebilir
2. **Survey Drivers** — Likert sorularının ölçtüğü boyutlar (motivasyon, stres, bağlılık vb.)
3. **Survey Templates** — Sorular, metadata, FAQ/Kural/Sözlük içeren anket şablonları

---

## Veri Modeli

### `lib/types.ts` — Yeni Tipler

```ts
// Soru tipi enum
export type QuestionType =
  | 'likert'
  | 'yes_no'
  | 'single_choice'
  | 'multiple_choice'
  | 'star'
  | 'emoji'
  | 'text';

// Soru tipi tanımı (sabit 7 tip, dokümante edilebilir)
export interface SurveyQuestionTypeDef {
  key: QuestionType;
  name: string;
  description: string;
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
}

// Ölçüm boyutu
export interface SurveyDriver {
  id: string;
  name: string;
  description: string;
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
}

// Anket sorusu
export interface SurveyQuestion {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  is_pool_question: boolean; // diğer templatelerden seçilebilir
  has_comment: boolean;      // cevap altında açık metin kutusu
  // Likert / Star / Emoji için ölçek
  scale_min?: number;        // default: 1
  scale_max?: number;        // Likert: 4|5|7|10, Star/Emoji: ayarlanabilir, default: 5
  driver_id?: string | null; // sadece Likert
  // Seçimli tipler (single_choice, multiple_choice)
  options?: string[];
  // Çoklu seçim kısıtları
  multi_min?: number | null;
  multi_max?: number | null;
}

// Anket şablonu
export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  purpose: string;         // "ne işe yarar"
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
  glossary_ids: string[];
  question_ids: string[]; // sıralı, DnD ile yeniden sıralanabilir
}
```

### `KnowledgeBase` — Yeni Alanlar

```ts
survey_question_types: SurveyQuestionTypeDef[];  // seed: 7 sabit tip
survey_drivers: SurveyDriver[];
survey_templates: SurveyTemplate[];
survey_questions: SurveyQuestion[];
```

### `lib/defaults.ts` — Yeni Factory'ler

- `SEED_QUESTION_TYPES: SurveyQuestionTypeDef[]` — 7 tip seed verisi
- `emptyDriver(): SurveyDriver`
- `emptyTemplate(): SurveyTemplate`
- `emptyQuestion(type: QuestionType): SurveyQuestion`

---

## Store (`stores/kbStore.ts`)

Yeni action'lar:
- `upsertSurveyDriver / deleteSurveyDriver`
- `upsertSurveyTemplate / deleteSurveyTemplate`
- `upsertSurveyQuestion / deleteSurveyQuestion`
- `upsertSurveyQuestionType` — sadece dokümantasyon alanlarını günceller (key değişmez)

`setData` normalizasyonuna yeni alanlar eklenir, `merge`'de seed question types inject edilir.

---

## Sayfalar

### `/question-types` — Soru Tipi Listesi
- `ListPageLayout` ile 7 kart grid
- Her kart: tip adı, açıklama, tag badge'leri, FAQ/Kural sayısı
- Kart tıklanınca `/question-types/[key]` sayfasına gider
- "Yeni ekle" butonu yok (tipler sabittir)

### `/question-types/[key]` — Soru Tipi Detayı
- 2-kolon layout (top bar'da geri linki)
- **Sol (~280px):** Ad, açıklama, tags (inline editable)
- **Sağ (flex):** Tabs → FAQ | Kurallar
  - Mevcut `ComponentFaqSection` ve `ComponentRuleSection` pattern'i kullanılır

### `/drivers` — Driver Listesi
- `ListPageLayout`, search + tag filter
- DriverCard grid
- "Yeni Driver" butonu → `emptyDriver()` oluştur, `/drivers/[id]`'e yönlendir

### `/drivers/[id]` — Driver Detayı
- `/question-types/[key]` ile aynı 2-kolon yapı
- **Sol:** Ad, açıklama, tags (inline editable)
- **Sağ:** Tabs → FAQ | Kurallar

### `/templates` — Template Listesi
- `ListPageLayout`, search + tag filter
- TemplateCard grid (ad, açıklama, amaç, soru sayısı, tags)
- "Yeni Template" butonu → oluştur + yönlendir

### `/templates/[id]` — TypeForm Editör
3-kolon layout, tüm ekranı kaplar:

**Sol Kolon (268px) — sabit**
- Template metadata: ad, açıklama, amaç, tags (inline editable, üst kısım)
- Tab bar: `Sorular | FAQ | Kurallar | Sözlük`
  - **Sorular:** DnD Kit ile sıralanabilir soru listesi. Her item: sıra no, tip badge, soru metni (kırpılmış). Seçili item vurgulanır.
  - **FAQ:** Mevcut `FaqSection` component'i (context: `{ type: 'template', template_id }`)
  - **Kurallar:** Mevcut `RuleSection` component'i
  - **Sözlük:** Mevcut glossary display
- Alt kısım: "+ Yeni Soru Ekle" butonu

**Orta Kolon (flex) — seçili sorunun formu**
- Soru tipi badge'i + sıra no header
- Soru metni input (büyük, vurgulu)
- Açıklama input (opsiyonel, küçük)
- Tipe göre önizleme alanı:
  - `likert/star/emoji`: ölçek kutucukları (scale_max adedi)
  - `yes_no`: Evet / Kararsızım / Hayır chip'leri (sabit, düzenlenemez)
  - `single_choice / multiple_choice`: Seçenek listesi — her seçenek inline editable, sürükle-bırak sıralama, "+ Seçenek Ekle" linki
  - `text`: textarea önizlemesi

**Sağ Kolon (296px) — soru ayarları**
- **Soru Tipi** dropdown (tüm 7 tip, değiştirilebilir)
- Tipe özgü ayarlar:
  - `likert`: Ölçek aralığı (preset: 1-4 / 1-5 / 1-7 / 1-10) + Driver dropdown (tek seçim)
  - `star / emoji`: Seçenek sayısı (sayısal input, min 2)
  - `multiple_choice`: "En az" / "En fazla" seçim sayısı inputları
- Toggle'lar:
  - **Zorunlu soru** (boş geçilemez)
  - **Havuz sorusu** (diğer templatelerden seçilebilir)
  - **Yorum alanı** (cevap altında açık metin kutusu)

**"Yeni Soru Ekle" Modal**
- 7 tipe karşılık gelen kart grid (2 kolon)
- Her kart: renk, ikon, ad, kısa açıklama, mini önizleme
- Tip seçilince "Ekle" butonu aktif olur
- Onayda: `emptyQuestion(type)` oluştur, template'e ekle, orta kolona odaklan

---

## Klavye Etkileşimi

| Eylem | Kısayol |
|---|---|
| Sonraki soruya geç | `↓` / `Tab` (soru listesinde) |
| Önceki soruya geç | `↑` / `Shift+Tab` |
| Soru metnine odaklan | `Enter` (soru seçiliyken) |
| Yeni soru ekle | `Ctrl+Enter` (orta kolumda) |
| Seçenek ekle (choice) | `Enter` (son seçenek inputunda) |

---

## Navigasyon — Sidebar Güncellemesi

`AppSidebar.tsx`'e yeni grup eklenir:

```ts
{ label: 'Anketler', items: [
  { label: 'Soru Tipleri', icon: IconListDetails,  href: '/question-types' },
  { label: 'Driverlar',    icon: IconRoute,         href: '/drivers' },
  { label: 'Templateler',  icon: IconTemplate,      href: '/templates' },
]}
```

---

## Yeni Dosya Yapısı

```
app/(app)/
  question-types/
    page.tsx
    [key]/page.tsx
  drivers/
    page.tsx
    [id]/page.tsx
  templates/
    page.tsx
    [id]/page.tsx

components/survey/
  QuestionTypeBadge.tsx      — renkli tip badge'i
  QuestionTypeCard.tsx       — liste kartı
  DriverCard.tsx
  TemplateCard.tsx
  TemplateLeftPanel.tsx      — sol kolon (meta + tabs)
  QuestionList.tsx           — DnD sıralanabilir liste
  QuestionForm.tsx           — orta kolon
  QuestionSettingsPanel.tsx  — sağ kolon
  AddQuestionModal.tsx       — tip seçim modal'ı
  ChoiceOptionList.tsx       — seçenek listesi (single/multi choice)

hooks/
  useSurveyTemplateActions.ts
  useQuestionActions.ts
```

---

## Kapsam Dışı

- Anket yayınlama / cevap toplama (sadece KB tanımı yapıyoruz)
- Soru atlama mantığı (skip logic / conditional branching)
- Template versiyonlama
- Havuz sorusu seçim UI'ı (havuz sorusu flag'i kaydedilir, seçim UI sonraki aşamada)
