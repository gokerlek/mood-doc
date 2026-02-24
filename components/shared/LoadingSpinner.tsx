import { IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <IconLoader2 size={24} strokeWidth={1.5} className="animate-spin text-[#2E6DA4]" />
    </div>
  );
}
