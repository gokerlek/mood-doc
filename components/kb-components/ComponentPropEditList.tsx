'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyPropDef } from '@/lib/defaults';
import type { KbComponent, ComponentPropDef } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const PROP_TYPE_OPTIONS = ['string', 'boolean', 'ReactNode', 'fn'] as const;

interface ComponentPropEditListProps { comp: KbComponent; }

export function ComponentPropEditList({ comp }: ComponentPropEditListProps) {
  const upsertComponent = useKbStore.useUpsertComponent();
  const props: ComponentPropDef[] = comp.props ?? [];

  const updateProps = (updated: ComponentPropDef[]) =>
    upsertComponent({ ...comp, props: updated });

  const addProp = () => updateProps([...props, emptyPropDef()]);
  const deleteProp = (id: string) => updateProps(props.filter(p => p.id !== id));
  const updateProp = (id: string, patch: Partial<ComponentPropDef>) =>
    updateProps(props.map(p => p.id === id ? { ...p, ...patch } : p));

  return (
    <div className="space-y-3">
      {props.map(prop => (
        <Card key={prop.id} className="p-2 space-y-1.5">
          <div className="flex gap-1.5">
            <Input
              value={prop.name}
              onChange={e => updateProp(prop.id, { name: e.target.value })}
              placeholder="propAdı"
              className="font-mono text-xs"
            />
            <Button type="button" variant="ghost" size="sm"
              onClick={() => updateProp(prop.id, { required: !prop.required })}
              className="shrink-0 p-0 h-auto">
              <Badge variant={prop.required ? 'default' : 'outline'} className="text-xs">
                {prop.required ? 'Zorunlu' : 'Ops.'}
              </Badge>
            </Button>
            <Button type="button" variant="ghost" size="sm"
              onClick={() => deleteProp(prop.id)}
              className="text-muted-foreground hover:text-destructive shrink-0">
              <IconTrash size={13} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {PROP_TYPE_OPTIONS.map(opt => (
              <Button key={opt} type="button" variant="ghost" size="sm"
                onClick={() => updateProp(prop.id, { type: opt })}
                className="p-0 h-auto">
                <Badge variant={prop.type === opt ? 'default' : 'outline'}
                  className="cursor-pointer text-xs px-1.5 py-0">
                  {opt}
                </Badge>
              </Button>
            ))}
          </div>
          <Input
            value={prop.description}
            onChange={e => updateProp(prop.id, { description: e.target.value })}
            placeholder="Ne yapar, ne zaman görünür..."
            className="text-xs"
          />
        </Card>
      ))}
      {props.length === 0 && (
        <p className="text-xs text-muted-foreground">Henüz prop yok.</p>
      )}
      <Button size="sm" variant="ghost" onClick={addProp}
        className="w-full justify-start text-muted-foreground hover:text-foreground">
        <IconPlus size={13} /> Prop Ekle
      </Button>
    </div>
  );
}
