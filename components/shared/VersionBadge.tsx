import { Badge } from '@/components/ui/badge';

export function VersionBadge({ version }: { version: string }) {
  return (
    <Badge variant="outline" className="font-mono text-xs text-gray-500">
      v{version}
    </Badge>
  );
}
