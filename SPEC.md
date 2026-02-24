# Moodivation Knowledge Base Manager — Technical Specification
> Cursor / Claude Code prompt. Read this entire file before writing any code.

---

## 1. Project Overview

Build a **Next.js web application** called **Moodivation KB Manager** that serves three roles simultaneously:

| Role | Who | What they do |
|------|-----|--------------|
| **Editor** | Moodivation team | Add/edit modules, FAQ entries, guide steps, global rules via forms |
| **Documentation viewer** | New employees | Read-only, beautifully rendered usage guide of the Moodivation platform |
| **Agent data source** | Chatbot / AI agent | Fetches `/api/knowledge-base` → returns the latest JSON |

The single source of truth is a file called `knowledge_base.json` stored in a GitHub repository. When an editor saves changes, the app commits the updated JSON to GitHub via the GitHub REST API using a Personal Access Token (PAT).

---

## 2. Tech Stack

### 2.1 Package List

```bash
# Core
npx create-next-app@latest --typescript --tailwind --app --eslint

# UI
npx shadcn@latest init
npm install @base-ui/react
npm install @tabler/icons-react

# State
npm install zustand
npm install auto-zustand-selectors-hook

# Server state / caching
npm install @tanstack/react-query @tanstack/react-query-devtools

# Forms
npm install react-hook-form @hookform/resolvers

# Validation
npm install zod

# Functional utilities
npm install ramda
npm install -D @types/ramda

# Diff view (CommitModal)
npm install diff react-diff-viewer-continued
```

### 2.2 Library Responsibilities

| Library | Role | Where used |
|---------|------|-----------|
| **Next.js 14 App Router** | Framework, routing, API routes | Everywhere |
| **TypeScript (strict)** | Type safety | Everywhere |
| **Tailwind CSS** | Utility-first styling | All components |
| **shadcn/ui** | Form primitives, dialogs, tabs, toasts, badges, cards | Editor + Docs |
| **@base-ui/react** | Headless primitives not covered by shadcn (Collapsible, Popup, Select) | Sidebar, tag input, custom dropdowns |
| **@tabler/icons-react** | Icon set | Navigation, buttons, empty states, badges |
| **Zustand** | Client state management | Editor store, GitHub config store, UI store |
| **auto-zustand-selectors-hook** | Auto-generates typed selector hooks from Zustand stores | All store consumers |
| **TanStack Query (React Query)** | Server state, fetching, caching, background refetch | `/api/knowledge-base` fetch, GitHub API calls |
| **React Hook Form** | Form state, field registration, submit handling | All editor forms (FAQ, Guide Step, Template, etc.) |
| **@hookform/resolvers** | Connects Zod schemas to React Hook Form | All forms |
| **Zod** | Schema definition + runtime validation | `lib/schema.ts`, all forms |
| **Ramda** | Pure functional transformations | Tag normalization, KB diffs, ID generation, data mapping |
| **PAT storage** | `localStorage` only — never sent anywhere other than `api.github.com` | `lib/github.ts` |

### 2.3 State Architecture

Three Zustand stores — one concern per store:

```
stores/
  githubStore.ts      → PAT, repo config, SHA, connection status
  kbStore.ts          → KnowledgeBase data (draft in-memory), dirty flag
  uiStore.ts          → active module, active tab, commit modal open/closed
```

**auto-zustand-selectors-hook** is used on every store. It wraps the store and generates
`useGithubStore.pat`, `useGithubStore.setSha`, etc. — no manual selector boilerplate.

```typescript
// stores/kbStore.ts
import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { create } from 'zustand';

interface KbState {
  data: KnowledgeBase | null;
  isDirty: boolean;
  setData: (kb: KnowledgeBase) => void;
  patchModule: (moduleId: string, patch: Partial<Module>) => void;
  resetDirty: () => void;
}

const useKbStoreBase = create<KbState>((set) => ({
  data: null,
  isDirty: false,
  setData: (data) => set({ data, isDirty: false }),
  patchModule: (moduleId, patch) =>
    set((s) => ({
      isDirty: true,
      data: s.data
        ? { ...s.data, modules: { ...s.data.modules, [moduleId]: { ...s.data.modules[moduleId], ...patch } } }
        : null,
    })),
  resetDirty: () => set({ isDirty: false }),
}));

export const useKbStore = createSelectorHooks(useKbStoreBase);
// Usage: useKbStore.useData(), useKbStore.useIsDirty(), useKbStore.usePatchModule()
```

### 2.4 Data Fetching with React Query

React Query handles all async data — no manual `useEffect` + `useState` for fetching.

```typescript
// hooks/useKnowledgeBase.ts  (Docs mode — reads from /api/knowledge-base)
export function useKnowledgeBase() {
  return useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => fetch('/api/knowledge-base').then(r => r.json()),
    staleTime: 5 * 60 * 1000,   // 5 min cache
    refetchOnWindowFocus: false,
  });
}

// hooks/useGitHubKb.ts  (Editor mode — reads directly from GitHub API)
export function useGitHubKb() {
  const pat   = useGithubStore.usePat();
  const owner = useGithubStore.useOwner();
  const repo  = useGithubStore.useRepo();
  const filePath = useGithubStore.useFilePath();

  return useQuery({
    queryKey: ['github-kb', owner, repo, filePath],
    queryFn: () => fetchKnowledgeBase({ pat, owner, repo, filePath }),
    enabled: Boolean(pat && owner && repo),
    staleTime: Infinity,         // editor fetches once; mutations invalidate manually
  });
}

// Commit mutation
export function useCommitKb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ config, sha, content, message }: CommitArgs) =>
      saveKnowledgeBase(config, sha, content, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-kb'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
    },
  });
}
```

### 2.5 Forms with React Hook Form + Zod + shadcn/ui

All editor forms follow this exact pattern — no exceptions:

```typescript
// components/editor/FAQEntryForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { faqEntrySchema, type FAQEntryInput } from '@/lib/schema';

export function FAQEntryForm({ defaultValues, onSubmit }: FAQEntryFormProps) {
  const form = useForm<FAQEntryInput>({
    resolver: zodResolver(faqEntrySchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="question" render={({ field }) => (
          <FormItem>
            <FormLabel>Soru</FormLabel>
            <FormControl><Textarea {...field} /></FormControl>
            <FormMessage />      {/* Zod error rendered here automatically */}
          </FormItem>
        )} />
        {/* ... other fields */}
      </form>
    </Form>
  );
}
```

Zod schema drives both TypeScript types AND runtime validation. Define once in `lib/schema.ts`:

```typescript
export const faqEntrySchema = z.object({
  question: z.string().min(10, 'En az 10 karakter'),
  answer:   z.string().min(20).max(600),
  tags:     z.array(z.string()).min(1, 'En az 1 etiket'),
  mode:     z.enum(['faq', 'guide', 'both']),
  status:   z.enum(['draft', 'needs_review', 'published']),
});
export type FAQEntryInput = z.infer<typeof faqEntrySchema>;
```

### 2.6 Ramda for Functional Utilities

Use Ramda (never `_.` lodash or manual loops) for all data transformations in `lib/`:

```typescript
import * as R from 'ramda';

// Tag normalization pipeline
const turkishMap: Record<string, string> = { ğ:'g', ü:'u', ş:'s', ı:'i', ö:'o', ç:'c', Ğ:'G', Ü:'U', Ş:'S', İ:'I', Ö:'O', Ç:'C' };

export const normalizeTag: (s: string) => string = R.pipe(
  R.toLower,
  (s) => s.replace(/[ğüşıöçĞÜŞİÖÇ]/g, (c) => turkishMap[c] ?? c),
  (s) => s.replace(/\s+/g, '_'),
  (s) => s.replace(/[^a-z0-9_]/g, ''),
  R.trim,
);

export const normalizeTags = R.map(normalizeTag);

// Find next available FAQ ID
export const nextFaqId = (prefix: string, existing: FAQEntry[]): string => {
  const ids   = R.map(R.prop('id'), existing);
  const nums  = R.map(R.pipe(R.split('_'), R.last, Number), ids);
  const maxN  = R.isEmpty(nums) ? 0 : R.reduce(R.max, 0, nums as number[]);
  return `${prefix}_${String((maxN as number) + 1).padStart(3, '0')}`;
};

// Deep diff for CommitModal (returns human-readable change list)
export const kbChangeSummary = (before: KnowledgeBase, after: KnowledgeBase): string[] => {
  // Use R.difference, R.symmetricDifference on flattened key paths
  // ...implementation
};
```

**Ramda rules:**
- Use `R.pipe` / `R.compose` for multi-step transformations — no chained `.then()` for sync transforms
- Use `R.map`, `R.filter`, `R.reduce` — no `Array.prototype.map` in `lib/` files
- Use `R.assocPath`, `R.dissocPath` for immutable nested updates in store
- Use `R.mergeDeepRight` for merging partial KB patches

### 2.7 Icons with @tabler/icons-react

Use Tabler icons exclusively. No emojis as icons in UI components.

```typescript
import {
  IconBrandGithub,
  IconSettings,
  IconBook2,
  IconPencil,
  IconTrash,
  IconPlus,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconTag,
  IconChevronRight,
  IconLoader2,         // spinning loader
} from '@tabler/icons-react';

// Usage — always set size and strokeWidth:
<IconAlertTriangle size={16} strokeWidth={1.5} className="text-amber-600" />
```

### 2.8 @base-ui/react for Headless Primitives

Use `@base-ui/react` for components that shadcn/ui doesn't cover well:

```typescript
// TagInput component — uses @base-ui/react Composite for keyboard nav
import { Composite, CompositeItem } from '@base-ui/react/composite';

// Collapsible sidebar sections
import { Collapsible } from '@base-ui/react/collapsible';

// Custom tooltips (limit exceeded warnings)
import { Tooltip } from '@base-ui/react/tooltip';
```

**Rule:** Use shadcn/ui first. If the required primitive isn't in shadcn, use `@base-ui/react`. Never install Radix UI packages directly (shadcn/ui and @base-ui/react already wrap them).

---

---

## 3. Data Model

The app reads and writes a single JSON file: `knowledge_base.json`.

### 3.1 Top-level structure

```typescript
interface KnowledgeBase {
  _meta: Meta;
  platform: Platform;
  global_rules: GlobalRules;
  modules: Record<string, Module>;
  technical: Technical;
  security_compliance: SecurityCompliance;
  pricing: Pricing;
  support: Support;
  agent_behavior: AgentBehavior;
}
```

### 3.2 Meta

```typescript
interface Meta {
  schema_version: string;       // e.g. "1.2"
  description: string;
  owner: string;
  last_updated: string;         // ISO date, auto-set on save
  last_updated_by: string;      // GitHub username of committer
  changelog: ChangelogEntry[];  // auto-appended on each save
}

interface ChangelogEntry {
  version: string;
  date: string;
  author: string;
  summary: string;              // user-entered commit message
}
```

### 3.3 GlobalRules

```typescript
interface GlobalRules {
  anonymity: {
    filtering_limit: LimitRule;
    reporting_limit: LimitRule;
    anonymity_modes: Record<string, AnonymityMode>;
  };
  reporting: {
    company_schema: CompanySchema;
    report_formats: string[];
    scheduled_reports: ScheduledReports;
    benchmark: Benchmark;
  };
  group_exclusion: GroupExclusion;
}

interface LimitRule {
  value: number;               // integer
  unit: string;                // "kişi"
  description: string;
  error_message: string;       // shown in app guide when limit hit
}
```

### 3.4 Module

```typescript
interface Module {
  id: string;
  display_name: string;
  description: string;
  respondents: string[];
  survey_config?: SurveyConfig;
  templates: Template[];
  anonymity?: AnonymityConfig;
  group_exclusion?: GroupExclusionConfig;
  faq: FAQEntry[];
  guide_steps: GuideStep[];
}

interface FAQEntry {
  id: string;                  // format: {module_prefix}_{3-digit-number}
  question: string;
  answer: string;
  tags: string[];              // lowercase, underscores, no Turkish chars
  mode: 'faq' | 'guide' | 'both';
  related_ids?: string[];
  status: 'published' | 'draft' | 'needs_review';
  last_updated: string;
}

interface GuideStep {
  id: string;                  // format: {module_prefix}_guide_{3-digit-number}
  trigger: string;             // developer event name e.g. "user_applies_filter"
  context: string;             // human-readable description
  message: string;             // shown to user in app
  tips?: string[];
  warnings?: string[];
  next_action?: string;
  status: 'published' | 'draft';
}

interface Template {
  id: string;
  name: string;
  respondent: string;
  question_count: number;
  dimensions: string[];
  customizable: boolean;
  description?: string;
}
```

### 3.5 AgentBehavior

```typescript
interface AgentBehavior {
  fallback_message: string;
  tone: string;
  max_answer_length_sentences: number;
  escalation_triggers: string[];
  escalation_message: string;
}
```

---

## 4. Application Structure

```
/app
  /                            → redirect to /docs
  /docs                        → Documentation viewer (public, read-only)
    /docs/[module]/page.tsx    → Module detail page
    /docs/global-rules/page.tsx
  /editor                      → Knowledge base editor (PAT required)
    /editor/global-rules/page.tsx
    /editor/modules/[id]/page.tsx
    /editor/agent-behavior/page.tsx
    /editor/settings/page.tsx
  /api
    /api/knowledge-base/route.ts         → GET: full JSON (agent)
    /api/knowledge-base/[module]/route.ts → GET: single module

/stores
  githubStore.ts     → Zustand: PAT, owner, repo, sha, connectionStatus
  kbStore.ts         → Zustand: KnowledgeBase draft, isDirty, patch helpers
  uiStore.ts         → Zustand: activeModuleId, activeTab, commitModalOpen

/components
  /editor
    FAQEntryForm.tsx       → React Hook Form + Zod + shadcn/ui <Form>
    GuideStepForm.tsx
    TemplateForm.tsx
    LimitRuleForm.tsx
    TagInput.tsx           → @base-ui/react Composite + shadcn Badge chips
    StatusBadge.tsx        → shadcn Badge with Tabler icon
    CommitModal.tsx        → shadcn Dialog + react-diff-viewer-continued
    ModuleTabEditor.tsx    → shadcn Tabs (Overview/Templates/FAQ/Guide)
  /docs
    ModuleCard.tsx         → shadcn Card + Tabler icon
    FAQAccordion.tsx       → shadcn Accordion
    RuleDisplay.tsx        → limit value card with warning state
    VersionBadge.tsx       → shadcn Badge
  /shared
    Sidebar.tsx            → @base-ui/react Collapsible sections
    AppHeader.tsx          → shadcn NavigationMenu + Tabler icons
    EmptyState.tsx         → Tabler icon + shadcn Button CTA
    LoadingSpinner.tsx     → IconLoader2 animated

/lib
  github.ts          → GitHub REST API: fetchKnowledgeBase, saveKnowledgeBase
  schema.ts          → ALL Zod schemas + inferred TypeScript types
  kb-utils.ts        → Ramda-based: normalizeTag, nextFaqId, kbChangeSummary
  constants.ts       → MODULE_PREFIXES, DEFAULT_VALUES, RESPONDENT_OPTIONS

/hooks
  useKnowledgeBase.ts   → React Query: useQuery from /api/knowledge-base (Docs)
  useGitHubKb.ts        → React Query: useQuery + useMutation for GitHub API (Editor)
  useCommitKb.ts        → useMutation wrapper: save → invalidate queries

/providers
  QueryProvider.tsx     → <QueryClientProvider> + <ReactQueryDevtools>
```

---

## 5. Feature Specifications

### 5.1 Settings Page (`/editor/settings`)

The user configures GitHub connection here. Store everything in `localStorage`.

**Fields:**
- GitHub Personal Access Token (PAT) — text input, masked, `repo` scope required
- Repository owner (e.g. `team`)
- Repository name (e.g. `moodivation-kb`)
- Branch (default: `main`)
- File path within repo (default: `knowledge_base.json`)

**Behavior:**
- "Test Connection" button → calls `GET /repos/{owner}/{repo}/contents/{path}` with the PAT. Shows success/error.
- On success, stores all values in localStorage and redirects to `/editor`
- If PAT not configured, all editor routes redirect to `/editor/settings`

### 5.2 Knowledge Base Loading

**Editor mode** — loads directly from GitHub using React Query. SHA is stored in `githubStore`.

```typescript
// hooks/useGitHubKb.ts
export function useGitHubKb() {
  const { pat, owner, repo, filePath } = useGithubStore.useGithubStore();

  return useQuery({
    queryKey: ['github-kb', owner, repo, filePath],
    queryFn: async () => {
      const result = await fetchKnowledgeBase({ pat, owner, repo, filePath });
      useGithubStore.getState().setSha(result.sha);     // store SHA for commit
      useKbStore.getState().setData(result.content);    // seed Zustand KB store
      return result;
    },
    enabled: Boolean(pat && owner && repo),
    staleTime: Infinity,
    retry: 1,
  });
}
```

**Docs mode** — loads from `/api/knowledge-base` (server fetches from GitHub):

```typescript
// hooks/useKnowledgeBase.ts
export function useKnowledgeBase() {
  return useQuery({
    queryKey: ['knowledge-base'],
    queryFn: (): Promise<KnowledgeBase> =>
      fetch('/api/knowledge-base').then(r => {
        if (!r.ok) throw new Error('KB fetch failed');
        return r.json();
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
```

### 5.3 Saving / Committing

When the user saves, show a **CommitModal** with:
- A diff view (before/after) — show added/changed/removed fields highlighted
- A text input for commit message (pre-filled: `"Update [section]: [auto-summary]"`)
- "Commit to GitHub" button

On confirm, use the `useCommitKb` mutation hook:

```typescript
// hooks/useCommitKb.ts
export function useCommitKb() {
  const queryClient = useQueryClient();
  const { setSha } = useGithubStore.useGithubStore();

  return useMutation({
    mutationFn: async ({ commitMessage }: { commitMessage: string }) => {
      const config  = useGithubStore.getState();
      const content = useKbStore.getState().data!;
      const sha     = config.sha;

      // Ramda: build updated _meta immutably
      const newVersion = bumpPatchVersion(content._meta.schema_version);
      const updatedKb  = R.assocPath(
        ['_meta'],
        R.mergeRight(content._meta, {
          last_updated: new Date().toISOString(),
          schema_version: newVersion,
          changelog: R.prepend(
            { version: newVersion, date: new Date().toISOString().split('T')[0], author: 'editor', summary: commitMessage },
            content._meta.changelog
          ),
        }),
        content
      ) as KnowledgeBase;

      return saveKnowledgeBase({ pat: config.pat, owner: config.owner, repo: config.repo, filePath: config.filePath }, sha, updatedKb, commitMessage);
    },
    onSuccess: (_, __, newSha) => {
      setSha(newSha as string);
      useKbStore.getState().resetDirty();
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
    },
    onError: async (err: any) => {
      if (err?.status === 409) {
        // Conflict: re-fetch to get new SHA, then user retries
        await queryClient.invalidateQueries({ queryKey: ['github-kb'] });
      }
    },
  });
}
```

**Rule**: SHA always comes from `githubStore`. Never hardcode or pass SHA through component props.

### 5.4 Global Rules Editor (`/editor/global-rules`)

Each section is its own `<form>` managed by React Hook Form with Zod resolver. On submit, it calls `patchGlobalRules` on `kbStore`, then opens CommitModal.

**Section 1 — Anonymity Limits** (two `LimitRuleForm` side-by-side)

```typescript
// React Hook Form schema for LimitRule
const limitRuleSchema = z.object({
  value:         z.coerce.number().int().min(1, 'En az 1 olmalı'),
  unit:          z.string().default('kişi'),
  description:   z.string().min(10),
  error_message: z.string().min(10),
});
```

Show a live preview card below each form: "Şu an: **X kişi**". If value is 0 or field is empty, show a red `<Alert>` (shadcn) with `<IconAlertTriangle>`.

**Section 2 — Group Exclusion Rules**
- `exclusion_criteria`: `<TagInput>` component (see Section 6)
- `can_exclude_individuals`: shadcn `<Switch>`
- `exclusion_applies_to`: shadcn `<Checkbox>` group
- `note`: shadcn `<Textarea>`

**Section 3 — Reporting Config**
- `hierarchy_levels`: ordered list — each item has a shadcn `<Input>` + `<IconTrash>` button + drag handle `<IconGripVertical>`
- `demographic_fields`: `<TagInput>`
- `report_formats`: shadcn `<Checkbox>` group (PDF, Excel, CSV, Dashboard)
- `benchmark.available`: shadcn `<Switch>` → if true, animate-in a `<Input>` for `scope`

### 5.5 Module Editor (`/editor/modules/[id]`)

Tab layout with 4 tabs:

**Tab 1: Overview**
- `display_name`, `description` (textarea), `respondents` (tag-input)
- Survey config fields (if module has them): question count, dimensions list, pulse survey toggle

**Tab 2: Templates**
- Table of existing templates with Edit/Delete per row
- "Add Template" button → opens inline form:
  - `name`, `respondent` (dropdown: new_employee, manager, mentor, exiting_employee, all_employees), `question_count` (number), `dimensions` (tag-input), `customizable` (toggle), `description` (textarea)

**Tab 3: FAQ Entries**
- Filter bar: search by question text, filter by `mode`, filter by `status`
- List of FAQ cards. Each card shows: question (truncated), tags, mode badge, status badge, Edit button
- "Add FAQ Entry" button → inline form:
  - `question` (textarea)
  - `answer` (textarea, character count shown, warn if >4 sentences)
  - `tags` (tag-input, auto-normalizes: lowercase, spaces→underscores, removes Turkish special chars)
  - `mode` (segmented control: faq / guide / both)
  - `status` (select: draft / needs_review / published)
  - `related_ids` (multi-select from existing FAQ ids in the module)
  - ID is auto-generated: `{module_prefix}_{next_sequential_number}`

**Tab 4: Guide Steps**
- Similar list/form to FAQ
- Fields: `trigger` (text, placeholder: "user_applies_demographic_filter"), `context` (text), `message` (textarea), `tips` (repeating text inputs with add/remove), `warnings` (repeating text inputs), `next_action` (text), `status`
- Show a yellow banner: "Trigger values must be confirmed with the developer team before publishing"

### 5.6 Documentation Viewer (`/docs`)

Read-only, no authentication required. Fetches JSON from `/api/knowledge-base` (which in turn reads from GitHub — cache for 5 minutes).

**Home page (`/docs`):**
- Hero section: platform name, tagline, version badge, last updated date
- Module cards grid (one per module): icon, name, description, count of FAQ entries
- "Global Rules" card → links to `/docs/global-rules`
- "Agent Behavior" card

**Module page (`/docs/[module]`):**
- Module description + respondents list
- "Templates" section: table of templates
- "Anonymity & Privacy" section: shows configured limits with visual indicators
- "FAQ" section: accordion list, filterable by tags. Each entry shows question/answer/tags.
- "In-App Guide Steps" section: card list of guide steps, showing trigger and message

**Global Rules page (`/docs/global-rules`):**
- Large prominent cards for `filtering_limit` and `reporting_limit` with their values and error messages
- Group exclusion rules
- Reporting config

**Design requirements for Docs:**
- Clean, readable typography
- No "Edit" buttons or admin controls visible
- Print-friendly (used as onboarding material)
- Show "Last updated: [date] · Version [x.y.z]" in footer of every page
- TOC sidebar on desktop

### 5.7 Agent API (`/api/knowledge-base`)

```typescript
// app/api/knowledge-base/route.ts
export async function GET(request: Request) {
  // Read from GitHub (with 5-minute cache using Next.js fetch cache)
  const kb = await fetchKnowledgeBase(serverGitHubConfig);

  return Response.json(kb.content, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'  // agent can be on any domain
    }
  });
}
```

For the server-side GitHub config (used by the API route), read from **environment variables**:
- `GITHUB_PAT` — server-side PAT (read-only scope sufficient)
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_FILE_PATH` (default: `knowledge_base.json`)
- `GITHUB_BRANCH` (default: `main`)

The client-side PAT (editor) is different — it needs write access and lives in localStorage.

---

## 6. UI/UX Requirements

### Navigation structure
```
Top navigation bar:
  Left:  [Moodivation KB] logo/wordmark
  Center: [Docs] [Editor] tabs (show Editor only if PAT configured)
  Right:  [Version badge] [Last updated] [GitHub link icon]

Editor sidebar (left, collapsible):
  - Global Rules
  - Agent Behavior
  - ── MODULES ──
  - Onboarding
  - Exit Management
  - Engagement
  - Experience
  - Feedback
  - [+ Add Module]
  - ── SETTINGS ──
  - GitHub Settings
```

### Color system
Use shadcn/ui with these semantic tokens:
- Primary: blue (`#2E6DA4`)
- Danger / limit exceeded: red (`#9B1C1C`)
- Warning / needs review: amber (`#B45309`)
- Success / published: green (`#1E7D4F`)
- Background: neutral gray

### Empty states
Every list (FAQ, templates, guide steps) must have an empty state with:
- Illustration or icon
- "No [items] yet" heading
- "Add your first [item]" CTA button

### TagInput Component

Used everywhere tags are entered. Built with `@base-ui/react` Composite for keyboard nav.

```typescript
// components/editor/TagInput.tsx
// - User types a tag and presses Enter or comma → tag is added
// - On add: auto-runs normalizeTag (Ramda pipe) before inserting
// - Each tag renders as shadcn Badge + <IconX> remove button
// - @base-ui/react Composite handles arrow-key navigation between chips
// - Controlled: value: string[], onChange: (tags: string[]) => void
// - Integrates with React Hook Form via Controller
```

### Validation Rules

- All forms use `zodResolver` — no manual validation logic
- Inline `<FormMessage>` per field (shadcn pattern)
- FAQ answer: `z.string().max(600)` + warn (not block) via `watch()` if sentence count > 4
- Tags: `z.array(z.string().min(1))` + auto-sanitize via Ramda `normalizeTag` before inserting into form value
- ID uniqueness: auto-generate with `nextFaqId` (Ramda), never shown to user as an editable field

---

## 7. GitHub Repository Setup

The user should create a GitHub repo with this structure:
```
/knowledge_base.json        ← the KB file this app reads/writes
/README.md                  ← auto-generated, shows last update info
```

The app needs two GitHub PATs:
1. **Client PAT** (editor users) — `repo` scope (read + write contents)
2. **Server PAT** (API route) — `public_repo` or `contents:read` scope only

---

## 8. Environment Variables

```env
# .env.local (for API route — server side only)
GITHUB_PAT=ghp_xxxxxxxxxxxx
GITHUB_OWNER=team
GITHUB_REPO=moodivation-kb
GITHUB_FILE_PATH=knowledge_base.json
GITHUB_BRANCH=main

# Optional: protect the editor route
EDITOR_PASSWORD=optional_password_hash
```

---

## 9. Implementation Order

Build in this exact order to ensure each phase is testable:

### Phase 1: Foundation
1. `create-next-app` → install all packages from Section 2.1
2. Configure Tailwind + shadcn/ui (`npx shadcn@latest init`)
3. Create `providers/QueryProvider.tsx` → wrap `layout.tsx`
4. Create all Zod schemas in `lib/schema.ts` (TypeScript types inferred via `z.infer`)
5. Create `lib/kb-utils.ts` with Ramda: `normalizeTag`, `normalizeTags`, `nextFaqId`, `bumpPatchVersion`
6. Create all three Zustand stores in `stores/` + wrap with `createSelectorHooks`
7. Implement `lib/github.ts` (`fetchKnowledgeBase`, `saveKnowledgeBase`)
8. Create React Query hooks: `useKnowledgeBase`, `useGitHubKb`, `useCommitKb`
9. Build `/editor/settings` page — React Hook Form + `useGitHubKb` test connection
10. Create `/api/knowledge-base` GET endpoint

### Phase 2: Documentation Viewer
11. Build `/docs` home page (uses `useKnowledgeBase` query)
12. Build `/docs/[module]` — FAQAccordion uses shadcn Accordion
13. Build `/docs/global-rules` — RuleDisplay with limit value cards
14. Add TOC sidebar with `@base-ui/react Collapsible`

### Phase 3: Editor — Global Rules
15. Build `CommitModal` (shadcn Dialog + diff view + React Hook Form for commit message)
16. Build `LimitRuleForm` (React Hook Form + shadcn Form primitives)
17. Build `/editor/global-rules` — wire LimitRuleForm → kbStore.patchGlobalRules → CommitModal
18. Build `TagInput` component (`@base-ui/react Composite` + shadcn Badge)

### Phase 4: Editor — Modules
19. Build collapsible sidebar with module list (`@base-ui/react Collapsible`)
20. Build `FAQEntryForm` (React Hook Form + TagInput + Zod)
21. Build `GuideStepForm` (repeating tips/warnings fields using `useFieldArray`)
22. Build `TemplateForm`
23. Build `ModuleTabEditor` with shadcn Tabs
24. "Add Module" modal flow

### Phase 5: Polish
25. Loading skeletons (shadcn Skeleton) everywhere queries are pending
26. Error boundaries + error UI
27. Empty states with Tabler icons + shadcn Button
28. Print styles for `/docs`

---

## 10. Known Edge Cases to Handle

| Case | Handling |
|------|----------|
| GitHub API returns 409 Conflict | Re-fetch file, get new SHA, retry save once |
| PAT expired or invalid | Show banner in editor: "GitHub connection lost — check settings" |
| `filtering_limit` or `reporting_limit` is 0 or empty | Show red warning in editor and docs: "⚠️ Limit not configured — agent cannot enforce privacy rules" |
| User adds FAQ answer > 4 sentences | Yellow warning: "Long answers reduce chatbot quality. Consider splitting." |
| Module ID collision when adding new module | Auto-append `_2`, `_3` etc. |
| `knowledge_base.json` not found in repo | Show setup wizard explaining the user needs to commit the initial file |
| Tag with Turkish characters | Auto-convert: ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c, Ğ→G etc. |

---

## 11. Initial `knowledge_base.json`

The app should detect if the repo file doesn't exist and offer to commit an initial empty structure. The initial JSON follows the schema in Section 3 with all string fields set to `""`, arrays to `[]`, booleans to `false`, numbers to `0`.

---

## 12. What NOT to Build

- No user authentication system (PAT in localStorage is the auth)
- No backend database
- No real-time collaboration
- No mobile editor (docs viewer is responsive, editor is desktop-only)
- No email notifications
- No file upload (all content is text/structured data)

---

## 13. Acceptance Criteria

The build is complete when:

- [ ] Editor can load `knowledge_base.json` from a configured GitHub repo
- [ ] Editor can add/edit/delete FAQ entries and guide steps per module
- [ ] Editor can set `filtering_limit` and `reporting_limit` as numbers
- [ ] Saving commits to GitHub with correct SHA (no 409 errors)
- [ ] Version and changelog auto-increment on each save
- [ ] `/api/knowledge-base` returns valid JSON without requiring editor PAT
- [ ] `/docs` renders all modules, FAQ, and global rules in read-only view
- [ ] Tags are auto-sanitized (lowercase, underscores, no Turkish chars)
- [ ] Empty states shown for all empty lists
- [ ] Zod validation prevents invalid data from being saved

---

*Generated for Moodivation · February 2026*
