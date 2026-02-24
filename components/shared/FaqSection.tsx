'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { IconPlus, IconTrash, IconPencil, IconCheck, IconX, IconTag } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import type { KbFaq } from '@/lib/types';

// ── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 bg-blue-50 text-[#2E6DA4] text-xs px-2 py-0.5 rounded-full">
            #{t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}><IconX size={9} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          className="flex-1 rounded border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E6DA4]/40"
          placeholder="tag (press Enter)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600">+</button>
      </div>
    </div>
  );
}

// ── Inline FAQ form ───────────────────────────────────────────────────────────

interface InlineFormProps {
  initial?: KbFaq;
  moduleId?: string;
  pageId?: string;
  onSave: (f: KbFaq) => void;
  onCancel: () => void;
}

function InlineForm({ initial, moduleId, pageId, onSave, onCancel }: InlineFormProps) {
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const canSave = question.trim() && answer.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `faq_${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      tags,
      module_id: moduleId,
      page_id: pageId,
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2.5">
      <input
        autoFocus
        className="w-full rounded border bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2E6DA4]/40"
        placeholder="Question..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <textarea
        className="w-full rounded border bg-white px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#2E6DA4]/40"
        rows={2}
        placeholder="Answer..."
        value={answer}
        onChange={e => setAnswer(e.target.value)}
      />
      <div>
        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconTag size={10} />Tags</p>
        <TagInput tags={tags} onChange={setTags} />
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex items-center gap-1 text-xs bg-[#2E6DA4] disabled:opacity-50 text-white px-3 py-1.5 rounded"
        >
          <IconCheck size={11} />Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5 rounded hover:bg-blue-100"
        >
          <IconX size={11} />Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  moduleId?: string;
  pageId?: string;
  /** If true, the module/page hasn't been saved yet so FAQs can't be added */
  isNew?: boolean;
}

export function FaqSection({ moduleId, pageId, isNew }: Props) {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);

  const faqs = (data?.faq ?? []).filter(f =>
    pageId ? f.page_id === pageId : (f.module_id === moduleId && !f.page_id)
  );

  const handleSave = (f: KbFaq) => {
    upsertFaq(f);
    setAdding(false);
    setEditingId(null);
  };

  return (
    <div className="border-t pt-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          FAQ
          {faqs.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {faqs.length}
            </span>
          )}
        </h3>
        {!isNew && !adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setEditingId(null); }}
            className="flex items-center gap-1 text-xs text-[#2E6DA4] hover:underline"
          >
            <IconPlus size={12} />Add question
          </button>
        )}
      </div>

      {isNew && (
        <p className="text-xs text-gray-400 italic">Save first to add FAQ questions.</p>
      )}

      {/* Add form */}
      {adding && (
        <InlineForm
          moduleId={moduleId}
          pageId={pageId}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* FAQ list */}
      {faqs.length === 0 && !adding && !isNew && (
        <p className="text-xs text-gray-400">No questions yet.</p>
      )}

      <div className="space-y-2">
        {faqs.map(faq => (
          editingId === faq.id ? (
            <InlineForm
              key={faq.id}
              initial={faq}
              moduleId={moduleId}
              pageId={pageId}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={faq.id} className="group bg-gray-50 rounded-lg px-3 py-2.5 space-y-1">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-sm font-medium text-gray-800">{faq.question}</p>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => { setEditingId(faq.id); setAdding(false); }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  >
                    <IconPencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(faq)}
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
              {faq.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {faq.tags.map(t => (
                    <span key={t} className="text-xs bg-white border text-gray-400 px-1.5 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this FAQ?"
        description={pendingDelete?.question}
        onConfirm={() => { if (pendingDelete) deleteFaq(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
