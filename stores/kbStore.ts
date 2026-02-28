// stores/kbStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import type {
  KnowledgeBase, KbFaq, KbRule, KbGlossaryTerm,
  KbComponent, TagCategory, KbTag, MapNodeData, MapEdgeData,
  PageData, PageSection,
} from '@/lib/types';
import { emptyKnowledgeBase } from '@/lib/defaults';

interface KbState {
  data: KnowledgeBase | null;
  isDirty: boolean;
  isSaving: boolean;

  // Core
  setData: (kb: KnowledgeBase) => void;
  setIsSaving: (v: boolean) => void;
  resetDirty: () => void;

  // Tag Categories
  upsertTagCategory: (cat: TagCategory) => void;
  deleteTagCategory: (id: string) => void;

  // Tags
  upsertTag: (tag: KbTag) => void;
  deleteTag: (id: string) => void;

  // Components
  upsertComponent: (comp: KbComponent) => void;
  deleteComponent: (id: string) => void;

  // Map Nodes
  upsertNode: (node: MapNodeData) => void;
  deleteNode: (id: string) => void;
  updatePageData: (nodeId: string, data: PageData) => void;
  upsertPageSection: (nodeId: string, section: PageSection) => void;
  deletePageSection: (nodeId: string, sectionId: string) => void;
  reorderPageSections: (nodeId: string, sections: PageSection[]) => void;

  // Map Edges
  upsertEdge: (edge: MapEdgeData) => void;
  deleteEdge: (id: string) => void;

  // FAQ
  upsertFaq: (faq: KbFaq) => void;
  deleteFaq: (id: string) => void;

  // Rules
  upsertRule: (rule: KbRule) => void;
  deleteRule: (id: string) => void;

  // Glossary
  upsertGlossaryTerm: (term: KbGlossaryTerm) => void;
  deleteGlossaryTerm: (id: string) => void;

  // Agent
  updateAgentBehavior: (patch: Partial<KnowledgeBase['agent_behavior']>) => void;
}

const useKbStoreBase = create<KbState>()(
  persist(
    (set) => ({
      data: null,
      isDirty: false,
      isSaving: false,

      setData: (data) => set({ data, isDirty: false }),
      setIsSaving: (isSaving) => set({ isSaving }),
      resetDirty: () => set({ isDirty: false }),

      upsertTagCategory: (cat) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.tag_categories.findIndex(c => c.id === cat.id);
          const tag_categories = exists >= 0
            ? s.data.tag_categories.map(c => c.id === cat.id ? cat : c)
            : [...s.data.tag_categories, cat];
          return { isDirty: true, data: { ...s.data, tag_categories } };
        }),

      deleteTagCategory: (id) =>
        set((s) => {
          if (!s.data) return s;
          return {
            isDirty: true,
            data: {
              ...s.data,
              tag_categories: s.data.tag_categories.filter(c => c.id !== id),
              tags: s.data.tags.filter(t => t.category_id !== id),
            },
          };
        }),

      upsertTag: (tag) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.tags.findIndex(t => t.id === tag.id);
          const tags = exists >= 0
            ? s.data.tags.map(t => t.id === tag.id ? tag : t)
            : [...s.data.tags, tag];
          return { isDirty: true, data: { ...s.data, tags } };
        }),

      deleteTag: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, tags: s.data.tags.filter(t => t.id !== id) } } : s),

      upsertComponent: (comp) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.components.findIndex(c => c.id === comp.id);
          const components = exists >= 0
            ? s.data.components.map(c => c.id === comp.id ? comp : c)
            : [...s.data.components, comp];
          return { isDirty: true, data: { ...s.data, components } };
        }),

      deleteComponent: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, components: s.data.components.filter(c => c.id !== id) } } : s),

      upsertNode: (node) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.map.nodes.findIndex(n => n.id === node.id);
          const nodes = exists >= 0
            ? s.data.map.nodes.map(n => n.id === node.id ? node : n)
            : [...s.data.map.nodes, node];
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      deleteNode: (id) =>
        set((s) => {
          if (!s.data) return s;
          return {
            isDirty: true,
            data: {
              ...s.data,
              map: {
                nodes: s.data.map.nodes.filter(n => n.id !== id),
                edges: s.data.map.edges.filter(e => e.source !== id && e.target !== id),
              },
            },
          };
        }),

      updatePageData: (nodeId, pageData) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n =>
            n.id === nodeId ? { ...n, page_data: pageData } : n
          );
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      upsertPageSection: (nodeId, section) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n => {
            if (n.id !== nodeId || !n.page_data) return n;
            const exists = n.page_data.sections.findIndex(sec => sec.id === section.id);
            const sections = exists >= 0
              ? n.page_data.sections.map(sec => sec.id === section.id ? section : sec)
              : [...n.page_data.sections, section];
            return { ...n, page_data: { ...n.page_data, sections } };
          });
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      deletePageSection: (nodeId, sectionId) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n => {
            if (n.id !== nodeId || !n.page_data) return n;
            return {
              ...n,
              page_data: {
                ...n.page_data,
                sections: n.page_data.sections.filter(sec => sec.id !== sectionId),
              },
            };
          });
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      reorderPageSections: (nodeId, sections) =>
        set((s) => {
          if (!s.data) return s;
          const nodes = s.data.map.nodes.map(n =>
            n.id === nodeId && n.page_data
              ? { ...n, page_data: { ...n.page_data, sections } }
              : n
          );
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, nodes } } };
        }),

      upsertEdge: (edge) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.map.edges.findIndex(e => e.id === edge.id);
          const edges = exists >= 0
            ? s.data.map.edges.map(e => e.id === edge.id ? edge : e)
            : [...s.data.map.edges, edge];
          return { isDirty: true, data: { ...s.data, map: { ...s.data.map, edges } } };
        }),

      deleteEdge: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, map: { ...s.data.map, edges: s.data.map.edges.filter(e => e.id !== id) } } } : s),

      upsertFaq: (faq) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.faq.findIndex(f => f.id === faq.id);
          const faqs = exists >= 0
            ? s.data.faq.map(f => f.id === faq.id ? faq : f)
            : [...s.data.faq, faq];
          return { isDirty: true, data: { ...s.data, faq: faqs } };
        }),

      deleteFaq: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, faq: s.data.faq.filter(f => f.id !== id) } } : s),

      upsertRule: (rule) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.rules.findIndex(r => r.id === rule.id);
          const rules = exists >= 0
            ? s.data.rules.map(r => r.id === rule.id ? rule : r)
            : [...s.data.rules, rule];
          return { isDirty: true, data: { ...s.data, rules } };
        }),

      deleteRule: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, rules: s.data.rules.filter(r => r.id !== id) } } : s),

      upsertGlossaryTerm: (term) =>
        set((s) => {
          if (!s.data) return s;
          const exists = s.data.glossary.findIndex(g => g.id === term.id);
          const glossary = exists >= 0
            ? s.data.glossary.map(g => g.id === term.id ? term : g)
            : [...s.data.glossary, term];
          return { isDirty: true, data: { ...s.data, glossary } };
        }),

      deleteGlossaryTerm: (id) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, glossary: s.data.glossary.filter(g => g.id !== id) } } : s),

      updateAgentBehavior: (patch) =>
        set((s) => s.data ? { isDirty: true, data: { ...s.data, agent_behavior: { ...s.data.agent_behavior, ...patch } } } : s),
    }),
    {
      name: 'moodivation-kb-v3',
      partialize: (state) => ({ data: state.data, isDirty: state.isDirty }),
    }
  )
);

export const useKbStore = createSelectorHooks(useKbStoreBase);
