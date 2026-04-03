'use client';
import { useRef, useLayoutEffect } from 'react';
import type { KbComponent, ComponentSlot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { IconGripVertical, IconX } from '@tabler/icons-react';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { emptySlot } from '@/lib/defaults';
import { overlaps, clampToZone } from '@/lib/canvas-utils';
import type { Rect } from '@/lib/canvas-utils';

const SLOT_MIN_W = 60;
const SLOT_MIN_H = 36;
const ZONE_MIN_H = 32;

interface ComponentSketchCanvasProps {
  comp: KbComponent;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
  onUpdateSlots: (slots: ComponentSlot[]) => void;
  onUpdateComp: (patch: Partial<KbComponent>) => void;
}

export function ComponentSketchCanvas({
  comp,
  selectedSlotId,
  onSelectSlot,
  onUpdateSlots,
  onUpdateComp,
}: ComponentSketchCanvasProps) {
  const frameRef      = useRef<HTMLDivElement | null>(null);
  const headerZoneRef = useRef<HTMLDivElement | null>(null);
  const bodyZoneRef   = useRef<HTMLDivElement | null>(null);
  const footerZoneRef = useRef<HTMLDivElement | null>(null);

  const slots: ComponentSlot[] = comp.slots ?? [];
  const slotsRef = useRef(slots);
  useLayoutEffect(() => { slotsRef.current = slots; });

  const frameWidth   = comp.frame_width   ?? 480;
  const frameHeight  = comp.frame_height  ?? 320;
  const hasHeader    = comp.has_header    ?? false;
  const hasFooter    = comp.has_footer    ?? false;
  const headerHeight = comp.header_height ?? 48;
  const footerHeight = comp.footer_height ?? 48;

  // ── Drop zones ────────────────────────────────────────────────────────────
  const { setNodeRef: setBodyDropRef,   isOver: isOverBody   } = useDroppable({ id: 'canvas-body-zone' });
  const { setNodeRef: setHeaderDropRef, isOver: isOverHeader } = useDroppable({ id: 'canvas-header-zone' });
  const { setNodeRef: setFooterDropRef, isOver: isOverFooter } = useDroppable({ id: 'canvas-footer-zone' });

  const setBodyZoneRef = (el: HTMLDivElement | null) => {
    bodyZoneRef.current = el;
    setBodyDropRef(el);
  };
  const setHeaderZoneRef = (el: HTMLDivElement | null) => {
    headerZoneRef.current = el;
    setHeaderDropRef(el);
  };
  const setFooterZoneRef = (el: HTMLDivElement | null) => {
    footerZoneRef.current = el;
    setFooterDropRef(el);
  };

  const getZoneRef = (zone: string) => {
    if (zone === 'header') return headerZoneRef;
    if (zone === 'footer') return footerZoneRef;
    return bodyZoneRef;
  };

  const hasConflict = (candidate: Rect, zone: string, excludeId: string) =>
    slotsRef.current
      .filter(s => s.id !== excludeId && (s.zone ?? 'body') === zone)
      .some(s => overlaps(candidate, { x: s.x, y: s.y, w: s.w, h: s.h }));

  // ── DnD drop ─────────────────────────────────────────────────────────────
  useDndMonitor({
    onDragEnd(event) {
      const { active, over } = event;
      if (!over) return;
      const zoneId = over.id as string;
      if (!['canvas-body-zone', 'canvas-header-zone', 'canvas-footer-zone'].includes(zoneId)) return;
      if (!active.data.current) return;
      const { componentId, componentName } = active.data.current as {
        componentId: string;
        componentName: string;
      };
      const zone = zoneId === 'canvas-header-zone' ? 'header'
                 : zoneId === 'canvas-footer-zone'  ? 'footer'
                 : 'body';
      const zoneEl = getZoneRef(zone).current;
      if (!zoneEl) return;
      const zoneRect   = zoneEl.getBoundingClientRect();
      const droppedRect = active.rect.current.translated;
      if (!droppedRect) return;
      const newW = 160;
      const newH = zone === 'body' ? 36
                 : zone === 'header' ? Math.min(headerHeight - 8, 36)
                 : Math.min(footerHeight - 8, 36);
      const x = Math.max(0, Math.min(zoneRect.width  - newW, Math.round(droppedRect.left - zoneRect.left)));
      const y = Math.max(0, Math.min(zoneRect.height - newH, Math.round(droppedRect.top  - zoneRect.top)));
      const candidate: Rect = { x, y, w: newW, h: newH };
      if (hasConflict(candidate, zone, '__new__')) return;
      const newSlot: ComponentSlot = {
        ...emptySlot(),
        name: componentName || '',
        component_ids: [componentId],
        zone,
        x,
        y,
        w: newW,
        h: newH,
      };
      onUpdateSlots([...slotsRef.current, newSlot]);
    },
  });

  // ── Slot move (grip) ──────────────────────────────────────────────────────
  const handleMoveStart = (e: React.MouseEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const slot = slotsRef.current.find(s => s.id === slotId);
    if (!slot) return;
    const zone   = slot.zone ?? 'body';
    const zoneEl = getZoneRef(zone).current;
    if (!zoneEl) return;
    const zoneRect = zoneEl.getBoundingClientRect();
    // Capture zone bounds at mousedown — slot must stay inside
    const zoneW  = zoneRect.width;
    const zoneH  = zoneRect.height;
    const sw     = slot.w;
    const sh     = slot.h;
    const origX  = slot.x;
    const origY  = slot.y;
    const offsetX = e.clientX - zoneRect.left - slot.x;
    const offsetY = e.clientY - zoneRect.top  - slot.y;

    const onMove = (ev: MouseEvent) => {
      const x = clampToZone(ev.clientX - zoneRect.left - offsetX, sw, zoneW);
      const y = clampToZone(ev.clientY - zoneRect.top  - offsetY, sh, zoneH);
      onUpdateSlots(slotsRef.current.map(s => s.id === slotId ? { ...s, x, y } : s));
    };
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const x = clampToZone(ev.clientX - zoneRect.left - offsetX, sw, zoneW);
      const y = clampToZone(ev.clientY - zoneRect.top  - offsetY, sh, zoneH);
      const candidate: Rect = { x, y, w: sw, h: sh };
      if (hasConflict(candidate, zone, slotId)) {
        // Revert to original position
        onUpdateSlots(slotsRef.current.map(s => s.id === slotId ? { ...s, x: origX, y: origY } : s));
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Slot resize (SE corner) ───────────────────────────────────────────────
  const handleSlotResizeStart = (e: React.MouseEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const slot = slotsRef.current.find(s => s.id === slotId);
    if (!slot) return;
    const zone   = slot.zone ?? 'body';
    const zoneEl = getZoneRef(zone).current;
    if (!zoneEl) return;
    const zoneRect = zoneEl.getBoundingClientRect();

    const onMove = (ev: MouseEvent) => {
      const maxW = zoneRect.width  - slot.x;
      const maxH = zoneRect.height - slot.y;
      const w = Math.max(SLOT_MIN_W, Math.min(maxW, Math.round(ev.clientX - zoneRect.left - slot.x)));
      const h = Math.max(SLOT_MIN_H, Math.min(maxH, Math.round(ev.clientY - zoneRect.top  - slot.y)));
      onUpdateSlots(slotsRef.current.map(s => s.id === slotId ? { ...s, w, h } : s));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Header zone resize (bottom edge drag) ─────────────────────────────────
  const handleHeaderResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = headerHeight;
    const maxH   = frameHeight - (hasFooter ? footerHeight : 0) - 40;
    const onMove = (ev: MouseEvent) => {
      // Minimum must accommodate all slots inside the header zone
      const headerSlots = slotsRef.current.filter(s => (s.zone ?? 'body') === 'header');
      const minFromSlots = headerSlots.length > 0
        ? Math.max(...headerSlots.map(s => s.y + s.h + 4))
        : 0;
      const minH = Math.max(ZONE_MIN_H, minFromSlots);
      const newH = Math.max(minH, Math.min(maxH, Math.round(startH + ev.clientY - startY)));
      onUpdateComp({ header_height: newH });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Footer zone resize (top edge drag) ────────────────────────────────────
  const handleFooterResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = footerHeight;
    const maxH   = frameHeight - (hasHeader ? headerHeight : 0) - 40;
    const onMove = (ev: MouseEvent) => {
      // Minimum must accommodate all slots inside the footer zone
      const footerSlots = slotsRef.current.filter(s => (s.zone ?? 'body') === 'footer');
      const minFromSlots = footerSlots.length > 0
        ? Math.max(...footerSlots.map(s => s.y + s.h + 4))
        : 0;
      const minH = Math.max(ZONE_MIN_H, minFromSlots);
      // Dragging up increases footer height
      const newH = Math.max(minH, Math.min(maxH, Math.round(startH - (ev.clientY - startY))));
      onUpdateComp({ footer_height: newH });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Frame resize (SE corner) ──────────────────────────────────────────────
  const handleFrameResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = frameWidth;
    const startH = frameHeight;

    const onMove = (ev: MouseEvent) => {
      const bodySlots = slotsRef.current.filter(s => (s.zone ?? 'body') === 'body');
      const hH = comp.has_header ? (comp.header_height ?? 48) : 0;
      const fH = comp.has_footer ? (comp.footer_height ?? 48) : 0;
      const minW = Math.max(240, ...bodySlots.map(s => s.x + s.w + 20));
      const minH = Math.max(160, hH + Math.max(0, ...bodySlots.map(s => s.y + s.h + 20)) + fH);
      const newW = Math.max(minW, Math.round(startW + ev.clientX - startX));
      const newH = Math.max(minH, Math.round(startH + ev.clientY - startY));
      onUpdateComp({ frame_width: newW, frame_height: newH });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Slot renderer ─────────────────────────────────────────────────────────
  const renderSlot = (slot: ComponentSlot) => (
    <div
      key={slot.id}
      onClick={e => { e.stopPropagation(); onSelectSlot(slot.id); }}
      style={{
        position: 'absolute',
        left:   `${slot.x}px`,
        top:    `${slot.y}px`,
        width:  `${slot.w}px`,
        height: `${slot.h}px`,
      }}
      className={cn(
        'rounded border-2 flex flex-col select-none transition-colors',
        selectedSlotId === slot.id
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-muted/40 text-muted-foreground hover:border-muted-foreground'
      )}
    >
      <div
        className="flex items-center gap-0.5 px-1 py-0.5 cursor-grab active:cursor-grabbing shrink-0"
        onMouseDown={e => handleMoveStart(e, slot.id)}
        title="Taşı"
      >
        <IconGripVertical size={10} className="shrink-0 opacity-40" />
        <span className="text-[10px] font-medium truncate leading-tight">
          {slot.name || 'element'}
        </span>
        {selectedSlotId === slot.id && (
          <button
            type="button"
            className="ml-auto shrink-0 text-primary/60 hover:text-destructive transition-colors"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              onUpdateSlots(slotsRef.current.filter(s => s.id !== slot.id));
              onSelectSlot(null);
            }}
          >
            <IconX size={10} />
          </button>
        )}
      </div>
      <div
        className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize opacity-30 hover:opacity-70 transition-opacity"
        onMouseDown={e => handleSlotResizeStart(e, slot.id)}
        style={{ background: 'linear-gradient(135deg, transparent 50%, currentColor 50%)' }}
      />
    </div>
  );

  const slotsByZone = (zone: 'body' | 'header' | 'footer') =>
    slots.filter(s => (s.zone ?? 'body') === zone);

  return (
    <div
      className="w-full h-full rounded-lg overflow-auto flex items-center justify-center p-10 bg-muted/40"
      style={{
        minHeight: 400,
        backgroundImage:
          'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      onClick={() => onSelectSlot(null)}
    >
      <div className="relative shrink-0 mt-8">
        {/* Frame label */}
        <div className="absolute -top-6 left-0 flex items-center gap-2 select-none pointer-events-none">
          <span className="text-xs font-medium text-muted-foreground">
            {comp.name || 'Component'}
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            {frameWidth} × {frameHeight}
          </span>
        </div>

        {/* Frame */}
        <div
          ref={frameRef}
          style={{ width: frameWidth, height: frameHeight }}
          className="relative bg-background rounded-lg shadow-md border-2 border-border overflow-hidden flex flex-col"
          onClick={e => { e.stopPropagation(); onSelectSlot(null); }}
        >
          {/* Header zone */}
          {hasHeader && (
            <div
              ref={setHeaderZoneRef}
              style={{ height: headerHeight, flexShrink: 0 }}
              className={cn(
                'relative overflow-hidden border-b border-border/60 bg-muted/20 transition-colors',
                isOverHeader && 'bg-primary/5 border-primary/40'
              )}
            >
              <span className="absolute top-1 left-1.5 text-[9px] text-muted-foreground/40 select-none pointer-events-none uppercase tracking-wide">
                header
              </span>
              {slotsByZone('header').map(renderSlot)}
              {/* Header height resize handle */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10 group"
                onMouseDown={handleHeaderResizeStart}
                title="Header yüksekliğini ayarla"
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-transparent group-hover:bg-primary/50 transition-colors" />
              </div>
            </div>
          )}

          {/* Body zone */}
          <div
            ref={setBodyZoneRef}
            className={cn(
              'relative flex-1 overflow-hidden transition-colors',
              isOverBody && 'bg-primary/5'
            )}
          >
            {slotsByZone('body').length === 0 && !hasHeader && !hasFooter && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs text-muted-foreground">Sol panelden bileşen sürükle</p>
              </div>
            )}
            {slotsByZone('body').map(renderSlot)}
          </div>

          {/* Footer zone */}
          {hasFooter && (
            <div
              ref={setFooterZoneRef}
              style={{ height: footerHeight, flexShrink: 0 }}
              className={cn(
                'relative overflow-hidden border-t border-border/60 bg-muted/20 transition-colors',
                isOverFooter && 'bg-primary/5 border-primary/40'
              )}
            >
              {/* Footer height resize handle */}
              <div
                className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-10 group"
                onMouseDown={handleFooterResizeStart}
                title="Footer yüksekliğini ayarla"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-transparent group-hover:bg-primary/50 transition-colors" />
              </div>
              <span className="absolute bottom-1 left-1.5 text-[9px] text-muted-foreground/40 select-none pointer-events-none uppercase tracking-wide">
                footer
              </span>
              {slotsByZone('footer').map(renderSlot)}
            </div>
          )}
        </div>

        {/* Frame resize handle — 3-dot pattern SE corner */}
        <div
          className="absolute -bottom-1.5 -right-1.5 cursor-se-resize p-1 group"
          onMouseDown={handleFrameResizeStart}
          title="Frame boyutunu ayarla"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            <circle cx="6"  cy="10" r="1.5" fill="currentColor" />
            <circle cx="10" cy="6"  r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
