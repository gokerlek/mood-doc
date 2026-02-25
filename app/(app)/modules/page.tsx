'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import { useUiStore } from '@/stores/uiStore';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ModuleForm } from '@/components/modules/ModuleForm';
import { emptyModule } from '@/lib/defaults';
import type { KbModule } from '@/lib/types';
import { Button } from '@/components/ui/button';

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

  if (adding) {
    return <ModuleForm initial={emptyModule()} onSave={save} onCancel={() => setAdding(false)} />;
  }
  if (editing) {
    return <ModuleForm initial={editing} onSave={save} onCancel={() => setActiveItemId(null)} />;
  }

  const faqCountByModule = Object.fromEntries(
    data.modules.map(m => [m.id, data.faq.filter(f => f.module_id === m.id).length])
  );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Modules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Define the main modules of Moodivation.</p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <IconPlus size={15} />Module
        </Button>
      </div>

      {data.modules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No modules yet.{' '}
          <Button variant="link" onClick={() => setAdding(true)} className="p-0 h-auto">
            Add first module →
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.modules.map(mod => (
            <div
              key={mod.id}
              className="bg-card border border-border rounded-xl px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{mod.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p>
                <div className="flex gap-3 mt-1">
                  <p className="text-xs text-muted-foreground font-mono">{mod.nav_path}</p>
                  <p className="text-xs text-muted-foreground">
                    {faqCountByModule[mod.id] ?? 0} FAQ · {data.pages.filter(p => p.module_id === mod.id).length} pages
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => setActiveItemId(mod.id)}>
                  <IconPencil size={15} />
                </Button>
                <Button variant="destructive" size="icon-sm" onClick={() => setPendingDelete(mod)}>
                  <IconTrash size={15} />
                </Button>
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
