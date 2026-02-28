'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import type { MapNodeData } from '@/stores/mapStore';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
];

interface NodeDrawerProps {
  node: MapNodeData | null;
  onClose: () => void;
  onSave: (patch: Partial<Pick<MapNodeData, 'label' | 'description' | 'color'>>) => void;
}

export function NodeDrawer({ node, onClose, onSave }: NodeDrawerProps) {
  const [label, setLabel] = useState(node?.label ?? '');
  const [description, setDescription] = useState(node?.description ?? '');
  const [color, setColor] = useState<string | undefined>(node?.color);

  const handleSave = () => {
    onSave({ label: label.trim() || 'Node', description: description.trim() || undefined, color });
    onClose();
  };

  return (
    <Drawer open={!!node} onOpenChange={(open) => { if (!open) onClose(); }} direction="right">
      <DrawerContent className="w-80 sm:max-w-80 flex flex-col">
        <DrawerHeader className="border-b border-border pb-3">
          <DrawerTitle>Edit Node</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Node name"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? undefined : c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'oklch(0.4067 0.0021 325.6154)' : 'transparent',
                    outline: color === c ? '2px solid white' : 'none',
                    outlineOffset: '-3px',
                  }}
                  title={c}
                />
              ))}
              {color && (
                <button
                  onClick={() => setColor(undefined)}
                  className="w-7 h-7 rounded-full border border-dashed border-border text-muted-foreground text-[10px] font-bold hover:bg-muted transition-colors"
                  title="Remove color"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border flex-row gap-2 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="flex-1">
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
