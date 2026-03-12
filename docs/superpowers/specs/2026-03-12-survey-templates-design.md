# Survey Templates — Design Spec

**Date:** 2026-03-12
**Status:** Approved (v2 — spec review issues resolved)
**Scope:** Survey template management with drivers, question types, and a TypeForm-like editor

---

## Overview

Moodivation KB Manager'a anket şablonu yönetimi ekliyoruz. Bu özellik üç bağımsız ama ilişkili varlığı kapsar:

1. **Survey Question Types** — Sabit 7 soru tipi, dokümante edilebilir
2. **Survey Drivers** — Likert sorularının ölçtüğü boyutlar (motivasyon, stres, bağlılık vb.)
3. **Survey Templates** — Sorular, metadata, FAQ/Kural/Sözlük içeren anket şablonları

---

## FAQ / Kural Pattern Kararı

Tüm survey entity'lerinde **Pattern B (ID-reference)** kullanılır — `ComponentFaqSection` ile aynı:

- Her entity `faq_ids: string[]` ve `rule_ids: string[]` tutar
- FAQ/Kural, global `faq[]` / `rules[]` array'inde saklanır
- Entity'e özgü section component'leri oluşturulur (`SurveyFaqSection`, `SurveyRuleSection`)
- FAQ oluşturulurken `context` uygun şekilde set edilir (aşağıda)

---

## Veri Modeli

### `lib/types.ts` — Güncellemeler

**`KbItemContext` genişletmesi:**
```ts
export type KbItemContext =
  | { type: 'global' }
  | { type: 'page';          node_id: string }
  | { type: 'component';     component_id: string }
  | { type: 'template';      template_id: string }
  | { type: 'driver';        driver_id: string }
  | { type: 'question_type'; question_type_key: string };
```

**Yeni tipler:**
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

// Soru tipi tanımı (sabit 7 tip, key primary identifier)
export interface SurveyQuestionTypeDef {
  key: QuestionType;    // primary identifier — NOT id (belgelenmiş istisna)
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
  is_pool_question: boolean; // diğer templatelerden seçilebilir (UI sonraki aşamada)
  has_comment: boolean;      // cevap altında açık metin kutusu
  // Likert / Star / Emoji için ölçek
  scale_min?: number;         // default: 1
  scale_max?: number;         // Likert: 4|5|7|10 (preset'ler), Star/Emoji: serbest, default: 5
  driver_id?: string | null;  // sadece Likert
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
  purpose: string;          // "ne işe yarar"
  tag_ids: string[];
  faq_ids: string[];
  rule_ids: string[];
  glossary_ids: string[];
  question_ids: string[];   // sıralı, DnD ile yeniden sıralanabilir
}
```

### `KnowledgeBase` — Yeni Alanlar

```ts
survey_question_types: SurveyQuestionTypeDef[];  // seed: 7 sabit tip
survey_drivers: SurveyDriver[];
survey_templates: SurveyTemplate[];
survey_questions: SurveyQuestion[];
```

**Schema version:** `'3.0'` → `'4.0'`

---

## Defaults (`lib/defaults.ts`)

### `SEED_QUESTION_TYPES: SurveyQuestionTypeDef[]`
7 sabit tip (SEED_PRIMITIVES'e benzer şekilde):
- `likert` — Likert Ölçeği
- `yes_no` — Evet / Hayır
- `single_choice` — Tek Seçim
- `multiple_choice` — Çoklu Seçim
- `star` — Yıldız
- `emoji` — Emoji
- `text` — Açık Metin

### Yeni factory'ler
- `emptyDriver(): SurveyDriver`
- `emptyTemplate(): SurveyTemplate`
- `emptyQuestion(type: QuestionType): SurveyQuestion`

### `emptyKnowledgeBase()` güncellemesi
4 yeni alan boş array ile başlar:
```ts
survey_question_types: [...SEED_QUESTION_TYPES],
survey_drivers: [],
survey_templates: [],
survey_questions: [],
```

---

## Store (`stores/kbStore.ts`)

### `setData` normalizasyonu
Her yeni alan için `?? defaults.xxx` fallback:
```ts
survey_question_types: data.survey_question_types ?? defaults.survey_question_types,
survey_drivers:        data.survey_drivers        ?? defaults.survey_drivers,
survey_templates:      data.survey_templates      ?? defaults.survey_templates,
survey_questions:      data.survey_questions      ?? defaults.survey_questions,
```

### `merge` callback
Mevcut question type seed'lerini inject et (SEED_PRIMITIVES pattern'i):
```ts
// Eksik seed question type'ları başa ekle
const existingKeys = new Set(p.data.survey_question_types?.map(qt => qt.key));
const missingTypes = SEED_QUESTION_TYPES.filter(qt => !existingKeys.has(qt.key));
if (missingTypes.length > 0) {
  p.data.survey_question_types = [...missingTypes, ...p.data.survey_question_types];
}
```

### persist key
`'moodivation-kb-v3'` → **`'moodivation-kb-v4'`** (schema shape değişti)

### Yeni store action'ları

```ts
// Survey Question Types (key-based, istisna belgelenmiş)
upsertSurveyQuestionType: (qt: SurveyQuestionTypeDef) => void;
// Sadece dokümantasyon alanları güncellenir, key değişmez

// Drivers
upsertSurveyDriver: (driver: SurveyDriver) => void;
deleteSurveyDriver: (id: string) => void;
// CASCADE: deleteSurveyDriver → tüm SurveyQuestion'larda driver_id null'a set et

// Templates
upsertSurveyTemplate: (template: SurveyTemplate) => void;
deleteSurveyTemplate: (id: string) => void;

// Questions
upsertSurveyQuestion: (question: SurveyQuestion) => void;
deleteSurveyQuestion: (id: string) => void;
// CASCADE: deleteSurveyQuestion → tüm SurveyTemplate'lerde question_ids'den kaldır

// Question sıralama (template içinde)
reorderTemplateQuestions: (templateId: string, question_ids: string[]) => void;
```

### Cascade delete kuralları

| Silinen | Etkilenen | Aksiyon |
|---|---|---|
| `SurveyDriver` | `SurveyQuestion.driver_id` | `driver_id: null` set et |
| `SurveyQuestion` | `SurveyTemplate.question_ids[]` | Tüm template'lerden ID'yi kaldır |

---

## Zod Validasyonları

`SurveyQuestion` için:
- `scale_max` (likert): `z.union([z.literal(4), z.literal(5), z.literal(7), z.literal(10)])`
- `scale_max` (star/emoji): `z.number().min(2).max(10)`
- `options`: `z.array(z.string().min(1)).min(2)` (choice tipler için)
- `multi_min`: `z.number().min(1).nullable()` — `multi_max` ≥ `multi_min`

---

## Sayfalar

### `/question-types` — Soru Tipi Listesi
- `ListPageLayout` ile 7 kart grid
- Her kart: tip adı, açıklama, tag badge'leri, FAQ/Kural sayısı
- Kart tıklanınca `/question-types/[key]` sayfasına gider
- "Yeni ekle" butonu yok (tipler sabittir)

### `/question-types/[key]` — Soru Tipi Detayı
- 2-kolon layout, top bar'da geri linki
- **Sol (~280px):** Ad, açıklama, tags (inline editable)
- **Sağ (flex):** Tabs → FAQ | Kurallar
  - `SurveyFaqSection` (context: `{ type: 'question_type', question_type_key }`)
  - `SurveyRuleSection` (aynı pattern)

### `/drivers` — Driver Listesi
- `ListPageLayout`, search + tag filter
- DriverCard grid
- "Yeni Driver" → `emptyDriver()` + `/drivers/[id]`'e yönlendir

### `/drivers/[id]` — Driver Detayı
- `/question-types/[key]` ile aynı 2-kolon yapı
- **Sol:** Ad, açıklama, tags (inline editable)
- **Sağ:** Tabs → FAQ | Kurallar
  - `SurveyFaqSection` (context: `{ type: 'driver', driver_id }`)

### `/templates` — Template Listesi
- `ListPageLayout`, search + tag filter
- TemplateCard grid (ad, açıklama, amaç, soru sayısı, tags)
- "Yeni Template" → oluştur + yönlendir

### `/templates/[id]` — TypeForm Editör
3-kolon layout, tüm ekranı kaplar:

**Sol Kolon (268px) — sabit**
- Template metadata: ad, açıklama, amaç, tags (inline editable, üst kısım)
- Tab bar: `Sorular | FAQ | Kurallar | Sözlük`
  - **Sorular:** DnD Kit ile sıralanabilir soru listesi. Her item: sıra no, tip badge, soru metni (kırpılmış). Seçili item vurgulanır.
  - **FAQ:** `SurveyFaqSection` (context: `{ type: 'template', template_id }`)
  - **Kurallar:** `SurveyRuleSection` (aynı pattern)
  - **Sözlük:** `GlossarySection` — yeni component (aşağıda)
- Alt kısım: "+ Yeni Soru Ekle" butonu

**Orta Kolon (flex) — seçili sorunun formu**
- Soru tipi badge'i + sıra no header
- Soru metni input (büyük, vurgulu)
- Açıklama input (opsiyonel, küçük)
- Tipe göre önizleme ve düzenleme:
  - `likert/star/emoji`: ölçek kutucukları (scale_max adedi), sadece önizleme
  - `yes_no`: Evet / Kararsızım / Hayır chip'leri (sabit, düzenlenemez)
  - `single_choice / multiple_choice`: Seçenek listesi — inline editable, DnD sıralama, "+ Seçenek Ekle"
  - `text`: textarea önizlemesi

**Sağ Kolon (296px) — soru ayarları**
- **Soru Tipi** dropdown (tüm 7 tip, değiştirilebilir)
- Tipe özgü ayarlar:
  - `likert`: Ölçek aralığı preset'leri (1-4 / 1-5 / 1-7 / 1-10) + Driver dropdown (tek seçim, sadece Likert)
  - `star / emoji`: Seçenek sayısı (sayısal input, min 2, max 10)
  - `multiple_choice`: "En az" / "En fazla" seçim sayısı inputları
- Toggle'lar:
  - **Zorunlu soru** (boş geçilemez)
  - **Havuz sorusu** (diğer templatelerden seçilebilir — flag kaydedilir, seçim UI sonraki aşamada)
  - **Yorum alanı** (cevap altında açık metin kutusu)

**"Yeni Soru Ekle" Modal**
- 7 tipe karşılık gelen kart grid (2 kolon)
- Her kart: renk, ikon, ad, kısa açıklama, mini önizleme
- Tip seçilince "Ekle" aktif olur
- Onayda: `emptyQuestion(type)` oluştur, template'e ekle, orta kolona odaklan

---

## Klavye Etkileşimi

| Eylem | Kısayol |
|---|---|
| Sonraki soruya geç | `↓` (soru listesinde) |
| Önceki soruya geç | `↑` |
| Soru metnine odaklan | `Enter` (soru seçiliyken) |
| Yeni soru ekle | `Ctrl+Enter` (orta kolumda) |
| Seçenek ekle (choice) | `Enter` (son seçenek inputunda) |

---

## Navigasyon — Sidebar Güncellemesi

`AppSidebar.tsx`'e yeni grup:

```ts
{ label: 'Anketler', items: [
  { label: 'Soru Tipleri', icon: IconListDetails, href: '/question-types' },
  { label: 'Driverlar',    icon: IconRoute,        href: '/drivers' },
  { label: 'Templateler',  icon: IconTemplate,     href: '/templates' },
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
  QuestionTypeBadge.tsx       — renkli tip badge'i
  QuestionTypeCard.tsx        — liste kartı
  DriverCard.tsx
  TemplateCard.tsx
  TemplateLeftPanel.tsx       — sol kolon (meta + tabs)
  QuestionList.tsx            — DnD sıralanabilir liste
  QuestionForm.tsx            — orta kolon
  QuestionSettingsPanel.tsx   — sağ kolon
  AddQuestionModal.tsx        — tip seçim modal'ı
  ChoiceOptionList.tsx        — seçenek listesi (single/multi choice)
  SurveyFaqSection.tsx        — ComponentFaqSection pattern'i, survey entity'leri için
  SurveyRuleSection.tsx       — ComponentRuleSection pattern'i
  GlossarySection.tsx         — glossary_ids bazlı, yeni reusable component

hooks/
  useSurveyTemplateActions.ts — template + question mutation'ları
  useQuestionActions.ts       — soru CRUD + sıralama
  useDriverActions.ts         — driver CRUD
```

---

## Kapsam Dışı

- Anket yayınlama / cevap toplama (sadece KB tanımı)
- Soru atlama mantığı (skip logic / conditional branching)
- Template versiyonlama
- Havuz sorusu seçim UI'ı (flag kaydedilir, seçim UI sonraki aşamada)
