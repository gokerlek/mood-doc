'use client';
import { useKbStore } from '@/stores/kbStore';
import type { KbComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagSelector } from '@/components/tags/TagSelector';
import { ComponentFaqSection } from './ComponentFaqSection';
import { ComponentRuleSection } from './ComponentRuleSection';
import { ComponentPropEditList } from './ComponentPropEditList';
import { IconLock, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSlotBindings } from '@/hooks/useSlotBindings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ComponentRightPanelProps {
  comp: KbComponent;
  selectedSlotId?: string | null;
  onSelectSlot?: (id: string | null) => void;
}

const ZONE_BADGE: Record<string, string> = {
  header: 'bg-zone-header-bg text-zone-header-fg border-zone-header-border',
  body:   'bg-muted/60 text-muted-foreground border-border',
  footer: 'bg-zone-footer-bg text-zone-footer-fg border-zone-footer-border',
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
    <ScrollArea className="h-full rounded-2xl shadow-lg">
    <div className="flex flex-col gap-4 px-4 py-4">
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

        {isPrimitive && (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground bg-muted/40 flex items-center gap-1">
              <IconLock size={11} /> atom
            </span>
            <span className="text-xs text-muted-foreground">Standart primitive — düzenlenemez</span>
          </div>
        )}
      </div>

      <Separator />

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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const adding = !(comp.has_header ?? false);
                  const hh = comp.header_height ?? 200;
                  update({
                    has_header:   adding,
                    frame_height: (comp.frame_height ?? 320) + (adding ? hh : -hh),
                  });
                }}
                className={cn(
                  comp.has_header
                    ? 'bg-zone-header-bg text-zone-header-fg border-zone-header-border'
                    : ''
                )}
              >
                Header {comp.has_header ? '●' : '○'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const adding = !(comp.has_footer ?? false);
                  const fh = comp.footer_height ?? 200;
                  update({
                    has_footer:   adding,
                    frame_height: (comp.frame_height ?? 320) + (adding ? fh : -fh),
                  });
                }}
                className={cn(
                  comp.has_footer
                    ? 'bg-zone-footer-bg text-zone-footer-fg border-zone-footer-border'
                    : ''
                )}
              >
                Footer {comp.has_footer ? '●' : '○'}
              </Button>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-5 w-5 text-muted-foreground/50 hover:text-destructive"
                      onClick={e => { e.stopPropagation(); deleteSlot(slot.id); }}
                    >
                      <IconX size={12} />
                    </Button>
                  </div>
                  {childProps.map(prop => {
                    const bound = (slot.prop_bindings ?? []).find(b => b.childPropName === prop.name);
                    const parentPropOptions = [
                      { label: 'Bağlama yok', value: '__none__' },
                      ...(comp.props ?? []).map(parentProp => ({
                        label: parentProp.name || '(isimsiz)',
                        value: parentProp.id,
                      })),
                    ];
                    return (
                      <div key={prop.id} className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
                          {prop.name}
                        </span>
                        <span className="text-muted-foreground/40 text-[10px]">──►</span>
                        <Select
                          items={parentPropOptions}
                          value={bound?.parentPropId ?? '__none__'}
                          onValueChange={val =>
                            updateBinding(
                              slot.id,
                              prop.name,
                              !val || val === '__none__' ? '' : val
                            )
                          }
                        >
                          <SelectTrigger className="flex-1 h-6 text-xs" onClick={e => e.stopPropagation()}>
                            <SelectValue placeholder="Bağlama yok" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__" className="text-xs text-muted-foreground">
                              Bağlama yok
                            </SelectItem>
                            {parentPropOptions
                              .filter(option => option.value !== '__none__')
                              .map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
    </ScrollArea>
  );
}
