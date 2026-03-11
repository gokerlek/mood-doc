'use client';
import { useSearchParam } from '@/hooks/useSearchParam';
import { IconSearch } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  paramKey?: string;
  className?: string;
}

export function SearchBar({ placeholder = 'Ara...', paramKey = 'q', className }: SearchBarProps) {
  const [value, setValue] = useSearchParam(paramKey);

  return (
    <div className={cn('relative', className)}>
      <IconSearch
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
        className="pl-8 py-5"
      />
    </div>
  );
}
