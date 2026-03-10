# mood-doc — Claude Talimatları

## Proje Hakkında

Moodivation platformunun client-ui'ı için Knowledge Base yönetim aracı.
BE-free: tüm veri GitHub'daki tek bir `knowledge_base.json` dosyasında yaşar.

**Stack:** Next.js 16 App Router · TypeScript (strict) · Zustand 5 · TanStack Query · shadcn/ui · DnD Kit · React Flow · Tailwind CSS 4

**Mimari Doküman:** `docs/plans/2026-02-28-kb-architecture-redesign.md`
**Implementation Planı:** `docs/plans/2026-02-28-kb-implementation-plan.md`

---

## Komutlar

```bash
bun dev                # Dev server (port 3000)
bun run build          # Production build
bun run test           # Vitest (tek geçiş)
bun run test:watch     # Watch mode
bun run test:coverage  # Coverage raporu
bun run lint           # ESLint
```

## Environment Değişkenleri

`.env.local` gerekli (yoksa GitHub yerine boş KB döner):

```
GITHUB_PAT=ghp_...
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
GITHUB_BRANCH=main
GITHUB_FILE_PATH=knowledge_base.json
```

## Anahtar Dosyalar

| Dosya | Rol |
|-------|-----|
| `lib/types.ts` | Tüm TypeScript tipleri |
| `lib/defaults.ts` | `emptyKnowledgeBase()`, `emptyComponent()` factory'leri |
| `stores/kbStore.ts` | Tek global store |
| `hooks/useKb.ts` | TanStack Query load/save hook'ları |
| `app/api/knowledge-base/route.ts` | Tek API endpoint |

## Kritik Pattern'ler

**Store okuma — `auto-zustand-selectors-hook`:**
```ts
// DOĞRU
const data = useKbStore.useData();
// YANLIŞ — doğrudan useKbStore() kullanma
```

**Store mutation — immer ile:** Store action'ları `immer` produce kullanıyor, `state.data` üzerinde doğrudan mutasyon yapılabilir.

**localStorage persist key:** `moodivation-kb-v3`
(v2'den fark: slot koordinatları normalize oran → pixel cinsine geçti)

## Test Notları

- Framework: Vitest, testler `__tests__/` dizininde
- `environment: 'node'` — React component testleri yok, sadece pure logic
- `kbStore.test.ts` içinde bilinen strict TS hataları var (`slot` possibly undefined) — test mantığı doğru, `!` assertion eksik, production kodu temiz

---

## Kodlama Kuralları (Sabit — İstisna Yok)

### 1. TypeSafety

- `any` kesinlikle yasak
- Her component props'u için `interface` tanımla
- Store'dan gelen data'ya her zaman null-check yap
- Form validation için Zod kullan
- `unknown` → type-guard ile daralt

### 2. SOLID — Özellikle Tek Sorumluluk

- Her component tek bir iş yapar
- Form logic, display logic, mutation logic ayrı katmanlarda
- Store mutation'ları doğrudan component içinde değil, domain hook'larına çıkarılır
  ```
  hooks/useFaqActions.ts    ← mutation logic
  components/faq/FaqRow.tsx ← sadece görsel
  ```
- Bir dosya uzarsa böl, birleştirme

### 3. Stil Hiyerarşisi (öncelik sırasıyla)

1. **shadcn component** kullan → `<Button>`, `<Input>`, `<Card>`, `<Badge>` vb.
2. **Koşullu / varyantlı stil** → `cva()` ile variant tanımla
3. **Basit birleşim** → `cn()` ile Tailwind class'larını birleştir
4. **Hesaplamalı değer** → inline style serbest (`style={{ width: calculated }}`)
5. **Gerçekten gerekli ise** → `globals.css`'e ekle (abartma)
6. **Arbitrary Tailwind değerleri** (`w-[123px]`, `text-[13px]`) → **YASAK**

### 4. Tema ve Renkler

- Hardcoded renk (`text-blue-500`, `bg-gray-100`) kullanma
- Her zaman CSS variable'ları kullan: `text-primary`, `bg-muted`, `text-muted-foreground`, `border-border` vb.
- Yeni renk/token gerekirse `globals.css`'e CSS variable olarak ekle

### 5. Component Yapısı

- shadcn dışında HTML elementi kullanılacaksa neden kullandığını düşün
- `<div className="flex ...">` yerine shadcn layout primitive'leri tercih et
- Icon kütüphanesi: `@tabler/icons-react`

---

## Mimari Kurallar

### Veri Akışı

```
GitHub (knowledge_base.json)
    ↕ /api/knowledge-base
TanStack Query (useLoadKb / useSaveKb)
    ↕
kbStore (Zustand) ← localStorage persist (moodivation-kb-v3)
    ↕
React Components
```

### Map-Driven Yapı

- **Leaf node** (parent'ı olmayan node) = Sayfa
- **Group node** (başka node'ların parent'ı) = Component grubu, isteğe bağlı `component_id` taşır
- Sayfalar sadece map'ten oluşturulur, ayrı bir "sayfa ekle" yok

### Tek JSON, Tek Endpoint

- Map ve KB ayrı endpoint'e **yazılmaz**
- Her şey `/api/knowledge-base` üzerinden okunur/yazılır
- `mapStore` ve `uiStore` yoktur, tek `kbStore`

### Context Sistemi

- Her FAQ ve Kural bir `context` taşır: `global` | `page` | `component`
- Global sayfalardan eklenirken context seçilir
- Sayfa veya component detayından eklenirken context otomatik set edilir

### Tag Sistemi

- Tag'ler kategorilidir, dinamik eklenir
- Her yerde **listeden seçilir**, serbest yazım yoktur
- Chatbot/agent sınıflandırması için kritik

---

## Kapsam Dışı (Şimdilik)

- **Changelog** — ilk kurulum tamamlandıktan sonra eklenecek
- **Authentication** — GitHub PAT `.env.local`'da, kullanıcı girişi yok
- **Mobile responsiveness** — masaüstü öncelikli
