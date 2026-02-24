'use client';
import { useKbStore } from '@/stores/kbStore';
export default function RulesPage() {
  const data = useKbStore.useData();
  const updateGlobalRules = useKbStore.useUpdateGlobalRules();
  if (!data) return null;
  const r = data.global_rules;
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Genel Kurallar</h1><p className="text-sm text-gray-500 mt-0.5">Platform genelinde geçerli gizlilik ve raporlama kuralları.</p></div>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-800">Anonimlik Limitleri</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Filtreleme Limiti (kişi)</label><input type="number" min={0} className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={r.anonymity_limit.value} onChange={e => updateGlobalRules({ anonymity_limit: { ...r.anonymity_limit, value: Number(e.target.value) } })} /></div>
          <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Raporlama Limiti (kişi)</label><input type="number" min={0} className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={r.reporting_limit.value} onChange={e => updateGlobalRules({ reporting_limit: { ...r.reporting_limit, value: Number(e.target.value) } })} /></div>
        </div>
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Filtreleme Limiti Açıklaması</label><textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={2} value={r.anonymity_limit.description} onChange={e => updateGlobalRules({ anonymity_limit: { ...r.anonymity_limit, description: e.target.value } })} /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Raporlama Limiti Açıklaması</label><textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={2} value={r.reporting_limit.description} onChange={e => updateGlobalRules({ reporting_limit: { ...r.reporting_limit, description: e.target.value } })} /></div>
      </div>
    </div>
  );
}
