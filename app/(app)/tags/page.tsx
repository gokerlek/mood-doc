'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyTagCategory } from '@/lib/defaults';
import { TagCategorySection } from '@/components/tags/TagCategorySection';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { IconPlus, IconTags } from '@tabler/icons-react';

export default function TagsPage() {
  const data = useKbStore.useData();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();

  if (!data) return null;

  const { tag_categories = [], tags = [] } = data;

  const handleAddCategory = () => {
    upsertTagCategory({ ...emptyTagCategory(), label: 'Yeni Kategori' });
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <PageHeader
        icon={<IconTags size={22} className="text-primary" />}
        title="Tag Yönetimi"
        description="Tüm tag kategorilerini ve etiketleri buradan yönetin."
        action={
          <Button onClick={handleAddCategory}>
            <IconPlus size={14} />
            Kategori Ekle
          </Button>
        }
      />

      {tag_categories.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <IconTags size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Henüz kategori yok.</p>
          <Button variant="link" onClick={handleAddCategory} className="mt-1 h-auto p-0 text-sm">
            İlk kategoriyi ekle →
          </Button>
        </div>
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
