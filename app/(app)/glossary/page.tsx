'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import type { KbGlossaryTerm } from '@/lib/types';

export default function GlossaryPage() {
  const data = useKbStore.useData();
  const upsertGlossaryTerm = useKbStore.useUpsertGlossaryTerm();
  const deleteGlossaryTerm = useKbStore.useDeleteGlossaryTerm();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<KbGlossaryTerm>({ id: '', term: '', definition: '' });
  const [pendingDelete, setPendingDelete] = useState<KbGlossaryTerm | null>(null);

  if (!data) return null;
  const add = () => {
    if (!draft.term || !draft.definition) return;
    upsertGlossaryTerm({ ...draft, id: `term_${Date.now()}` });
    setDraft({ id: '', term: '', definition: '' });
    setAdding(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">Sözlük</h1><p className="text-sm text-gray-500 mt-0.5">eNPS, bağlılık skoru gibi terimlerin tanımları.</p></div>
        {!adding && <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 bg-[#2E6DA4] hover:bg-[#255a8a] text-white text-sm font-medium px-4 py-2 rounded-lg"><IconPlus size={15}/>Terim Ekle</button>}
      </div>
      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium focus:outline-none" placeholder="Terim (örn: eNPS)" value={draft.term} onChange={e => setDraft(d => ({ ...d, term: e.target.value }))} />
          <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none" rows={2} placeholder="Tanım..." value={draft.definition} onChange={e => setDraft(d => ({ ...d, definition: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={add} className="flex items-center gap-1 text-sm bg-[#2E6DA4] text-white px-3 py-1.5 rounded-lg"><IconCheck size={13}/>Ekle</button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-1 text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"><IconX size={13}/>İptal</button>
          </div>
        </div>
      )}
      {data.glossary.length === 0 && !adding
        ? <div className="text-center py-16 text-gray-400 text-sm">Henüz terim eklenmemiş.</div>
        : (
          <div className="space-y-2">{data.glossary.map(t => (
            <div key={t.id} className="bg-white rounded-xl border px-5 py-4 flex items-start gap-4">
              <div className="flex-1"><p className="font-semibold text-gray-900">{t.term}</p><p className="text-sm text-gray-600 mt-0.5">{t.definition}</p></div>
              <button onClick={() => setPendingDelete(t)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"><IconTrash size={14}/></button>
            </div>
          ))}</div>
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
