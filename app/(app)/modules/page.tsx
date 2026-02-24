'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { useUiStore } from '@/stores/uiStore';
import { IconPlus, IconPencil, IconTrash, IconChevronLeft } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { FaqSection } from '@/components/shared/FaqSection';
import type { KbModule } from '@/lib/types';

const empty = (): KbModule => ({
  id: '', name: '', description: '', who_uses: '', key_features: [], nav_path: '',
});

function ModuleForm({
  initial, onSave, onCancel,
}: {
  initial: KbModule;
  onSave: (m: KbModule) => void;
  onCancel: () => void;
}) {
  const [m, setM] = useState<KbModule>(initial);
  const isNew = !initial.id;

  const field = (key: keyof KbModule, label: string, hint?: string, mono?: boolean) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <input
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30 ${mono ? 'font-mono' : ''}`}
        value={m[key] as string}
        onChange={e => setM(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <button onClick={onCancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <IconChevronLeft size={16} />Back
      </button>
      <h1 className="text-xl font-bold text-gray-900">{isNew ? 'New Module' : m.name}</h1>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        {isNew && field('id', 'Module ID', 'Lowercase, underscore. e.g. engagement', true)}
        {field('name', 'Module Name')}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
            rows={3}
            value={m.description}
            onChange={e => setM(p => ({ ...p, description: e.target.value }))}
            placeholder="What does this module do?"
          />
        </div>
        {field('who_uses', 'Who Uses It?', 'e.g. HR managers and department managers')}
        {field('nav_path', 'Nav Path', 'e.g. /reports/engagement', true)}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Key Features</label>
          <p className="text-xs text-gray-400">One feature per line</p>
          <textarea
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30"
            rows={4}
            value={(m.key_features ?? []).join('\n')}
            onChange={e => setM(p => ({ ...p, key_features: e.target.value.split('\n') }))}
          />
        </div>

        {/* FAQ section — only for existing modules */}
        <FaqSection moduleId={initial.id || undefined} isNew={isNew} />

        <div className="flex gap-2 pt-2 border-t">
          <button onClick={onCancel} className="flex-1 border rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => { if (m.id && m.name) onSave(m); }}
            className="flex-1 bg-[#2E6DA4] hover:bg-[#255a8a] text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModulesPage() {
  const data = useKbStore.useData();
  const upsertModule = useKbStore.useUpsertModule();
  const deleteModule = useKbStore.useDeleteModule();
  const activeItemId = useUiStore.useActiveItemId();
  const setActiveItemId = useUiStore.useSetActiveItemId();
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<KbModule | null>(null);

  if (!data) return null;
  const editing = data.modules.find(m => m.id === activeItemId);
  const save = (mod: KbModule) => { upsertModule(mod); setActiveItemId(null); setAdding(false); };

  if (adding) return <ModuleForm initial={empty()} onSave={save} onCancel={() => setAdding(false)} />;
  if (editing) return <ModuleForm initial={editing} onSave={save} onCancel={() => setActiveItemId(null)} />;

  const faqCountByModule = Object.fromEntries(
    data.modules.map(m => [m.id, data.faq.filter(f => f.module_id === m.id).length])
  );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modules</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define the main modules of Moodivation.</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 bg-[#2E6DA4] hover:bg-[#255a8a] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <IconPlus size={15} />Module
        </button>
      </div>
      {data.modules.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No modules yet.{' '}
          <button onClick={() => setAdding(true)} className="text-[#2E6DA4] hover:underline">
            Add first module →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.modules.map(mod => (
            <div
              key={mod.id}
              className="bg-white rounded-xl border px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{mod.name}</p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{mod.description}</p>
                <div className="flex gap-3 mt-1">
                  <p className="text-xs text-gray-400 font-mono">{mod.nav_path}</p>
                  <p className="text-xs text-gray-400">
                    {faqCountByModule[mod.id] ?? 0} FAQ · {data.pages.filter(p => p.module_id === mod.id).length} pages
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setActiveItemId(mod.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                  <IconPencil size={15} />
                </button>
                <button onClick={() => setPendingDelete(mod)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <IconTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This cannot be undone."
        onConfirm={() => { if (pendingDelete) deleteModule(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
