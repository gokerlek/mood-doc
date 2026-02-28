'use client';
import { useKbStore } from '@/stores/kbStore';
import { TagBadge } from './TagBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconTags } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function TagSelector({ selectedIds, onChange, className }: TagSelectorProps) {
  const data = useKbStore.useData();
  if (!data) return null;

  const { tags, tag_categories } = data;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(t => t !== id)
        : [...selectedIds, id]
    );
  };

  const selectedTags = tags.filter(t => selectedIds.includes(t.id));

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {selectedTags.map(tag => (
        <TagBadge key={tag.id} label={tag.label} onRemove={() => toggle(tag.id)} />
      ))}
      <Popover>
        <PopoverTrigger className="inline-flex items-center gap-1 h-6 px-2 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
          <IconTags size={11} />
          Tag Ekle
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 space-y-3" align="start">
          {tag_categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Once /tags sayfasindan tag olusturun.
            </p>
          ) : (
            tag_categories.map(cat => {
              const catTags = tags.filter(t => t.category_id === cat.id);
              if (!catTags.length) return null;
              return (
                <div key={cat.id}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                    {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {catTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggle(tag.id)}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs transition-colors',
                          selectedIds.includes(tag.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        )}
                      >
                        #{tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
