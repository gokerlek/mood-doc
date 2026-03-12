'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTrash } from '@tabler/icons-react';
import type { SurveyDriver } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';

interface DriverCardProps {
  driver: SurveyDriver;
  onDelete: (id: string) => void;
}

export function DriverCard({ driver, onDelete }: DriverCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => driver.tag_ids.includes(t.id));

  return (
    <Card className="p-4 flex flex-col gap-2 group hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/drivers/${driver.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
            {driver.name || <span className="text-muted-foreground italic">İsimsiz driver</span>}
          </p>
        </Link>
        <Button
          variant="ghost" size="icon"
          className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(driver.id)}
        >
          <IconTrash size={13} />
        </Button>
      </div>
      {driver.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{driver.description}</p>
      )}
      <div className="flex gap-1 flex-wrap mt-auto">
        {tags.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.label}</Badge>)}
      </div>
    </Card>
  );
}
