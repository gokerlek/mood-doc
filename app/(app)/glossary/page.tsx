'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
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
  const [draft, setDraft] = useState<KbGlossaryTerm>(emptyGlossaryTerm);
  const [pendingDelete, setPendingDelete] = useState<KbGlossaryTerm | null>(null);

  if (!data) return null;
  const add = () => {
    if (!draft.term || !draft.definition) return;
    upsertGlossaryTerm({ ...draft, id: `term_${Date.now()}` });
    setDraft(emptyGlossaryTerm);
    setAdding(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Sözlük</h1>
          <p className="text-sm text-muted-foreground mt-0.5">eNPS, bağlılık skoru gibi terimlerin tanımları.</p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <IconPlus size={15} />Terim Ekle
          </Button>
        )}
      </div>

      {adding && (
        <div className="bg-secondary border border-border rounded-xl p-4 space-y-3">
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
            <Button size="sm" onClick={add}>
              <IconCheck size={13} />Ekle
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              <IconX size={13} />İptal
            </Button>
          </div>
        </div>
      )}

      {data.glossary.length === 0 && !adding
        ? <div className="text-center py-16 text-muted-foreground text-sm">Henüz terim eklenmemiş.</div>
        : (
          <div className="space-y-2">
            {data.glossary.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-start gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{t.term}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t.definition}</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => setPendingDelete(t)}
                  className="shrink-0"
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            ))}
          </div>
        )
      }

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
