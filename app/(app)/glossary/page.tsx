'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconCheck, IconX, IconAlphabetLatin } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { PageHeader } from '@/components/shared/PageHeader';
import type { KbGlossaryTerm } from '@/lib/types';
import { emptyGlossaryTerm } from '@/lib/defaults';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function GlossaryPage() {
  const data = useKbStore.useData();
  const upsertGlossaryTerm = useKbStore.useUpsertGlossaryTerm();
  const deleteGlossaryTerm = useKbStore.useDeleteGlossaryTerm();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<KbGlossaryTerm>(() => emptyGlossaryTerm());
  const [pendingDelete, setPendingDelete] = useState<KbGlossaryTerm | null>(null);

  if (!data) return null;

  const add = () => {
    if (!draft.term || !draft.definition) return;
    upsertGlossaryTerm({ ...draft, id: `term_${Date.now()}` });
    setDraft(emptyGlossaryTerm());
    setAdding(false);
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
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
      />

      {adding && (
        <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">Yeni Terim</p>
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
        </div>
      )}

      {data.glossary.length === 0 && !adding ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <IconAlphabetLatin size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Henüz terim eklenmemiş.</p>
          <Button variant="link" onClick={() => setAdding(true)} className="mt-1 h-auto p-0 text-sm">
            İlk terimi ekle →
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.glossary.map(t => (
            <div
              key={t.id}
              className="bg-card border border-border border-l-4 border-l-primary/40 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 group"
            >
              <div className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{t.term}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{t.definition}</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => setPendingDelete(t)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`"${pendingDelete?.term}" silinsin mi?`}
        description="Bu terimi sildiğinizde geri alamazsınız."
        onConfirm={() => { if (pendingDelete) deleteGlossaryTerm(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
