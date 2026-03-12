'use client';
import { useKbStore } from '@/stores/kbStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import { IconTrash } from '@tabler/icons-react';

interface GlossarySectionProps {
  glossaryIds: string[];
  onAddId: (id: string) => void;
  onRemoveId: (id: string) => void;
}

export function GlossarySection({ glossaryIds, onAddId, onRemoveId }: GlossarySectionProps) {
  const data = useKbStore.useData();

  if (!data) return null;

  const selected = data.glossary.filter(t => glossaryIds.includes(t.id));
  const available = data.glossary.filter(t => !glossaryIds.includes(t.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Sözlük Terimleri</h3>
      </div>

      {available.length > 0 && (
        <Combobox
          value={null}
          onValueChange={(id) => { if (id) onAddId(id); }}
        >
          <ComboboxInput placeholder="Terim ekle..." showClear={false} />
          <ComboboxContent>
            <ComboboxList>
              {available.map(t => (
                <ComboboxItem key={t.id} value={t.id}>{t.term}</ComboboxItem>
              ))}
              <ComboboxEmpty>Terim bulunamadı.</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}

      {selected.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz terim eklenmemiş.</p>
      ) : (
        selected.map(term => (
          <Card key={term.id} className="p-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{term.term}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{term.definition}</p>
            </div>
            <Button
              type="button" variant="ghost" size="icon"
              className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveId(term.id)} aria-label="Kaldır"
            >
              <IconTrash size={13} />
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
