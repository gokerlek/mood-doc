'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyPropDef } from '@/lib/defaults';
import type { PageData, ComponentPropDef } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const PROP_TYPE_OPTIONS = ['string', 'boolean', 'ReactNode', 'fn'] as const;

interface PagePropEditListProps { nodeId: string; pageData: PageData; }

export function PagePropEditList({ nodeId, pageData }: PagePropEditListProps) {
  const updatePageData = useKbStore.useUpdatePageData();
  const props: ComponentPropDef[] = pageData.props ?? [];

  const updateProps = (updated: ComponentPropDef[]) =>
    updatePageData(nodeId, { ...pageData, props: updated });

  const addProp = () => updateProps([...props, emptyPropDef()]);
  const deleteProp = (id: string) => updateProps(props.filter(p => p.id !== id));
  const updateProp = (id: string, patch: Partial<ComponentPropDef>) =>
    updateProps(props.map(p => p.id === id ? { ...p, ...patch } : p));

  return (
    <div className="space-y-3">
      {props.map(prop => (
        <div key={prop.id} className="space-y-1.5 border border-border rounded-md p-2">
          <div className="flex gap-1.5">
            <Input
              value={prop.name}
              onChange={e => updateProp(prop.id, { name: e.target.value })}
              placeholder="propAdı"
              className="font-mono text-xs"
            />
            <button type="button"
              onClick={() => updateProp(prop.id, { required: !prop.required })}
              className="shrink-0 focus:outline-none">
              <Badge variant={prop.required ? 'default' : 'outline'} className="text-xs">
                {prop.required ? 'Zorunlu' : 'Ops.'}
              </Badge>
            </button>
            <button type="button" onClick={() => deleteProp(prop.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
              <IconTrash size={13} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {PROP_TYPE_OPTIONS.map(opt => (
              <button key={opt} type="button"
                onClick={() => updateProp(prop.id, { type: opt })}
                className="focus:outline-none">
                <Badge variant={prop.type === opt ? 'default' : 'outline'}
                  className="cursor-pointer text-xs px-1.5 py-0">
                  {opt}
                </Badge>
              </button>
            ))}
          </div>
          <Input
            value={prop.description}
            onChange={e => updateProp(prop.id, { description: e.target.value })}
            placeholder="Ne yapar, ne zaman görünür..."
            className="text-xs"
          />
        </div>
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
