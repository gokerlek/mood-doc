import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import type { KnowledgeBase, KbModule, KbPage, KbFaq, KbGlossaryTerm } from '@/lib/types';
// KbFaq used in upsertFaq/deleteFaq actions

interface KbState {
  data: KnowledgeBase | null;
  isDirty: boolean;
  isSaving: boolean;
  setData: (kb: KnowledgeBase) => void;
  setIsSaving: (v: boolean) => void;
  resetDirty: () => void;
  updatePlatform: (patch: Partial<KnowledgeBase['platform']>) => void;
  upsertModule: (module: KbModule) => void;
  deleteModule: (id: string) => void;
  upsertPage: (page: KbPage) => void;
  deletePage: (id: string) => void;
  updatePagePosition: (id: string, x: number, y: number) => void;
  addPageConnection: (fromId: string, toId: string) => void;
  removePageConnection: (fromId: string, toId: string) => void;
  upsertGlossaryTerm: (term: KbGlossaryTerm) => void;
  deleteGlossaryTerm: (id: string) => void;
  updateGlobalRules: (patch: Partial<KnowledgeBase['global_rules']>) => void;
  upsertFaq: (faq: KbFaq) => void;
  deleteFaq: (id: string) => void;
  updateAgentBehavior: (patch: Partial<KnowledgeBase['agent_behavior']>) => void;
}

const useKbStoreBase = create<KbState>()(
  persist(
    (set) => ({
      data: null,
      isDirty: false,
      isSaving: false,
      // setData only used for fresh load from GitHub — clears dirty flag
      setData: (data) => set({ data, isDirty: false }),
      setIsSaving: (isSaving) => set({ isSaving }),
      resetDirty: () => set({ isDirty: false }),
      updatePlatform: (patch) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, platform: { ...s.data.platform, ...patch } } } : s),
      upsertModule: (module) =>
        set((s) => {
          if (!s.data) return s;
          const idx = s.data.modules.findIndex(m => m.id === module.id);
          const modules = idx >= 0 ? s.data.modules.map(m => m.id === module.id ? module : m) : [...s.data.modules, module];
          return { isDirty: true, data: { ...s.data, modules } };
        }),
      deleteModule: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, modules: s.data.modules.filter(m => m.id !== id) } } : s),
      upsertPage: (page) =>
        set((s) => {
          if (!s.data) return s;
          const idx = s.data.pages.findIndex(p => p.id === page.id);
          const pages = idx >= 0 ? s.data.pages.map(p => p.id === page.id ? page : p) : [...s.data.pages, page];
          return { isDirty: true, data: { ...s.data, pages } };
        }),
      deletePage: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, pages: s.data.pages.filter(p => p.id !== id) } } : s),
      updatePagePosition: (id, x, y) =>
        set((s) => {
          if (!s.data) return s;
          const pages = s.data.pages.map(p => p.id === id ? { ...p, x, y } : p);
          return { isDirty: true, data: { ...s.data, pages } };
        }),
      addPageConnection: (fromId, toId) =>
        set((s) => {
          if (!s.data) return s;
          const pages = s.data.pages.map(p => {
            if (p.id !== fromId) return p;
            const conns = p.connections ?? [];
            if (conns.includes(toId)) return p;
            return { ...p, connections: [...conns, toId] };
          });
          return { isDirty: true, data: { ...s.data, pages } };
        }),
      removePageConnection: (fromId, toId) =>
        set((s) => {
          if (!s.data) return s;
          const pages = s.data.pages.map(p =>
            p.id === fromId
              ? { ...p, connections: (p.connections ?? []).filter(c => c !== toId) }
              : p
          );
          return { isDirty: true, data: { ...s.data, pages } };
        }),
      upsertGlossaryTerm: (term) =>
        set((s) => {
          if (!s.data) return s;
          const idx = s.data.glossary.findIndex(g => g.id === term.id);
          const glossary = idx >= 0 ? s.data.glossary.map(g => g.id === term.id ? term : g) : [...s.data.glossary, term];
          return { isDirty: true, data: { ...s.data, glossary } };
        }),
      deleteGlossaryTerm: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, glossary: s.data.glossary.filter(g => g.id !== id) } } : s),
      updateGlobalRules: (patch) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, global_rules: { ...s.data.global_rules, ...patch } } } : s),
      upsertFaq: (faq) =>
        set((s) => {
          if (!s.data) return s;
          const idx = s.data.faq.findIndex(f => f.id === faq.id);
          const faqs = idx >= 0 ? s.data.faq.map(f => f.id === faq.id ? faq : f) : [...s.data.faq, faq];
          return { isDirty: true, data: { ...s.data, faq: faqs } };
        }),
      deleteFaq: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, faq: s.data.faq.filter(f => f.id !== id) } } : s),
      updateAgentBehavior: (patch) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, agent_behavior: { ...s.data.agent_behavior, ...patch } } } : s),
    }),
    {
      name: 'moodivation-kb-v2',
      // Persist only data and isDirty — isSaving is transient
      partialize: (state) => ({ data: state.data, isDirty: state.isDirty }),
    }
  )
);

export const useKbStore = createSelectorHooks(useKbStoreBase);
