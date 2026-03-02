# UI Modernizasyon Tasarımı

**Tarih:** 2026-03-02
**Kapsam:** Tüm uygulama — sıralı implementation
**Yön:** Bold & Color yapısal modernizasyon (renkler kurumsal, dokunulmaz)

---

## Hedef

Mevcut "admin panel" görünümünden Craft/Framer hissiyatlı, modern bir internal tool UI'a geçiş.
Renkler (primary purple, theme token'ları) değişmez. Sorun yapısal: kart anatomisi, layout, hierarchy, spacing.

---

## Bölüm 1: Card Anatomisi — 3 Seviye

### Level 1 — List Card (ComponentCard, PageCard, FaqRow, RuleRow)

Şu an: `border border-border rounded-lg p-4` — düz, gölgesiz, hover yok.

Yeni:
- `rounded-xl shadow-sm border border-border`
- Hover: `shadow-md border-primary/40 -translate-y-0.5 transition-all duration-150`
- **Sol accent bar**: `border-l-4` — tip bazlı renk (atom=border-muted-foreground, composite=border-primary, faq=border-primary/60, rule=border-amber-500/60)
- İçerik: Icon + başlık + meta bilgi (count badge'leri) + tag'ler

### Level 2 — Section Container (sayfa içi gruplamalar)

Şu an: çıplak div veya border-box.

Yeni:
- `bg-muted/40 rounded-2xl p-5`
- Başlık: `text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3`
- İçerik altında `space-y-2`

### Level 3 — Editor Panel (RightPanel, FormCard)

Şu an: düz border.

Yeni:
- `shadow-lg rounded-2xl border border-border`
- Bölümler arası: `<div className="h-px bg-border my-4" />`
- Sticky top position korunur

---

## Bölüm 2: List Sayfaları Layout

### Şu an
Tek kolon, `max-w-2xl`, sıkışık liste.

### Yeni
**Grid layout** — 3 kolon (responsive: 1col mobile → 2col md → 3col lg):

```
┌───────────────┐  ┌───────────────┐  ┌─────────────┐
│ ◈ Navbar      │  │ ⬡ Sidebar     │  │ ◈ Modal     │
│               │  │               │  │             │
│ 3 slot · 2FAQ │  │ 5 slot · 1FAQ │  │ 2 slot      │
│ #nav #global  │  │ #layout       │  │ #overlay    │
└───────────────┘  └───────────────┘  └─────────────┘
```

**Kart içi bilgi yoğunluğu:**
- Slot count, FAQ count, Rule count — `text-xs text-muted-foreground`
- Tag badge'leri (max 3, sonrası `+N`)
- Tip badge (Atom / Composite / Global / Page vb.)

**Filtre/segment bar:**
- Sayfa üstünde: `Tümü (8) · Atomlar (3) · Composite (5)` — segment seçici
- Arama input'u sağda

**Geçerli sayfalar:** `/components`, `/pages`, `/faq`, `/rules`

---

## Bölüm 3: Sidebar & App Shell

### Sidebar

Şu an: beyaz arka plan, soluk nav item'ları.

Yeni:
- **Brand area**: Logo icon (28px) + bold "Moodivation" + muted "KB Manager" subtitle, `border-b border-border pb-4 mb-3`
- **Group label'lar**: `text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground px-3 mb-1`
- **Nav item aktif**: `bg-primary/10 text-primary font-semibold` + `border-l-2 border-primary ml-0 pl-[calc(theme(spacing.3)-2px)]`
- **Nav item hover**: `bg-muted/60`
- **Save indicator** (alt kısım): Pill-shaped, `rounded-full px-3 py-1.5 text-xs` — amber/green/spinning state

### App Shell

- Main content area: `bg-muted/20` (çok hafif toned background)
- İçerik sayfaları: `bg-background rounded-xl` container içinde — kartlanmış alan hissi

---

## Bölüm 4: Sayfa Header'ları (Tüm Sayfalar)

Tutarlı pattern her sayfada:

```tsx
<div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-primary/10 rounded-xl">
      <Icon size={24} className="text-primary" />
    </div>
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Başlık</h1>
      <p className="text-sm text-muted-foreground mt-0.5">Açıklama</p>
    </div>
  </div>
  <Button>...</Button>
</div>
```

**Değişiklikler:**
- `text-2xl font-bold tracking-tight` (şu an text-lg)
- Başlık solunda icon container: `bg-primary/10 rounded-xl p-2`
- Alt çizgi: `border-b border-border pb-6 mb-8`

---

## Implementation Sırası

| # | Bölüm | Etki |
|---|-------|------|
| 1 | CSS token güncellemesi | Tüm app |
| 2 | Sidebar & App Shell | Tüm app |
| 3 | Sayfa header pattern | Tüm list sayfalar |
| 4 | List Card anatomy | ComponentCard, PageCard, FaqRow |
| 5 | Grid layout — list sayfalar | /components, /pages, /faq, /rules |
| 6 | Section Container pattern | Editor sayfalar |
| 7 | Editor Panel (RightPanel) | Component detay |

---

## Kapsam Dışı

- Renk değişikliği (kurumsal renkler korunur)
- Dark mode (sadece light mode)
- Canvas/map görünümü (ayrı task)
- Fonksiyonel değişiklikler
