'use client';
import { useKbStore } from '@/stores/kbStore';
export default function AgentPage() {
  const data = useKbStore.useData();
  const updateAgentBehavior = useKbStore.useUpdateAgentBehavior();
  if (!data) return null;
  const ab = data.agent_behavior;
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div><h1 className="text-xl font-bold text-gray-900">Agent Ayarları</h1><p className="text-sm text-gray-500 mt-0.5">{"Chatbot'un nasıl davranacağını belirleyin."}</p></div>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Ton</label><p className="text-xs text-gray-400">Örn: profesyonel, sıcak ve yardımsever</p><input className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={ab.tone} onChange={e => updateAgentBehavior({ tone: e.target.value })} /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Fallback Mesajı</label><p className="text-xs text-gray-400">Bilinmeyen sorularda gösterilecek mesaj</p><textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={3} value={ab.fallback_message} onChange={e => updateAgentBehavior({ fallback_message: e.target.value })} /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Eskalasyon Mesajı</label><p className="text-xs text-gray-400">İnsan desteğine yönlendirme mesajı</p><textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={3} value={ab.escalation_message} onChange={e => updateAgentBehavior({ escalation_message: e.target.value })} /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Maksimum Cevap Uzunluğu (cümle)</label><input type="number" min={1} max={20} className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={ab.max_answer_sentences} onChange={e => updateAgentBehavior({ max_answer_sentences: Number(e.target.value) })} /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Eskalasyon Tetikleyicileri</label><p className="text-xs text-gray-400">Her satıra bir tetikleyici</p><textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={3} value={ab.escalation_triggers.join('\n')} onChange={e => updateAgentBehavior({ escalation_triggers: e.target.value.split('\n').filter(Boolean) })} /></div>
      </div>
    </div>
  );
}
