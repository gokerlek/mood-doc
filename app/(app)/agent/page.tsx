'use client';
import { useKbStore } from '@/stores/kbStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentPage() {
  const data = useKbStore.useData();
  const updateAgentBehavior = useKbStore.useUpdateAgentBehavior();
  if (!data) return null;
  const ab = data.agent_behavior;
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Agent Ayarları</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{"Chatbot'un nasıl davranacağını belirleyin."}</p>
      </div>
      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <Label>Ton</Label>
            <p className="text-xs text-muted-foreground">Örn: profesyonel, sıcak ve yardımsever</p>
            <Input value={ab.tone} onChange={e => updateAgentBehavior({ tone: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Fallback Mesajı</Label>
            <p className="text-xs text-muted-foreground">Bilinmeyen sorularda gösterilecek mesaj</p>
            <Textarea rows={3} value={ab.fallback_message} onChange={e => updateAgentBehavior({ fallback_message: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Eskalasyon Mesajı</Label>
            <p className="text-xs text-muted-foreground">İnsan desteğine yönlendirme mesajı</p>
            <Textarea rows={3} value={ab.escalation_message} onChange={e => updateAgentBehavior({ escalation_message: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Maksimum Cevap Uzunluğu (cümle)</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={ab.max_answer_sentences}
              onChange={e => updateAgentBehavior({ max_answer_sentences: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Eskalasyon Tetikleyicileri</Label>
            <p className="text-xs text-muted-foreground">Her satıra bir tetikleyici</p>
            <Textarea
              rows={3}
              value={ab.escalation_triggers.join('\n')}
              onChange={e => updateAgentBehavior({ escalation_triggers: e.target.value.split('\n').filter(Boolean) })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
