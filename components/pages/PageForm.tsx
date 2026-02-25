'use client';
import { useState } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { FaqSection } from '@/components/shared/FaqSection';
import type { KbPage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface PageFormProps {
  initial: KbPage;
  modules: { id: string; name: string }[];
  onSave: (p: KbPage) => void;
  onCancel: () => void;
}

export function PageForm({ initial, modules, onSave, onCancel }: PageFormProps) {
  const [p, setP] = useState<KbPage>(initial);
  const isNew = !initial.id;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <IconChevronLeft size={16} />Back
      </Button>
      <h1 className="text-xl font-bold text-foreground">{isNew ? 'New Page' : p.name}</h1>
      <Card>
        <CardContent className="space-y-5">
          {isNew && (
            <div className="space-y-1">
              <Label>Page ID</Label>
              <p className="text-xs text-muted-foreground">Lowercase, underscore. e.g. engagement_report</p>
              <Input
                className="font-mono"
                value={p.id}
                onChange={e => setP(prev => ({ ...prev, id: e.target.value }))}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label>Page Name</Label>
            <Input
              value={p.name}
              onChange={e => setP(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Engagement Report"
            />
          </div>
          <div className="space-y-1">
            <Label>Module</Label>
            <Select
              value={p.module_id}
              onValueChange={v => setP(prev => ({ ...prev, module_id: v ?? '' }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Select module --" />
              </SelectTrigger>
              <SelectContent>
                {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Path</Label>
            <Input
              className="font-mono"
              value={p.path}
              onChange={e => setP(prev => ({ ...prev, path: e.target.value }))}
              placeholder="/reports/engagement"
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <p className="text-xs text-muted-foreground">What does this page show?</p>
            <Textarea rows={3} value={p.description} onChange={e => setP(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>How to Access</Label>
            <Textarea
              rows={2}
              value={p.how_to_access}
              onChange={e => setP(prev => ({ ...prev, how_to_access: e.target.value }))}
              placeholder="Go to Reports → Engagement from the sidebar."
            />
          </div>
          <div className="space-y-1">
            <Label>Key Actions</Label>
            <p className="text-xs text-muted-foreground">One action per line</p>
            <Textarea rows={3} value={p.key_actions.join('\n')} onChange={e => setP(prev => ({ ...prev, key_actions: e.target.value.split('\n') }))} />
          </div>
          <div className="space-y-1">
            <Label>Tips</Label>
            <p className="text-xs text-muted-foreground">One tip per line</p>
            <Textarea rows={2} value={p.tips.join('\n')} onChange={e => setP(prev => ({ ...prev, tips: e.target.value.split('\n') }))} />
          </div>

          <FaqSection
            moduleId={initial.module_id || undefined}
            pageId={initial.id || undefined}
            isNew={isNew}
          />

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button
              onClick={() => { if (p.id && p.name) onSave(p); }}
              className="flex-1"
            >
              Save Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
