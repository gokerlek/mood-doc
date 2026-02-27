import type { KbModule, KbFaq, KbGlossaryTerm } from './types';

export const emptyModule = (): KbModule => ({
  id: '', name: '', description: '', who_uses: '', key_features: [], nav_path: '',
});

export const emptyFaq = (): KbFaq => ({
  id: '', question: '', answer: '', tags: [],
});

export const emptyGlossaryTerm = (): KbGlossaryTerm => ({
  id: '', term: '', definition: '',
});
