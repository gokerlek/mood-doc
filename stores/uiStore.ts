import { create } from 'zustand';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';

type Section = 'platform' | 'modules' | 'pages' | 'glossary' | 'rules' | 'faq' | 'agent';

interface UiState {
  activeSection: Section;
  activeItemId: string | null;
  setActiveSection: (section: Section) => void;
  setActiveItemId: (id: string | null) => void;
}

const useUiStoreBase = create<UiState>()((set) => ({
  activeSection: 'platform',
  activeItemId: null,
  setActiveSection: (activeSection) => set({ activeSection, activeItemId: null }),
  setActiveItemId: (activeItemId) => set({ activeItemId }),
}));

export const useUiStore = createSelectorHooks(useUiStoreBase);
