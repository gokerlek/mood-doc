'use client';
import { useKbStore } from '@/stores/kbStore';

function Field({ label, value, onChange, multiline, hint }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {multiline
        ? <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={3} value={value} onChange={e => onChange(e.target.value)} />
        : <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

export default function PlatformPage() {
  const data = useKbStore.useData();
  const updatePlatform = useKbStore.useUpdatePlatform();
  if (!data) return null;
  const p = data.platform;
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Platform Bilgileri</h1>
        <p className="text-sm text-gray-500 mt-1">{"Moodivation'ın genel tanımı. Chatbot bu bilgileri kullanır."}</p>
      </div>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <Field label="Platform Adı" value={p.name} onChange={v => updatePlatform({ name: v })} />
        <Field label="Genel Açıklama" value={p.description} onChange={v => updatePlatform({ description: v })} multiline hint="2-3 cümleyle açıklayın." />
        <Field label="Hedef Kullanıcılar" value={p.target_users} onChange={v => updatePlatform({ target_users: v })} hint="Örn: İK yöneticileri, departman yöneticileri ve çalışanlar" />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Temel Faydalar</label>
          <p className="text-xs text-gray-400">Her satıra bir fayda yazın</p>
          <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E6DA4]/30" rows={4} value={p.key_benefits.join('\n')} onChange={e => updatePlatform({ key_benefits: e.target.value.split('\n') })} />
        </div>
      </div>
      <p className="text-xs text-gray-400">Son güncelleme: {new Date(data._meta.last_updated).toLocaleString('tr-TR')}</p>
    </div>
  );
}
