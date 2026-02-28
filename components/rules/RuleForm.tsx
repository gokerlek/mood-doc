'use client';
import { useState } from 'react';
import { IconCheck, IconTag } from '@tabler/icons-react';
import { TagInput } from '@/components/shared/TagInput';
import type { KbRule, KbItemContext, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface RuleFormProps {
  initial: KbRule;
  leafNodes: MapNodeData[];
  components: KbComponent[];
  onSave: (r: KbRule) => void;
  onCancel: () => void;
}

type ContextType = 'global' | 'page' | 'component';

function buildContext(type: ContextType, nodeId: string, componentId: string): KbItemContext {
  if (type === 'page') return { type: 'page', node_id: nodeId };
  if (type === 'component') return { type: 'component', component_id: componentId };
  return { type: 'global' };
}

function getContextType(context: KbItemContext): ContextType {
  return context.type;
}

export function RuleForm({ initial, leafNodes, components, onSave, onCancel }: RuleFormProps) {
  const [r, setR] = useState<KbRule>(initial);
  const [contextType, setContextType] = useState<ContextType>(getContextType(initial.context));
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initial.context.type === 'page' ? initial.context.node_id : ''
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string>(
    initial.context.type === 'component' ? initial.context.component_id : ''
  );

  const canSave = r.title.trim() !== '' && r.description.trim() !== '';

  const handleSave = () => {
    if (!canSave) return;
    const context = buildContext(contextType, selectedNodeId, selectedComponentId);
    onSave({ ...r, context });
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Başlık</Label>
          <Input
            placeholder="Kural başlığı..."
            value={r.title}
            onChange={e => setR(p => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Açıklama</Label>
          <Textarea
            rows={3}
            placeholder="Kuralı açıklayın..."
            value={r.description}
            onChange={e => setR(p => ({ ...p, description: e.target.value }))}
          />
        </div>

        {/* Context selector */}
        <div className="space-y-2">
          <Label>Context</Label>
          <Select
            value={contextType}
            onValueChange={v => setContextType(v as ContextType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="page">Sayfa</SelectItem>
              <SelectItem value="component">Component</SelectItem>
            </SelectContent>
          </Select>

          {contextType === 'page' && (
            <Select
              value={selectedNodeId}
              onValueChange={v => setSelectedNodeId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Sayfa seç —" />
              </SelectTrigger>
              <SelectContent>
                {leafNodes.map(n => (
                  <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {contextType === 'component' && (
            <Select
              value={selectedComponentId}
              onValueChange={v => setSelectedComponentId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Component seç —" />
              </SelectTrigger>
              <SelectContent>
                {components.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1">
          <Label className="flex items-center gap-1"><IconTag size={13} />Tags</Label>
          <TagInput tags={r.tag_ids} onChange={tag_ids => setR(p => ({ ...p, tag_ids }))} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onCancel} className="flex-1">İptal</Button>
          <Button onClick={handleSave} disabled={!canSave} className="flex-1">
            <IconCheck size={14} />Kaydet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
