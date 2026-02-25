'use client';
import { useKbStore } from '@/stores/kbStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/shared/Field';

export default function PlatformPage() {
  const data = useKbStore.useData();
  const updatePlatform = useKbStore.useUpdatePlatform();
  if (!data) return null;
  const p = data.platform;
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Platform Bilgileri</h1>
        <p className="text-sm text-muted-foreground mt-1">{"Moodivation'ın genel tanımı. Chatbot bu bilgileri kullanır."}</p>
      </div>
      <Card>
        <CardContent className="space-y-5">
          <Field label="Platform Adı" value={p.name} onChange={v => updatePlatform({ name: v })} />
          <Field label="Genel Açıklama" value={p.description} onChange={v => updatePlatform({ description: v })} multiline hint="2-3 cümleyle açıklayın." />
          <Field label="Hedef Kullanıcılar" value={p.target_users} onChange={v => updatePlatform({ target_users: v })} hint="Örn: İK yöneticileri, departman yöneticileri ve çalışanlar" />
          <div className="space-y-1">
            <Label>Temel Faydalar</Label>
            <p className="text-xs text-muted-foreground">Her satıra bir fayda yazın</p>
            <Textarea rows={4} value={p.key_benefits.join('\n')} onChange={e => updatePlatform({ key_benefits: e.target.value.split('\n') })} />
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Son güncelleme: {new Date(data._meta.last_updated).toLocaleString('tr-TR')}</p>
    </div>
  );
}
