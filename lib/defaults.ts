import type { KbModule, KbPage, KbFaq, KbGlossaryTerm } from './types';

export const emptyModule = (): KbModule => ({
  id: '', name: '', description: '', who_uses: '', key_features: [], nav_path: '',
});

export const emptyPage = (): KbPage => ({
  id: '', name: '', module_id: '', path: '', description: '',
  how_to_access: '', key_actions: [], tips: [],
});

export const emptyFaq = (): KbFaq => ({
  id: '', question: '', answer: '', tags: [],
});

export const emptyGlossaryTerm = (): KbGlossaryTerm => ({
  id: '', term: '', definition: '',
});
