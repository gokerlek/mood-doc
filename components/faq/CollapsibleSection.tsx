'use client';
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
    <Collapsible open={open} onOpenChange={setOpen} className="bg-muted/30 rounded-2xl overflow-hidden">
      <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {title}
          </span>
          <span className="text-[10px] bg-background text-muted-foreground px-1.5 py-0.5 rounded-full font-medium border border-border">
            {count}
          </span>
        </div>
        <IconChevronDown
          size={14}
          className={cn('text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-5 pb-5 space-y-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
