'use client';
import { useKbStore } from '@/stores/kbStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function RulesPage() {
  const data = useKbStore.useData();
  const updateGlobalRules = useKbStore.useUpdateGlobalRules();
  if (!data) return null;
  const r = data.global_rules;
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Genel Kurallar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform genelinde geçerli gizlilik ve raporlama kuralları.</p>
      </div>
      <Card>
        <CardContent className="space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Anonimlik Limitleri</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Filtreleme Limiti (kişi)</Label>
              <Input
                type="number"
                min={0}
                value={r.anonymity_limit.value}
                onChange={e => updateGlobalRules({ anonymity_limit: { ...r.anonymity_limit, value: Number(e.target.value) } })}
              />
            </div>
            <div className="space-y-1">
              <Label>Raporlama Limiti (kişi)</Label>
              <Input
                type="number"
                min={0}
                value={r.reporting_limit.value}
                onChange={e => updateGlobalRules({ reporting_limit: { ...r.reporting_limit, value: Number(e.target.value) } })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Filtreleme Limiti Açıklaması</Label>
            <Textarea
              rows={2}
              value={r.anonymity_limit.description}
              onChange={e => updateGlobalRules({ anonymity_limit: { ...r.anonymity_limit, description: e.target.value } })}
            />
          </div>
          <div className="space-y-1">
            <Label>Raporlama Limiti Açıklaması</Label>
            <Textarea
              rows={2}
              value={r.reporting_limit.description}
              onChange={e => updateGlobalRules({ reporting_limit: { ...r.reporting_limit, description: e.target.value } })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
