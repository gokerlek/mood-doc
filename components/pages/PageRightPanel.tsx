'use client';
import { useKbStore } from '@/stores/kbStore';
import type { PageData, ComponentSlot } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagSelector } from '@/components/tags/TagSelector';
import { PageFaqSection } from './PageFaqSection';
import { PageRuleSection } from './PageRuleSection';
import { PagePropEditList } from './PagePropEditList';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface PageRightPanelProps {
  nodeId: string;
  nodeLabel: string;
  pageData: PageData;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
}

const ZONE_BADGE: Record<string, string> = {
  header: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  body:   'bg-muted/60 text-muted-foreground border-border',
  footer: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

export function PageRightPanel({
  nodeId,
  nodeLabel,
  pageData,
  selectedSlotId,
  onSelectSlot,
}: PageRightPanelProps) {
  const updatePageData = useKbStore.useUpdatePageData();
  const data = useKbStore.useData();

  const slots: ComponentSlot[] = pageData.canvas_slots ?? [];
  const pageProps = pageData.props ?? [];

  const updateBinding = (slotId: string, childPropName: string, pagePropId: string) => {
    const updated = slots.map(s => {
      if (s.id !== slotId) return s;
      const existing = (s.prop_bindings ?? []).filter(b => b.childPropName !== childPropName);
      const newBindings = pagePropId
        ? [...existing, { childPropName, parentPropId: pagePropId }]
        : existing;
      return { ...s, prop_bindings: newBindings };
    });
    updatePageData(nodeId, { ...pageData, canvas_slots: updated });
  };

  const deleteSlot = (slotId: string) => {
    const updated = slots.filter(s => s.id !== slotId);
    updatePageData(nodeId, { ...pageData, canvas_slots: updated });
    if (selectedSlotId === slotId) onSelectSlot(null);
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full px-4 py-4">
      {/* Sayfa adı + açıklama + taglar */}
      <div className="space-y-3">
        <Input
          value={nodeLabel}
          readOnly
          className="text-base font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        />
        <Textarea
          value={pageData.description}
          onChange={e => updatePageData(nodeId, { ...pageData, description: e.target.value })}
          placeholder="Bu sayfa ne işe yarar?..."
          rows={3}
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
          <TagSelector
            selectedIds={pageData.tag_ids}
            onChange={tag_ids => updatePageData(nodeId, { ...pageData, tag_ids })}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="yapi" className="flex-1 min-h-0">
        <TabsList className="w-full">
          <TabsTrigger value="yapi" className="flex-1">Yapı</TabsTrigger>
          <TabsTrigger value="props" className="flex-1">Props</TabsTrigger>
          <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
          <TabsTrigger value="rules" className="flex-1">Kurallar</TabsTrigger>
        </TabsList>

        {/* Yapı — canvas slots with zone badge + prop bindings */}
        <TabsContent value="yapi" className="mt-3 space-y-2">
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
                onClick={() => onSelectSlot(slot.id)}
                className={cn(
                  'rounded-md border p-2 cursor-pointer transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
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
                        {pageProps.map(p => (
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

        {/* Props — page's own prop definitions */}
        <TabsContent value="props" className="mt-3">
          <PagePropEditList nodeId={nodeId} pageData={pageData} />
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-3">
          <PageFaqSection nodeId={nodeId} pageData={pageData} />
        </TabsContent>

        {/* Kurallar */}
        <TabsContent value="rules" className="mt-3">
          <PageRuleSection nodeId={nodeId} pageData={pageData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
