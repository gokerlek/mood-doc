import type { ReactNode } from 'react';

interface SectionListHeaderProps {
  icon: ReactNode;
  label: ReactNode;
  count: number;
}

export function SectionListHeader({ icon, label, count }: SectionListHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
      <span className="text-xs text-muted-foreground ml-1">{count}</span>
    </div>
  );
}
