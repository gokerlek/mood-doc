# mood-doc KB Mimari Yeniden Tasarım

**Tarih:** 2026-02-28
**Durum:** Onaylandı

---

## Genel Bakış

mood-doc uygulaması Moodivation platformunun client-ui'ı için bir Knowledge Base yönetim aracıdır. Veriler tek bir `knowledge_base.json` dosyasında tutulur, GitHub üzerinde depolanır. Uygulama BE-free'dir.

Bu doküman mevcut mimarinin yeniden tasarımını tanımlar. Eski `modules` ve ayrı `pages` listesi kaldırılır. Map odaklı (map-driven) bir mimari benimsenir.

---

## Temel Mimari Kararlar

### Map-Driven Yapı
- **Map tek kaynak**: Tüm sayfa bilgisi map node'larında yaşar
- **Leaf node = Sayfa**: Parent'ı olmayan node'lar sayfa olarak kabul edilir
- **Group node = Component grubu**: Parent olan node'lar isteğe bağlı olarak bir component ile eşleştirilebilir
- Ayrı `modules` veya `pages` entity'si yoktur

### Tek JSON Yapısı
Map ve KB ayrı endpoint'lere yazılmaz. Her şey tek `knowledge_base.json` dosyasına gider. Race condition riski ortadan kalkar.

### Tag Sistemi
- Tag'ler kategorilidir ve dinamiktir (admin yeni kategori/tag ekleyebilir)
- Serbest yazım yoktur — her yerde listeden seçilir
- Chatbot/agent için kritik: konuya, kullanıcı grubuna ve içerik tipine göre sınıflandırma yapılır

### FAQ & Kural Context'i
- Her FAQ ve Kural bir `context` taşır: `global`, `page` (node_id) veya `component` (component_id)
- Global sayfalardan eklenirken context manuel seçilir
- Sayfa veya component detayından eklenirken context otomatik set edilir

---

## JSON Şeması (v3.0)

```json
{
  "_meta": {
    "schema_version": "3.0",
    "last_updated": "ISO-8601 tarih"
  },

  "tag_categories": [
    { "id": "cat_1", "label": "Konu" },
    { "id": "cat_2", "label": "Kullanıcı Grubu" },
    { "id": "cat_3", "label": "İçerik Tipi" }
  ],

  "tags": [
    { "id": "tag_1", "label": "anket", "category_id": "cat_1" },
    { "id": "tag_2", "label": "admin", "category_id": "cat_2" },
    { "id": "tag_3", "label": "kural", "category_id": "cat_3" }
  ],

  "components": [
    {
      "id": "comp_1",
      "name": "Survey Widget",
      "description": "...",
      "tag_ids": ["tag_1"],
      "faq_ids": ["faq_3"],
      "rule_ids": ["rule_2"]
    }
  ],

  "map": {
    "nodes": [
      {
        "id": "node_1",
        "type": "page",
        "label": "Anket Oluştur",
        "parent_id": null,
        "component_id": null,
        "page_data": {
          "description": "...",
          "tag_ids": ["tag_1"],
          "sections": [
            { "id": "s1", "type": "text", "order": 0, "content": "..." },
            { "id": "s2", "type": "faq", "order": 1, "faq_ids": ["faq_1", "faq_2"] },
            { "id": "s3", "type": "rules", "order": 2, "rule_ids": ["rule_1"] },
            { "id": "s4", "type": "components", "order": 3, "component_ids": ["comp_1"] }
          ]
        }
      },
      {
        "id": "node_2",
        "type": "group",
        "label": "Raporlama Modülü",
        "parent_id": null,
        "component_id": "comp_1",
        "page_data": null
      }
    ],
    "edges": [
      { "id": "edge_1", "source": "node_2", "target": "node_1" }
    ]
  },

  "faq": [
    {
      "id": "faq_1",
      "question": "...",
      "answer": "...",
      "tag_ids": ["tag_1", "tag_2"],
      "context": { "type": "page", "node_id": "node_1" }
    },
    {
      "id": "faq_2",
      "question": "...",
      "answer": "...",
      "tag_ids": [],
      "context": { "type": "global" }
    },
    {
      "id": "faq_3",
      "question": "...",
      "answer": "...",
      "tag_ids": ["tag_1"],
      "context": { "type": "component", "component_id": "comp_1" }
    }
  ],

  "rules": [
    {
      "id": "rule_1",
      "content": "...",
      "tag_ids": ["tag_3"],
      "context": { "type": "page", "node_id": "node_1" }
    },
    {
      "id": "rule_2",
      "content": "...",
      "tag_ids": [],
      "context": { "type": "component", "component_id": "comp_1" }
    }
  ],

  "glossary": [
    { "id": "gl_1", "term": "...", "definition": "..." }
  ],

  "agent_behavior": {
    "tone": "...",
    "fallback_message": "...",
    "escalation_message": "...",
    "max_answer_sentences": 3,
    "escalation_triggers": []
  }
}
```

---

## Sayfa Yapısı (Routes)

| Route | Açıklama | Durum |
|-------|----------|-------|
| `/map` | Görsel harita | Mevcut — refactor |
| `/pages` | Leaf node listesi | Yeni |
| `/pages/[id]` | Sayfa detay editörü | Yeni |
| `/components` | Component listesi | Yeni |
| `/components/[id]` | Component detay | Yeni |
| `/faq` | Global FAQ | Mevcut — context eklenir |
| `/rules` | Global Kurallar | Mevcut — context eklenir |
| `/glossary` | Sözlük | Mevcut — kalıyor |
| `/tags` | Tag & Kategori yönetimi | Yeni |
| `/agent` | Agent ayarları | Mevcut — kalıyor |

---

## Sayfa Detay Editörü (`/pages/[id]`)

DnD Kit ile sıralanabilir section'lardan oluşur.

**Section Tipleri:**
- `text` — Serbest metin bloğu
- `faq` — Bu sayfaya bağlı FAQ'lar listesi + yeni ekleme
- `rules` — Bu sayfaya bağlı kurallar listesi + yeni ekleme
- `components` — Bu sayfada kullanılan componentler listesi

**Davranış:**
- Sol panel: eklenebilir section tipleri paleti
- Sağ alan: mevcut section'lar DnD ile sıralanır
- FAQ/Kural buradan eklenince `context` otomatik set edilir (node_id)

---

## Tag Sistemi (`/tags`)

- Kategori ekle/düzenle/sil
- Kategori altına tag ekle/düzenle/sil
- Tüm uygulama genelinde tag seçimi bu listeden yapılır (serbest yazım yok)
- Chatbot için sınıflandırma kategorileri: Konu, Kullanıcı Grubu, İçerik Tipi, Durum

---

## Component Sistemi (`/components`, `/components/[id]`)

**Liste sayfası:**
- Component kartları (isim, tag'ler, FAQ sayısı, kural sayısı)
- Yeni component ekle

**Detay sayfası:**
- İsim, açıklama düzenleme
- Tag seçimi (listeden)
- Component'a ait FAQ'lar (context otomatik: component)
- Component'a ait kurallar (context otomatik: component)

---

## Kaldırılanlar

- `modules` entity'si ve ilgili store metodları
- `/api/map` ayrı endpoint'i — map verisi KB endpoint'inden okunup yazılır
- `global_rules.anonymity_limit` ve `global_rules.reporting_limit` sabit alanları → genel `rules` listesine taşınır

---

## Sonraki Adım

Implementation planı yazılacak (writing-plans skill).

**Changelog özelliği bu aşamada kapsam dışıdır** — ilk kurulum tamamlandıktan sonra eklenecek.
