'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { useUiStore } from '@/stores/uiStore';
import { IconPlus, IconPencil, IconTrash, IconChevronLeft } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { FaqSection } from '@/components/shared/FaqSection';
import type { KbPage } from '@/lib/types';

const empty = (): KbPage => ({
  id: '', name: '', module_id: '', path: '', description: '', how_to_access: '', key_actions: [], tips: [],
});

function PageForm({
  initial, modules, onSave, onCancel,
}: {
  initial: KbPage;
  modules: { id: string; name: string }[];
  onSave: (p: KbPage) => void;
  onCancel: () => void;
}) {
  const [p, setP] = useState<KbPage>(initial);
  const isNew = !initial.id;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <button onClick={onCancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <IconChevronLeft size={16} />Back
      </button>
      <h1 className="text-xl font-bold text-gray-900">{isNew ? 'New Page' : p.name}</h1>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        {isNew && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Page ID</label>
            <p className="text-xs text-gray-400">Lowercase, underscore. e.g. engagement_report</p>
            <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={p.id} onChange={e => setP(prev => ({ ...prev, id: e.target.value }))} />
          </div>
        )}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Page Name</label>
          <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={p.name} onChange={e => setP(prev => ({ ...prev, name: e.target.value }))} placeholder="Engagement Report" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Module</label>
          <select className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={p.module_id} onChange={e => setP(prev => ({ ...prev, module_id: e.target.value }))}>
            <option value="">-- Select module --</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Path</label>
          <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={p.path} onChange={e => setP(prev => ({ ...prev, path: e.target.value }))} placeholder="/reports/engagement" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <p className="text-xs text-gray-400">What does this page show?</p>
          <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={3} value={p.description} onChange={e => setP(prev => ({ ...prev, description: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">How to Access</label>
          <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={2} value={p.how_to_access} onChange={e => setP(prev => ({ ...prev, how_to_access: e.target.value }))} placeholder="Go to Reports → Engagement from the sidebar." />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Key Actions</label>
          <p className="text-xs text-gray-400">One action per line</p>
          <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={3} value={p.key_actions.join('\n')} onChange={e => setP(prev => ({ ...prev, key_actions: e.target.value.split('\n') }))} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Tips</label>
          <p className="text-xs text-gray-400">One tip per line</p>
          <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={2} value={p.tips.join('\n')} onChange={e => setP(prev => ({ ...prev, tips: e.target.value.split('\n') }))} />
        </div>

        {/* FAQ section — only for existing pages */}
        <FaqSection
          moduleId={initial.module_id || undefined}
          pageId={initial.id || undefined}
          isNew={isNew}
        />

        <div className="flex gap-2 pt-2 border-t">
          <button onClick={onCancel} className="flex-1 border rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => { if (p.id && p.name) onSave(p); }}
            className="flex-1 bg-[#2E6DA4] hover:bg-[#255a8a] text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Save Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PagesPage() {
  const data = useKbStore.useData();
  const upsertPage = useKbStore.useUpsertPage();
  const deletePage = useKbStore.useDeletePage();
  const activeItemId = useUiStore.useActiveItemId();
  const setActiveItemId = useUiStore.useSetActiveItemId();
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<KbPage | null>(null);

  if (!data) return null;
  const modules = data.modules.map(m => ({ id: m.id, name: m.name }));
  const editing = data.pages.find(p => p.id === activeItemId);
  const save = (page: KbPage) => { upsertPage(page); setActiveItemId(null); setAdding(false); };

  if (adding) return <PageForm initial={empty()} modules={modules} onSave={save} onCancel={() => setAdding(false)} />;
  if (editing) return <PageForm initial={editing} modules={modules} onSave={save} onCancel={() => setActiveItemId(null)} />;

  const grouped = data.modules.map(m => ({
    module: m,
    pages: data.pages.filter(p => p.module_id === m.id),
  })).filter(g => g.pages.length > 0);
  const ungrouped = data.pages.filter(p => !p.module_id || !data.modules.find(m => m.id === p.module_id));

  const faqCountByPage = Object.fromEntries(
    data.pages.map(pg => [pg.id, data.faq.filter(f => f.page_id === pg.id).length])
  );

  const PageRow = ({ page }: { page: KbPage }) => (
    <div className="bg-white rounded-xl border px-5 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{page.name}</p>
        <p className="text-xs text-gray-400 font-mono">{page.path}</p>
        {(faqCountByPage[page.id] ?? 0) > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{faqCountByPage[page.id]} FAQ</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => setActiveItemId(page.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><IconPencil size={14} /></button>
        <button onClick={() => setPendingDelete(page)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><IconTrash size={14} /></button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Document every screen in the app.</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 bg-[#2E6DA4] hover:bg-[#255a8a] text-white text-sm font-medium px-4 py-2 rounded-lg">
          <IconPlus size={15} />Page
        </button>
      </div>
      {data.pages.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No pages yet.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ module: mod, pages }) => (
            <div key={mod.id}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{mod.name}</h3>
              <div className="space-y-2">{pages.map(page => <PageRow key={page.id} page={page} />)}</div>
            </div>
          ))}
          {ungrouped.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Other</h3>
              <div className="space-y-2">{ungrouped.map(page => <PageRow key={page.id} page={page} />)}</div>
            </div>
          )}
        </div>
      )}
      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This cannot be undone."
        onConfirm={() => { if (pendingDelete) deletePage(pendingDelete.id); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
