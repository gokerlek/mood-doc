import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TagBadgeProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ label, onRemove, className }: TagBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary',
      className
    )}>
      #{label}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="hover:text-destructive h-auto w-auto p-0"
          aria-label={`${label} tagını kaldır`}
        >
          <IconX size={10} />
        </Button>
      )}
    </span>
  );
}
