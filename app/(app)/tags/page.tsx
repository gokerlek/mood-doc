'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyTagCategory } from '@/lib/defaults';
import { TagCategorySection } from '@/components/tags/TagCategorySection';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { SearchBar } from '@/components/shared/SearchBar';
import { useSearchParam } from '@/hooks/useSearchParam';
import { Button } from '@/components/ui/button';
import { IconPlus, IconTags } from '@tabler/icons-react';

export default function TagsPage() {
  const data = useKbStore.useData();
  const upsertTagCategory = useKbStore.useUpsertTagCategory();
  const [search, setSearch] = useSearchParam('q');

  if (!data) return null;

  const { tag_categories = [], tags = [] } = data;
  const q = search.toLowerCase().trim();
  const filteredCategories = tag_categories.filter(cat => {
    if (!q) return true;
    return (
      cat.label.toLowerCase().includes(q) ||
      tags.some(t => t.category_id === cat.id && t.label.toLowerCase().includes(q))
    );
  });

  const handleAddCategory = () => upsertTagCategory({ ...emptyTagCategory(), label: 'Yeni Kategori' });

  return (
    <ListPageLayout
      icon={<IconTags size={22} className="text-primary" />}
      title="Tag Yönetimi"
      description="Tüm tag kategorilerini ve etiketleri buradan yönetin."
      action={
        <Button onClick={handleAddCategory}>
          <IconPlus size={14} />
          Kategori Ekle
        </Button>
      }
      maxWidth="4xl"
    >
      <SearchBar placeholder="Kategori veya tag ara..." />

      {tag_categories.length === 0 ? (
        <EmptyState
          icon={<IconTags size={28} />}
          title="Henüz kategori yok."
          action={
            <Button variant="link" onClick={handleAddCategory} className="mt-1 h-auto p-0 text-sm">
              İlk kategoriyi ekle →
            </Button>
          }
        />
      ) : filteredCategories.length > 0 ? (
        <div className="space-y-3">
          {filteredCategories.map(cat => (
            <TagCategorySection
              key={cat.id}
              category={cat}
              tags={tags.filter(t => t.category_id === cat.id)}
            />
          ))}
        </div>
      ) : (
        <NoResults
          message="Eşleşen kategori veya tag bulunamadı."
          onClear={() => setSearch('')}
        />
      )}
    </ListPageLayout>
  );
}
