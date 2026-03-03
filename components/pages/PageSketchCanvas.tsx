'use client';
import { useRef } from 'react';
import type { ComponentSlot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { IconGripVertical, IconX } from '@tabler/icons-react';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { emptySlot } from '@/lib/defaults';
import { overlaps, clampToZone } from '@/lib/canvas-utils';
import type { Rect } from '@/lib/canvas-utils';

const SLOT_MIN_W = 60;
const SLOT_MIN_H = 36;

export interface PageSketchCanvasProps {
  slots: ComponentSlot[];
  frameWidth: number;
  frameHeight: number;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
  onUpdateSlots: (slots: ComponentSlot[]) => void;
  onUpdateFrame: (patch: { frame_width?: number; frame_height?: number }) => void;
}

export function PageSketchCanvas({
  slots,
  frameWidth,
  frameHeight,
  selectedSlotId,
  onSelectSlot,
  onUpdateSlots,
  onUpdateFrame,
}: PageSketchCanvasProps) {
  const bodyZoneRef = useRef<HTMLDivElement | null>(null);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const { setNodeRef: setBodyDropRef, isOver: isOverBody } = useDroppable({
    id: 'page-canvas-body-zone',
  });

  const setBodyZoneRef = (el: HTMLDivElement | null) => {
    bodyZoneRef.current = el;
    setBodyDropRef(el);
  };

  const hasConflict = (candidate: Rect, excludeId: string) =>
    slotsRef.current
      .filter(s => s.id !== excludeId)
      .some(s => overlaps(candidate, { x: s.x, y: s.y, w: s.w, h: s.h }));

  // ── DnD drop ──────────────────────────────────────────────────────────────
  useDndMonitor({
    onDragEnd(event) {
      const { active, over } = event;
      if (!over || over.id !== 'page-canvas-body-zone') return;
      if (!active.data.current) return;
      const { componentId, componentName } = active.data.current as {
        componentId: string;
        componentName: string;
      };
      const zoneEl = bodyZoneRef.current;
      if (!zoneEl) return;
      const zoneRect = zoneEl.getBoundingClientRect();
      const droppedRect = active.rect.current.translated;
      if (!droppedRect) return;
      const newW = 160;
      const newH = 36;
      const x = Math.max(0, Math.min(zoneRect.width - newW, Math.round(droppedRect.left - zoneRect.left)));
      const y = Math.max(0, Math.min(zoneRect.height - newH, Math.round(droppedRect.top - zoneRect.top)));
      const candidate: Rect = { x, y, w: newW, h: newH };
      if (hasConflict(candidate, '__new__')) return;
      const newSlot: ComponentSlot = {
        ...emptySlot(),
        name: componentName || '',
        component_ids: [componentId],
        zone: 'body',
        x,
        y,
        w: newW,
        h: newH,
      };
      onUpdateSlots([...slotsRef.current, newSlot]);
    },
  });

  // ── Slot move (grip) ───────────────────────────────────────────────────────
  const handleMoveStart = (e: React.MouseEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const slot = slotsRef.current.find(s => s.id === slotId);
    if (!slot) return;
    const zoneEl = bodyZoneRef.current;
    if (!zoneEl) return;
    const zoneRect = zoneEl.getBoundingClientRect();
    const zoneW = zoneRect.width;
    const zoneH = zoneRect.height;
    const sw = slot.w;
    const sh = slot.h;
    const origX = slot.x;
    const origY = slot.y;
    const offsetX = e.clientX - zoneRect.left - slot.x;
    const offsetY = e.clientY - zoneRect.top - slot.y;

    const onMove = (ev: MouseEvent) => {
      const x = clampToZone(ev.clientX - zoneRect.left - offsetX, sw, zoneW);
      const y = clampToZone(ev.clientY - zoneRect.top - offsetY, sh, zoneH);
      onUpdateSlots(slotsRef.current.map(s => s.id === slotId ? { ...s, x, y } : s));
    };
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const x = clampToZone(ev.clientX - zoneRect.left - offsetX, sw, zoneW);
      const y = clampToZone(ev.clientY - zoneRect.top - offsetY, sh, zoneH);
      const candidate: Rect = { x, y, w: sw, h: sh };
      if (hasConflict(candidate, slotId)) {
        onUpdateSlots(slotsRef.current.map(s => s.id === slotId ? { ...s, x: origX, y: origY } : s));
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Slot resize (SE corner) ────────────────────────────────────────────────
  const handleSlotResizeStart = (e: React.MouseEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const slot = slotsRef.current.find(s => s.id === slotId);
    if (!slot) return;
    const zoneEl = bodyZoneRef.current;
    if (!zoneEl) return;
    const zoneRect = zoneEl.getBoundingClientRect();

    const onMove = (ev: MouseEvent) => {
      const maxW = zoneRect.width - slot.x;
      const maxH = zoneRect.height - slot.y;
      const w = Math.max(SLOT_MIN_W, Math.min(maxW, Math.round(ev.clientX - zoneRect.left - slot.x)));
      const h = Math.max(SLOT_MIN_H, Math.min(maxH, Math.round(ev.clientY - zoneRect.top - slot.y)));
      onUpdateSlots(slotsRef.current.map(s => s.id === slotId ? { ...s, w, h } : s));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Frame resize (SE corner) ───────────────────────────────────────────────
  const handleFrameResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = frameWidth;
    const startH = frameHeight;

    const onMove = (ev: MouseEvent) => {
      const minW = Math.max(240, ...slotsRef.current.map(s => s.x + s.w + 20));
      const minH = Math.max(160, ...slotsRef.current.map(s => s.y + s.h + 20));
      const newW = Math.max(minW, Math.round(startW + ev.clientX - startX));
      const newH = Math.max(minH, Math.round(startH + ev.clientY - startY));
      onUpdateFrame({ frame_width: newW, frame_height: newH });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Slot renderer ──────────────────────────────────────────────────────────
  const renderSlot = (slot: ComponentSlot) => (
    <div
      key={slot.id}
      onClick={e => { e.stopPropagation(); onSelectSlot(slot.id); }}
      style={{
        position: 'absolute',
        left: `${slot.x}px`,
        top: `${slot.y}px`,
        width: `${slot.w}px`,
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

  return (
    <div
      className="w-full h-full rounded-lg overflow-auto flex items-start justify-center p-10 bg-muted/40"
      style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      onClick={() => onSelectSlot(null)}
    >
      <div className="relative shrink-0 mt-8">
        {/* Frame label */}
        <div className="absolute -top-6 left-0 flex items-center gap-2 select-none pointer-events-none">
          <span className="text-xs font-medium text-muted-foreground">Canvas</span>
          <span className="text-[10px] text-muted-foreground/50">
            {frameWidth} × {frameHeight}
          </span>
        </div>

        {/* Frame */}
        <div
          style={{ width: frameWidth, height: frameHeight }}
          className="relative bg-background rounded-lg shadow-md border-2 border-border overflow-hidden"
          onClick={e => { e.stopPropagation(); onSelectSlot(null); }}
        >
          {/* Body zone */}
          <div
            ref={setBodyZoneRef}
            className={cn(
              'absolute inset-0 transition-colors',
              isOverBody && 'bg-primary/5'
            )}
          >
            {slots.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs text-muted-foreground">Sol panelden bileşen sürükle</p>
              </div>
            )}
            {slots.map(renderSlot)}
          </div>
        </div>

        {/* Frame resize handle */}
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
