'use client';
import { useState } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { FaqSection } from '@/components/shared/FaqSection';
import type { KbModule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export interface ModuleFormProps {
  initial: KbModule;
  onSave: (m: KbModule) => void;
  onCancel: () => void;
}

export function ModuleForm({ initial, onSave, onCancel }: ModuleFormProps) {
  const [m, setM] = useState<KbModule>(initial);
  const isNew = !initial.id;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <IconChevronLeft size={16} />Back
      </Button>
      <h1 className="text-xl font-bold text-foreground">{isNew ? 'New Module' : m.name}</h1>
      <Card>
        <CardContent className="space-y-5">
          {isNew && (
            <div className="space-y-1">
              <Label>Module ID</Label>
              <p className="text-xs text-muted-foreground">Lowercase, underscore. e.g. engagement</p>
              <Input
                className="font-mono"
                value={m.id}
                onChange={e => setM(p => ({ ...p, id: e.target.value }))}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label>Module Name</Label>
            <Input value={m.name} onChange={e => setM(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={m.description}
              onChange={e => setM(p => ({ ...p, description: e.target.value }))}
              placeholder="What does this module do?"
            />
          </div>
          <div className="space-y-1">
            <Label>Who Uses It?</Label>
            <p className="text-xs text-muted-foreground">e.g. HR managers and department managers</p>
            <Input value={m.who_uses} onChange={e => setM(p => ({ ...p, who_uses: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Nav Path</Label>
            <p className="text-xs text-muted-foreground">e.g. /reports/engagement</p>
            <Input className="font-mono" value={m.nav_path} onChange={e => setM(p => ({ ...p, nav_path: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Key Features</Label>
            <p className="text-xs text-muted-foreground">One feature per line</p>
            <Textarea
              rows={4}
              value={(m.key_features ?? []).join('\n')}
              onChange={e => setM(p => ({ ...p, key_features: e.target.value.split('\n') }))}
            />
          </div>

          <FaqSection moduleId={initial.id || undefined} isNew={isNew} />

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button onClick={() => { if (m.id && m.name) onSave(m); }} className="flex-1">
              Save Module
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
