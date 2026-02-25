'use client';
import { useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface CollapsibleSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full justify-start h-auto py-1 px-0 hover:bg-transparent"
      >
        {open
          ? <IconChevronDown size={14} className="text-muted-foreground" />
          : <IconChevronRight size={14} className="text-muted-foreground" />}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <Badge variant="secondary" className="text-xs font-normal">{count}</Badge>
      </Button>
      {open && <div className="space-y-2 pl-4">{children}</div>}
    </div>
  );
}
