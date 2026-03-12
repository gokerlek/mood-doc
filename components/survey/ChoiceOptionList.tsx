'use client';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconTrash, IconPlus } from '@tabler/icons-react';

interface ChoiceOptionListProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function ChoiceOptionList({ options, onChange }: ChoiceOptionListProps) {
  const lastRef = useRef<HTMLInputElement>(null);

  const update = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...options, '']);
    setTimeout(() => lastRef.current?.focus(), 50);
  };

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
            {String.fromCharCode(65 + i)}
          </span>
          <Input
            ref={i === options.length - 1 ? lastRef : undefined}
            value={opt}
            onChange={e => update(i, e.target.value)}
            placeholder={`Seçenek ${i + 1}...`}
            className="flex-1"
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); add(); }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => remove(i)}
            disabled={options.length <= 1}
          >
            <IconTrash size={12} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={add}
      >
        <IconPlus size={13} /> Seçenek Ekle
      </Button>
    </div>
  );
}
