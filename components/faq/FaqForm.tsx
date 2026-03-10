'use client';
import { useState } from 'react';
import { IconCheck, IconTag } from '@tabler/icons-react';
import { TagInput } from '@/components/shared/TagInput';
import type { KbFaq, KbItemContext, MapNodeData, KbComponent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface FaqFormProps {
  initial: KbFaq;
  leafNodes: MapNodeData[];
  components: KbComponent[];
  onSave: (f: KbFaq) => void;
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

export function FaqForm({ initial, leafNodes, components, onSave, onCancel }: FaqFormProps) {
  const [f, setF] = useState<KbFaq>(initial);
  const [contextType, setContextType] = useState<ContextType>(getContextType(initial.context));
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initial.context.type === 'page' ? initial.context.node_id : ''
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string>(
    initial.context.type === 'component' ? initial.context.component_id : ''
  );
  const [saveAttempted, setSaveAttempted] = useState(false);

  const canSave = f.question.trim() !== '' && f.answer.trim() !== '';

  const handleSave = () => {
    if (!canSave) {
      setSaveAttempted(true);
      return;
    }
    const context = buildContext(contextType, selectedNodeId, selectedComponentId);
    onSave({ ...f, context });
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label>Question</Label>
          <Input
            placeholder="What is...?"
            value={f.question}
            onChange={e => setF(p => ({ ...p, question: e.target.value }))}
          />
          {saveAttempted && !f.question.trim() && (
            <p className="text-xs text-destructive">Question is required.</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Answer</Label>
          <Textarea
            rows={3}
            value={f.answer}
            onChange={e => setF(p => ({ ...p, answer: e.target.value }))}
          />
          {saveAttempted && !f.answer.trim() && (
            <p className="text-xs text-destructive">Answer is required.</p>
          )}
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

          <p className="text-xs text-muted-foreground">
            {contextType === 'global' && 'Tüm sayfalarda geçerli.'}
            {contextType === 'page' && 'Sadece seçili sayfada görünür.'}
            {contextType === 'component' && 'Sadece bu component\'te görünür.'}
          </p>

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
          <TagInput tags={f.tag_ids} onChange={tag_ids => setF(p => ({ ...p, tag_ids }))} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave} className="flex-1">
            <IconCheck size={14} />Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
