'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useKbStore } from '@/stores/kbStore';
import type { KnowledgeBase } from '@/lib/types';

export function useLoadKb() {
  return useQuery<KnowledgeBase>({
    queryKey: ['kb'],
    queryFn: async () => {
      // If there are unsaved local changes, use localStorage data instead of fetching
      const state = useKbStore.getState();
      if (state.isDirty && state.data) {
        return state.data;
      }
      const res = await fetch('/api/knowledge-base', { cache: 'no-store' });
      if (!res.ok) throw new Error('Yüklenemedi');
      const raw: unknown = await res.json();
      const data = raw as KnowledgeBase;
      useKbStore.getState().setData(data);
      return data;
    },
    staleTime: Infinity,
    retry: 1,
  });
}

interface SaveResult {
  sha: string;
}

export function useSaveKb() {
  const queryClient = useQueryClient();
  return useMutation<SaveResult, Error, string>({
    mutationFn: async (message: string) => {
      const data = useKbStore.getState().data;
      if (!data) throw new Error('No KB data loaded');
      const updated: KnowledgeBase = {
        ...data,
        _meta: {
          ...data._meta,
          last_updated: new Date().toISOString(),
          changelog: [
            { date: new Date().toISOString().split('T')[0] ?? '', summary: message },
            ...data._meta.changelog.slice(0, 19),
          ],
        },
      };
      useKbStore.getState().setData(updated);
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updated, message }),
      });
      if (!res.ok) throw new Error('Kayıt başarısız');
      const raw: unknown = await res.json();
      return raw as SaveResult;
    },
    onSuccess: () => {
      useKbStore.getState().resetDirty();
      void queryClient.invalidateQueries({ queryKey: ['kb'] });
    },
  });
}
