'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MapNodeData } from '@/lib/types';

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
  onSave: (patch: Partial<Pick<MapNodeData, 'label' | 'color'>>) => void;
}

export function NodeDrawer({ node, onClose, onSave }: NodeDrawerProps) {
  const [label, setLabel] = useState(node?.label ?? '');
  const [color, setColor] = useState<string | undefined>(node?.color);

  const isLeaf = node?.node_type !== 'group';

  const handleSave = () => {
    onSave({ label: label.trim() || 'Node', color });
    onClose();
  };

  return (
    <Drawer open={!!node} onOpenChange={(open) => { if (!open) onClose(); }} direction="right">
      <DrawerContent className="w-80 sm:max-w-80 flex flex-col">
        <DrawerHeader className="border-b border-border pb-3">
          <DrawerTitle>Node Düzenle</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Label */}
          <div className="space-y-1.5">
            <Label className="text-xs">Ad</Label>
            <Input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Node adı"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs">Renk</Label>
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
                  title="Rengi kaldır"
                >
                  x
                </button>
              )}
            </div>
          </div>

          {/* Page link for leaf nodes */}
          {isLeaf && node && (
            <div className="pt-1">
              <Link
                href={`/pages/${node.id}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                onClick={onClose}
              >
                Sayfa Detayını Düzenle &rarr;
              </Link>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-border flex-row gap-2 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button size="sm" onClick={handleSave} className="flex-1">
            Kaydet
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
