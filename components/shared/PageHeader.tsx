import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ icon, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-6 mb-6 border-b border-border', className)}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="shrink-0 ml-4">{action}</div>
      )}
    </div>
  );
}
