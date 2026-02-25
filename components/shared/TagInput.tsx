'use client';
import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** compact=true → smaller inputs, "+" button label (used inline in forms) */
  compact?: boolean;
}

export function TagInput({ tags, onChange, compact = false }: TagInputProps) {
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {tags.map(t => (
          <Badge key={t} variant="secondary" className="gap-1 pr-1">
            #{t}
            <button
              type="button"
              onClick={() => onChange(tags.filter(x => x !== t))}
              className="hover:text-destructive"
            >
              <IconX size={compact ? 9 : 10} />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Input
          className={compact ? 'h-7 text-xs' : undefined}
          placeholder={compact ? 'tag (press Enter)' : 'Add tag (press Enter)'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <Button type="button" size={compact ? 'xs' : 'sm'} variant="outline" onClick={add}>
          {compact ? '+' : 'Add'}
        </Button>
      </div>
    </div>
  );
}
