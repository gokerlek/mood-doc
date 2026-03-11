import type { ReactNode } from 'react';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
      <div className="text-muted-foreground/40 flex justify-center mb-2">
        {icon ?? <IconInbox size={28} strokeWidth={1.5} />}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
