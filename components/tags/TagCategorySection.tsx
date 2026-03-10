'use client';
import { useState } from 'react';
import { useKbStore } from '@/stores/kbStore';
import type { TagCategory, KbTag } from '@/lib/types';
import { emptyTag } from '@/lib/defaults';
import { TagBadge } from './TagBadge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconPlus, IconTrash, IconEdit, IconCheck } from '@tabler/icons-react';

interface TagCategorySectionProps {
  category: TagCategory;
  tags: KbTag[];
}

export function TagCategorySection({ category, tags }: TagCategorySectionProps) {
  const [newTagLabel, setNewTagLabel] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [catLabel, setCatLabel] = useState(category.label);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const upsertTag = useKbStore.useUpsertTag();
  const deleteTag = useKbStore.useDeleteTag();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();
  const deleteTagCategory = useKbStore.useDeleteTagCategory();

  const handleAddTag = () => {
    const trimmed = newTagLabel.trim();
    if (!trimmed) return;
    upsertTag(emptyTag(category.id, trimmed));
    setNewTagLabel('');
  };

  const handleSaveCatLabel = () => {
    upsertTagCategory({ ...category, label: catLabel });
    setIsEditingLabel(false);
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        {isEditingLabel ? (
          <div className="flex items-center gap-2">
            <Input
              value={catLabel}
              onChange={e => setCatLabel(e.target.value)}
              className="h-7 text-sm w-40"
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveCatLabel();
                if (e.key === 'Escape') setIsEditingLabel(false);
              }}
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSaveCatLabel}>
              <IconCheck size={13} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{category.label}</span>
            <button
              type="button"
              onClick={() => setIsEditingLabel(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Kategori adını düzenle"
            >
              <IconEdit size={13} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Kategoriyi sil"
        >
          <IconTrash size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-6">
        {tags.map(tag => (
          <TagBadge
            key={tag.id}
            label={tag.label}
            onRemove={() => deleteTag(tag.id)}
          />
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground">Henüz tag yok.</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Yeni tag ekle..."
          value={newTagLabel}
          onChange={e => setNewTagLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTag()}
          className="h-7 text-xs"
        />
        <Button size="sm" variant="outline" onClick={handleAddTag} disabled={!newTagLabel.trim()}>
          <IconPlus size={13} />
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`"${category.label}" kategorisi silinsin mi?`}
        description={tags.length > 0 ? `Bu kategori ve içindeki ${tags.length} tag kalıcı olarak silinir.` : undefined}
        confirmLabel="Sil"
        onConfirm={() => deleteTagCategory(category.id)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
