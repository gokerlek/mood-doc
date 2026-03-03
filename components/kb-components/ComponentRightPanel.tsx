'use client';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent, ComponentType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagSelector } from '@/components/tags/TagSelector';
import { ComponentFaqSection } from './ComponentFaqSection';
import { ComponentRuleSection } from './ComponentRuleSection';
import { ComponentPropEditList } from './ComponentPropEditList';
import { IconLock, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useSlotBindings } from '@/hooks/useSlotBindings';

interface ComponentRightPanelProps {
  comp: KbComponent;
  selectedSlotId?: string | null;
  onSelectSlot?: (id: string | null) => void;
}

const ZONE_BADGE: Record<string, string> = {
  header: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  body:   'bg-muted/60 text-muted-foreground border-border',
  footer: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

export function ComponentRightPanel({ comp, selectedSlotId, onSelectSlot }: ComponentRightPanelProps) {
  const upsertComponent = useKbStore.useUpsertComponent();
  const data = useKbStore.useData();
  const isPrimitive = comp.component_type === 'primitive';

  const update = (patch: Partial<KbComponent>) =>
    upsertComponent({ ...comp, ...patch });

  const slots = comp.slots ?? [];

  const { updateBinding, deleteSlot } = useSlotBindings(
    slots,
    (updated) => upsertComponent({ ...comp, slots: updated }),
    selectedSlotId,
    onSelectSlot,
  );

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full px-4 py-4 rounded-2xl shadow-lg">
      {/* Ad + Açıklama + Tags + Type */}
      <div className="space-y-3">
        <Input
          value={comp.name}
          onChange={e => !isPrimitive && update({ name: e.target.value })}
          readOnly={isPrimitive}
          placeholder="Component adı..."
          className="text-base font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        />
        <Textarea
          value={comp.description}
          onChange={e => !isPrimitive && update({ description: e.target.value })}
          readOnly={isPrimitive}
          placeholder="Ne işe yarar, nasıl kullanılır..."
          rows={3}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
          <TagSelector
            selectedIds={comp.tag_ids}
            onChange={isPrimitive ? () => {} : tag_ids => update({ tag_ids })}
          />
        </div>

        {isPrimitive ? (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground bg-muted/40 flex items-center gap-1">
              <IconLock size={11} /> atom
            </span>
            <span className="text-xs text-muted-foreground">Standart primitive — düzenlenemez</span>
          </div>
        ) : (
          <div className="flex gap-1.5">
            {(['composite', 'section'] as ComponentType[]).map(t => (
              <button key={t} type="button"
                onClick={() => upsertComponent({ ...comp, component_type: t })}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md border transition-colors',
                  (comp.component_type ?? 'composite') === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Tabs */}
      <Tabs defaultValue={isPrimitive ? 'faq' : 'yapi'} className="flex-1 min-h-0">
        <TabsList className="w-full">
          {!isPrimitive && <TabsTrigger value="yapi" className="flex-1">Yapı</TabsTrigger>}
          {!isPrimitive && <TabsTrigger value="props" className="flex-1">Props</TabsTrigger>}
          <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
          <TabsTrigger value="rules" className="flex-1">Kurallar</TabsTrigger>
        </TabsList>

        {!isPrimitive && (
          <TabsContent value="yapi" className="mt-3 space-y-2">
            {/* Header / Footer zone toggles */}
            <div className="flex gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  const adding = !(comp.has_header ?? false);
                  const hh = comp.header_height ?? 200;
                  update({
                    has_header:   adding,
                    frame_height: (comp.frame_height ?? 320) + (adding ? hh : -hh),
                  });
                }}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md border transition-colors',
                  comp.has_header
                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/40'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}
              >
                Header {comp.has_header ? '●' : '○'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const adding = !(comp.has_footer ?? false);
                  const fh = comp.footer_height ?? 200;
                  update({
                    has_footer:   adding,
                    frame_height: (comp.frame_height ?? 320) + (adding ? fh : -fh),
                  });
                }}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md border transition-colors',
                  comp.has_footer
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/40'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                )}
              >
                Footer {comp.has_footer ? '●' : '○'}
              </button>
            </div>

            {slots.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Canvas&apos;a bileşen sürükle
              </p>
            )}
            {slots.map(slot => {
              const childComp = data?.components.find(c => c.id === slot.component_ids?.[0]);
              const childProps = childComp?.props ?? [];
              const isSelected = selectedSlotId === slot.id;
              const zone = slot.zone ?? 'body';
              return (
                <div
                  key={slot.id}
                  onClick={() => onSelectSlot?.(slot.id)}
                  className={cn(
                    'rounded-md border p-2 cursor-pointer transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {/* Zone badge */}
                    <span className={cn(
                      'text-[9px] px-1 py-0.5 rounded border uppercase tracking-wide shrink-0',
                      ZONE_BADGE[zone]
                    )}>
                      {zone}
                    </span>
                    <span className="text-xs font-medium truncate flex-1">
                      {slot.name || childComp?.name || 'element'}
                    </span>
                    {childComp && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/40 shrink-0">
                        {childComp.name}
                      </span>
                    )}
                    <button
                      type="button"
                      className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                      onClick={e => { e.stopPropagation(); deleteSlot(slot.id); }}
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                  {childProps.map(prop => {
                    const bound = (slot.prop_bindings ?? []).find(b => b.childPropName === prop.name);
                    return (
                      <div key={prop.id} className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
                          {prop.name}
                        </span>
                        <span className="text-muted-foreground/40 text-[10px]">──►</span>
                        <select
                          value={bound?.parentPropId ?? ''}
                          onChange={e => updateBinding(slot.id, prop.name, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="flex-1 text-[11px] border border-border rounded px-1 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Bağlama yok</option>
                          {(comp.props ?? []).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </TabsContent>
        )}

        {!isPrimitive && (
          <TabsContent value="props" className="mt-3">
            <ComponentPropEditList comp={comp} />
          </TabsContent>
        )}

        <TabsContent value="faq" className="mt-3">
          <ComponentFaqSection componentId={comp.id} faqIds={comp.faq_ids} />
        </TabsContent>

        <TabsContent value="rules" className="mt-3">
          <ComponentRuleSection componentId={comp.id} ruleIds={comp.rule_ids} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
