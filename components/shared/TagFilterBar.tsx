import type { KbTag } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface TagFilterBarProps {
  tagIds: string[];
  tags: KbTag[];
  activeTag: string;
  onSelect: (tagId: string) => void;
}

export function TagFilterBar({ tagIds, tags, activeTag, onSelect }: TagFilterBarProps) {
  if (tagIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        size="sm"
        variant={!activeTag ? 'default' : 'outline'}
        onClick={() => onSelect('')}
        className="rounded-full"
      >
        Tümü
      </Button>
      {tagIds.map(tagId => {
        const tag = tags.find(t => t.id === tagId);
        return tag ? (
          <Button
            key={tagId}
            size="sm"
            variant={activeTag === tagId ? 'default' : 'outline'}
            onClick={() => onSelect(activeTag === tagId ? '' : tagId)}
            className="rounded-full"
          >
            {tag.label}
          </Button>
        ) : null;
      })}
    </div>
  );
}
