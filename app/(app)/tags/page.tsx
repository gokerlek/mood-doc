'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyTagCategory } from '@/lib/defaults';
import { TagCategorySection } from '@/components/tags/TagCategorySection';
import { PageHeader } from '@/components/shared/PageHeader';
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
    const catMatch = cat.label.toLowerCase().includes(q);
    const tagMatch = tags.some(t => t.category_id === cat.id && t.label.toLowerCase().includes(q));
    return catMatch || tagMatch;
  });

  const handleAddCategory = () => {
    upsertTagCategory({ ...emptyTagCategory(), label: 'Yeni Kategori' });
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Full-width header */}
      <div className="px-6 py-6 border-b border-border">
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
          className="pb-0 mb-0 border-b-0"
        />
      </div>

      {/* Centered content */}
      <div className="px-6 py-6 w-full max-w-4xl mx-auto space-y-5">
        {/* Search */}
        <SearchBar placeholder="Kategori veya tag ara..." />

        {tag_categories.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
            <IconTags size={28} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Henüz kategori yok.</p>
            <Button variant="link" onClick={handleAddCategory} className="mt-1 h-auto p-0 text-sm">
              İlk kategoriyi ekle →
            </Button>
          </div>
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
          <p className="text-center py-8 text-sm text-muted-foreground">
            Eşleşen kategori veya tag bulunamadı.{' '}
            <Button variant="link" onClick={() => setSearch('')} className="p-0 h-auto">
              Temizle
            </Button>
          </p>
        )}
      </div>
    </div>
  );
}
