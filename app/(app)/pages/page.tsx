'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { useUiStore } from '@/stores/uiStore';
import { IconPlus } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { PageForm } from '@/components/pages/PageForm';
import { PageRow } from '@/components/pages/PageRow';
import { emptyPage } from '@/lib/defaults';
import type { KbPage } from '@/lib/types';
import { Button } from '@/components/ui/button';

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

  if (adding) {
    return <PageForm initial={emptyPage()} modules={modules} onSave={save} onCancel={() => setAdding(false)} />;
  }
  if (editing) {
    return <PageForm initial={editing} modules={modules} onSave={save} onCancel={() => setActiveItemId(null)} />;
  }

  const grouped = data.modules.map(m => ({
    module: m,
    pages: data.pages.filter(p => p.module_id === m.id),
  })).filter(g => g.pages.length > 0);

  const ungrouped = data.pages.filter(
    p => !p.module_id || !data.modules.find(m => m.id === p.module_id)
  );

  const faqCountByPage = Object.fromEntries(
    data.pages.map(pg => [pg.id, data.faq.filter(f => f.page_id === pg.id).length])
  );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Document every screen in the app.</p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <IconPlus size={15} />Page
        </Button>
      </div>

      {data.pages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No pages yet.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ module: mod, pages }) => (
            <div key={mod.id}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{mod.name}</h3>
              <div className="space-y-2">{pages.map(page => <PageRow key={page.id} page={page} faqCount={faqCountByPage[page.id] ?? 0} onEdit={() => setActiveItemId(page.id)} onDelete={() => setPendingDelete(page)} />)}</div>
            </div>
          ))}
          {ungrouped.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Other</h3>
              <div className="space-y-2">{ungrouped.map(page => <PageRow key={page.id} page={page} faqCount={faqCountByPage[page.id] ?? 0} onEdit={() => setActiveItemId(page.id)} onDelete={() => setPendingDelete(page)} />)}</div>
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
