'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconCheck, IconX, IconAlphabetLatin } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import type { KbGlossaryTerm } from '@/lib/types';
import { emptyGlossaryTerm } from '@/lib/defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function GlossaryPage() {
  const data = useKbStore.useData();
  const upsertGlossaryTerm = useKbStore.useUpsertGlossaryTerm();
  const deleteGlossaryTerm = useKbStore.useDeleteGlossaryTerm();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<KbGlossaryTerm>(() => emptyGlossaryTerm());
  const [pendingDelete, setPendingDelete] = useState<KbGlossaryTerm | null>(null);
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.glossary.filter(
    t => !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
  );

  const add = () => {
    if (!draft.term || !draft.definition) return;
    upsertGlossaryTerm({ ...draft, id: `term_${Date.now()}` });
    setDraft(emptyGlossaryTerm());
    setAdding(false);
  };

  return (
    <ListPageLayout
      icon={<IconAlphabetLatin size={22} className="text-primary" />}
      title="Sözlük"
      description={`${data.glossary.length} terim toplam`}
      action={
        !adding ? (
          <Button onClick={() => setAdding(true)}>
            <IconPlus size={15} />
            Terim Ekle
          </Button>
        ) : undefined
      }
      maxWidth="4xl"
    >
      <SearchBar placeholder="Terim veya tanım ara..." />

      {adding && (
        <Card className="p-5 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Yeni Terim</p>
          <Input
            placeholder="Terim (örn: eNPS)"
            value={draft.term}
            onChange={e => setDraft(d => ({ ...d, term: e.target.value }))}
          />
          <Textarea
            rows={2}
            placeholder="Tanım..."
            value={draft.definition}
            onChange={e => setDraft(d => ({ ...d, definition: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={!draft.term || !draft.definition}>
              <IconCheck size={13} />Ekle
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              <IconX size={13} />İptal
            </Button>
          </div>
        </Card>
      )}

      {data.glossary.length === 0 && !adding && (
        <EmptyState
          icon={<IconAlphabetLatin size={28} />}
          title="Henüz terim eklenmemiş."
          action={
            <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
              İlk terimi ekle →
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} className="group py-0 gap-0">
              <div className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{t.term}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t.definition}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(t)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-auto p-1.5"
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && data.glossary.length > 0 && (
        <NoResults message="Eşleşen terim bulunamadı." onClear={() => setSearch('')} />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`"${pendingDelete?.term}" silinsin mi?`}
        description="Bu terimi sildiğinizde geri alamazsınız."
        onConfirm={() => { if (pendingDelete) deleteGlossaryTerm(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </ListPageLayout>
  );
}
