'use client';
import { useState } from 'react';
import { IconPlus, IconX, IconCheck, IconTag } from '@tabler/icons-react';
import { useKbStore } from '@/stores/kbStore';

interface Props {
  moduleId?: string;
}

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
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>
              <IconX size={9} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          className="flex-1 rounded border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E6DA4]/40"
          placeholder="tag (Enter to add)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
          +
        </button>
      </div>
    </div>
  );
}

export function QuickAddFaq({ moduleId }: Props) {
  const upsertFaq = useKbStore.useUpsertFaq();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const reset = () => { setQuestion(''); setAnswer(''); setTags([]); setOpen(false); };

  const save = () => {
    if (!question.trim() || !answer.trim()) return;
    upsertFaq({
      id: `faq_${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      tags,
      module_id: moduleId,
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#2E6DA4] transition-colors mt-2"
      >
        <IconPlus size={11} />Add FAQ
      </button>
    );
  }

  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2.5">
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
      <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1"><IconTag size={10} />Tags</p>
        <TagInput tags={tags} onChange={setTags} />
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={save}
          disabled={!question.trim() || !answer.trim()}
          className="flex items-center gap-1 text-xs bg-[#2E6DA4] disabled:opacity-50 text-white px-3 py-1.5 rounded"
        >
          <IconCheck size={11} />Save
        </button>
        <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-500 px-3 py-1.5 rounded hover:bg-blue-100">
          <IconX size={11} />Cancel
        </button>
      </div>
    </div>
  );
}
