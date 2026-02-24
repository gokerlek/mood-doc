'use client';
import { useState, useMemo } from 'react';
import { useKbStore } from '@/stores/kbStore';
import {
  IconPlus, IconTrash, IconPencil, IconX, IconCheck, IconChevronDown, IconChevronRight,
  IconTag,
} from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import type { KbFaq, KbModule, KbPage } from '@/lib/types';

// ── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 bg-blue-50 text-[#2E6DA4] text-xs px-2 py-0.5 rounded-full">
            #{t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500">
              <IconX size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
          placeholder="Add tag (press Enter)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button
          onClick={add}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── FAQ Form ─────────────────────────────────────────────────────────────────

interface FaqFormProps {
  initial: KbFaq;
  modules: KbModule[];
  pages: KbPage[];
  onSave: (f: KbFaq) => void;
  onCancel: () => void;
}

function FaqForm({ initial, modules, pages, onSave, onCancel }: FaqFormProps) {
  const [f, setF] = useState<KbFaq>(initial);
  const filteredPages = f.module_id ? pages.filter(p => p.module_id === f.module_id) : pages;
  const canSave = f.question.trim() && f.answer.trim();

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Question</label>
        <input
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
          placeholder="What is...?"
          value={f.question}
          onChange={e => setF(p => ({ ...p, question: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Answer</label>
        <textarea
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
          rows={3}
          value={f.answer}
          onChange={e => setF(p => ({ ...p, answer: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Module <span className="text-gray-400 font-normal">(optional)</span></label>
          <select
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
            value={f.module_id ?? ''}
            onChange={e => setF(p => ({ ...p, module_id: e.target.value || undefined, page_id: undefined }))}
          >
            <option value="">— General —</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Page <span className="text-gray-400 font-normal">(optional)</span></label>
          <select
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
            value={f.page_id ?? ''}
            onChange={e => setF(p => ({ ...p, page_id: e.target.value || undefined }))}
            disabled={!f.module_id}
          >
            <option value="">— Module level —</option>
            {filteredPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
          <IconTag size={13} />Tags
        </label>
        <TagInput tags={f.tags} onChange={tags => setF(p => ({ ...p, tags }))} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 border rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={() => { if (canSave) onSave(f); }}
          disabled={!canSave}
          className="flex-1 bg-[#2E6DA4] hover:bg-[#255a8a] disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          <IconCheck size={14} className="inline mr-1" />Save
        </button>
      </div>
    </div>
  );
}

// ── FAQ Row ───────────────────────────────────────────────────────────────────

interface FaqRowProps {
  faq: KbFaq;
  modules: KbModule[];
  pages: KbPage[];
  onEdit: () => void;
  onDelete: () => void;
  editingId: string | null;
  onSave: (f: KbFaq) => void;
  onCancelEdit: () => void;
}

function FaqRow({ faq, modules, pages, onEdit, onDelete, editingId, onSave, onCancelEdit }: FaqRowProps) {
  if (editingId === faq.id) {
    return <FaqForm initial={faq} modules={modules} pages={pages} onSave={onSave} onCancel={onCancelEdit} />;
  }
  return (
    <div className="bg-white rounded-xl border px-5 py-4 group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{faq.answer}</p>
          {faq.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {faq.tags.map(t => (
                <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            <IconPencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
            <IconTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full text-left"
      >
        {open ? <IconChevronDown size={14} className="text-gray-400" /> : <IconChevronRight size={14} className="text-gray-400" />}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{count}</span>
      </button>
      {open && <div className="space-y-2 pl-4">{children}</div>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const emptyFaq = (): KbFaq => ({ id: '', question: '', answer: '', tags: [] });

export default function FaqPage() {
  const data = useKbStore.useData();
  const upsertFaq = useKbStore.useUpsertFaq();
  const deleteFaq = useKbStore.useDeleteFaq();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KbFaq | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.faq.forEach(f => f.tags.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [data]);

  if (!data) return null;

  const filtered = activeTag
    ? data.faq.filter(f => f.tags.includes(activeTag))
    : data.faq;

  const general = filtered.filter(f => !f.module_id);
  const moduleGroups = data.modules.map(mod => {
    const modFaqs = filtered.filter(f => f.module_id === mod.id && !f.page_id);
    const pageGroups = data.pages
      .filter(p => p.module_id === mod.id)
      .map(page => ({
        page,
        faqs: filtered.filter(f => f.page_id === page.id),
      }))
      .filter(g => g.faqs.length > 0);
    return { mod, modFaqs, pageGroups };
  }).filter(g => g.modFaqs.length > 0 || g.pageGroups.length > 0);

  const handleSave = (f: KbFaq) => {
    const id = f.id || `faq_${Date.now()}`;
    upsertFaq({ ...f, id });
    setAdding(false);
    setEditingId(null);
  };

  const rowProps = (faq: KbFaq) => ({
    faq,
    modules: data.modules,
    pages: data.pages,
    onEdit: () => setEditingId(faq.id),
    onDelete: () => setPendingDelete(faq),
    editingId,
    onSave: handleSave,
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.faq.length} question{data.faq.length !== 1 ? 's' : ''} across all modules and pages.
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null); }}
            className="flex items-center gap-1.5 bg-[#2E6DA4] hover:bg-[#255a8a] text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <IconPlus size={15} />Add FAQ
          </button>
        )}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${!activeTag ? 'bg-[#2E6DA4] text-white border-[#2E6DA4]' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeTag === tag ? 'bg-[#2E6DA4] text-white border-[#2E6DA4]' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <FaqForm
          initial={emptyFaq()}
          modules={data.modules}
          pages={data.pages}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Empty state */}
      {data.faq.length === 0 && !adding && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No FAQs yet.{' '}
          <button onClick={() => setAdding(true)} className="text-[#2E6DA4] hover:underline">
            Add first question →
          </button>
        </div>
      )}

      {/* Categorized list */}
      {filtered.length > 0 && (
        <div className="space-y-6">
          {/* General */}
          {general.length > 0 && (
            <Section title="General" count={general.length}>
              {general.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
            </Section>
          )}

          {/* Module groups */}
          {moduleGroups.map(({ mod, modFaqs, pageGroups }) => (
            <Section key={mod.id} title={mod.name} count={modFaqs.length + pageGroups.reduce((a, g) => a + g.faqs.length, 0)}>
              {/* Module-level FAQs */}
              {modFaqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
              {/* Page-level FAQs */}
              {pageGroups.map(({ page, faqs }) => (
                <div key={page.id} className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 pl-1 flex items-center gap-1">
                    <span className="font-mono">{page.path}</span>
                    <span className="font-sans">— {page.name}</span>
                  </p>
                  {faqs.map(faq => <FaqRow key={faq.id} {...rowProps(faq)} />)}
                </div>
              ))}
            </Section>
          ))}
        </div>
      )}

      {filtered.length === 0 && data.faq.length > 0 && (
        <p className="text-center py-8 text-sm text-gray-400">
          No FAQs with tag <span className="font-mono">#{activeTag}</span>.{' '}
          <button onClick={() => setActiveTag(null)} className="text-[#2E6DA4] hover:underline">Clear filter</button>
        </p>
      )}

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
