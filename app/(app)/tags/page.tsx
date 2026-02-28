'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyTagCategory } from '@/lib/defaults';
import { TagCategorySection } from '@/components/tags/TagCategorySection';
import { Button } from '@/components/ui/button';
import { IconPlus, IconTags } from '@tabler/icons-react';

export default function TagsPage() {
  const data = useKbStore.useData();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();

  if (!data) return null;

  const { tag_categories, tags } = data;

  const handleAddCategory = () => {
    upsertTagCategory({ ...emptyTagCategory(), label: 'Yeni Kategori' });
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTags size={20} className="text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Tag Yonetimi</h1>
            <p className="text-sm text-muted-foreground">Tum tag kategorilerini ve etiketleri buradan yonetin.</p>
          </div>
        </div>
        <Button size="sm" onClick={handleAddCategory}>
          <IconPlus size={14} />
          Kategori Ekle
        </Button>
      </div>

      {tag_categories.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Henuz kategori yok. "Kategori Ekle" ile baslayin.
        </p>
      ) : (
        <div className="space-y-3">
          {tag_categories.map(cat => (
            <TagCategorySection
              key={cat.id}
              category={cat}
              tags={tags.filter(t => t.category_id === cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
