'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyPropDef, emptyVariant, emptyCondition } from '@/lib/defaults';
import type { KbComponent, ComponentPropDef, ComponentVariant, ComponentCondition } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface ComponentPrimitiveSectionProps { comp: KbComponent; }

const PROP_TYPE_OPTIONS = ['string', 'boolean', 'ReactNode', 'fn'] as const;

export function ComponentPrimitiveSection({ comp }: ComponentPrimitiveSectionProps) {
  const upsertComponent = useKbStore.useUpsertComponent();

  const props: ComponentPropDef[] = comp.props ?? [];
  const variants: ComponentVariant[] = comp.variants ?? [];
  const conditions: ComponentCondition[] = comp.conditions ?? [];

  // --- Props helpers ---
  const updateProps = (updated: ComponentPropDef[]) =>
    upsertComponent({ ...comp, props: updated });

  const addProp = () => updateProps([...props, emptyPropDef()]);
  const deleteProp = (id: string) => updateProps(props.filter(p => p.id !== id));
  const updateProp = (id: string, patch: Partial<ComponentPropDef>) =>
    updateProps(props.map(p => p.id === id ? { ...p, ...patch } : p));

  // --- Variants helpers ---
  const updateVariants = (updated: ComponentVariant[]) =>
    upsertComponent({ ...comp, variants: updated });

  const addVariant = () => updateVariants([...variants, emptyVariant()]);
  const deleteVariant = (id: string) => updateVariants(variants.filter(v => v.id !== id));
  const updateVariant = (id: string, patch: Partial<ComponentVariant>) =>
    updateVariants(variants.map(v => v.id === id ? { ...v, ...patch } : v));

  // --- Conditions helpers ---
  const updateConditions = (updated: ComponentCondition[]) =>
    upsertComponent({ ...comp, conditions: updated });

  const addCondition = () => updateConditions([...conditions, emptyCondition()]);
  const deleteCondition = (id: string) => updateConditions(conditions.filter(c => c.id !== id));
  const updateCondition = (id: string, patch: Partial<ComponentCondition>) =>
    updateConditions(conditions.map(c => c.id === id ? { ...c, ...patch } : c));

  return (
    <div className="space-y-6">
      {/* A. Props */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Props</h3>
          <Button size="sm" variant="outline" onClick={addProp}>
            <IconPlus size={13} /> Prop Ekle
          </Button>
        </div>

        {props.map(prop => (
          <div key={prop.id} className="flex items-start gap-2">
            <Input
              value={prop.name}
              onChange={e => updateProp(prop.id, { name: e.target.value })}
              placeholder="propAdı"
              className="w-28 font-mono text-xs shrink-0"
            />
            <div className="w-32 space-y-1 shrink-0">
              <Input
                value={prop.type}
                onChange={e => updateProp(prop.id, { type: e.target.value })}
                placeholder="string"
                className="font-mono text-xs"
              />
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
            </div>
            <button type="button"
              onClick={() => updateProp(prop.id, { required: !prop.required })}
              className="shrink-0 focus:outline-none mt-1">
              <Badge variant={prop.required ? 'default' : 'outline'}>
                {prop.required ? 'Zorunlu' : 'Opsiyonel'}
              </Badge>
            </button>
            <Input
              value={prop.description}
              onChange={e => updateProp(prop.id, { description: e.target.value })}
              placeholder="Ne yapar, ne zaman görünür..."
              className="flex-1 text-xs"
            />
            <button type="button" onClick={() => deleteProp(prop.id)}
              className="text-muted-foreground hover:text-destructive transition-colors mt-1 shrink-0"
              aria-label="Prop sil">
              <IconTrash size={14} />
            </button>
          </div>
        ))}

        {props.length === 0 && (
          <p className="text-xs text-muted-foreground">Henüz prop yok.</p>
        )}
      </div>

      {/* B. Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Variant&apos;lar</h3>
          <Button size="sm" variant="outline" onClick={addVariant}>
            <IconPlus size={13} /> Variant Ekle
          </Button>
        </div>

        {variants.map(variant => (
          <div key={variant.id} className="flex items-center gap-2">
            <Input
              value={variant.name}
              onChange={e => updateVariant(variant.id, { name: e.target.value })}
              placeholder="primary, secondary, ghost..."
              className="w-36 text-xs font-mono shrink-0"
            />
            <Input
              value={variant.description}
              onChange={e => updateVariant(variant.id, { description: e.target.value })}
              placeholder="Bu variant görsel olarak nasıl görünür..."
              className="flex-1 text-xs"
            />
            <button type="button" onClick={() => deleteVariant(variant.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              aria-label="Variant sil">
              <IconTrash size={14} />
            </button>
          </div>
        ))}

        {variants.length === 0 && (
          <p className="text-xs text-muted-foreground">Henüz variant yok.</p>
        )}
      </div>

      {/* C. Conditions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Koşullar</h3>
          <Button size="sm" variant="outline" onClick={addCondition}>
            <IconPlus size={13} /> Koşul Ekle
          </Button>
        </div>

        {conditions.map(condition => {
          const propName = props.find(p => p.id === condition.propId)?.name ?? '—';
          return (
            <div key={condition.id} className="flex items-center gap-2">
              <select
                value={condition.propId}
                onChange={e => updateCondition(condition.id, { propId: e.target.value })}
                className="w-32 shrink-0 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                title={propName}
              >
                <option value="">Prop seç...</option>
                {props.map(p => (
                  <option key={p.id} value={p.id}>{p.name || '(isimsiz)'}</option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground shrink-0">=</span>
              <Input
                value={condition.propValue}
                onChange={e => updateCondition(condition.id, { propValue: e.target.value })}
                placeholder="true / false / sm..."
                className="w-24 text-xs font-mono shrink-0"
              />
              <span className="text-xs text-muted-foreground shrink-0">→</span>
              <Input
                value={condition.description}
                onChange={e => updateCondition(condition.id, { description: e.target.value })}
                placeholder="Spinner gösterilir, metin gizlenir..."
                className="flex-1 text-xs"
              />
              <button type="button" onClick={() => deleteCondition(condition.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                aria-label="Koşul sil">
                <IconTrash size={14} />
              </button>
            </div>
          );
        })}

        {conditions.length === 0 && (
          <p className="text-xs text-muted-foreground">Henüz koşul yok.</p>
        )}
      </div>
    </div>
  );
}
