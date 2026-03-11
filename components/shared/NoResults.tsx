import { Button } from '@/components/ui/button';

interface NoResultsProps {
  message?: string;
  onClear: () => void;
  clearLabel?: string;
}

export function NoResults({
  message = 'Eşleşen sonuç bulunamadı.',
  onClear,
  clearLabel = 'Temizle',
}: NoResultsProps) {
  return (
    <p className="text-center py-8 text-sm text-muted-foreground">
      {message}{' '}
      <Button variant="link" onClick={onClear} className="p-0 h-auto">
        {clearLabel}
      </Button>
    </p>
  );
}
