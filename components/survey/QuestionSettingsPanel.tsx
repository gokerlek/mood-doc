'use client';
import { useKbStore } from '@/stores/kbStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { SurveyQuestion, QuestionType } from '@/lib/types';

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'likert',          label: 'Likert Ölçeği' },
  { value: 'yes_no',          label: 'Evet / Hayır' },
  { value: 'single_choice',   label: 'Tek Seçim' },
  { value: 'multiple_choice', label: 'Çoklu Seçim' },
  { value: 'star',            label: 'Yıldız' },
  { value: 'emoji',           label: 'Emoji' },
  { value: 'text',            label: 'Açık Metin' },
];

const LIKERT_PRESETS = [4, 5, 7, 10];

type BooleanQuestionKey = 'required' | 'is_pool_question' | 'has_comment';

const TOGGLE_ITEMS: { key: BooleanQuestionKey; label: string; description: string }[] = [
  { key: 'required',         label: 'Zorunlu soru',  description: 'Boş geçilemez' },
  { key: 'is_pool_question', label: 'Havuz sorusu',  description: 'Diğer templatelerden seçilebilir' },
  { key: 'has_comment',      label: 'Yorum alanı',   description: 'Cevap altında açık metin kutusu' },
];

interface QuestionSettingsPanelProps {
  question: SurveyQuestion;
}

export function QuestionSettingsPanel({ question }: QuestionSettingsPanelProps) {
  const data = useKbStore.useData();
  const upsert = useKbStore.useUpsertSurveyQuestion();
  const update = (patch: Partial<SurveyQuestion>) => upsert({ ...question, ...patch });

  if (!data) return null;

  const drivers = data.survey_drivers;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Soru Ayarları</p>

        {/* Type selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Soru Tipi</Label>
          <Select
            value={question.type}
            onValueChange={val => update({ type: val as QuestionType })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Likert: scale presets */}
        {question.type === 'likert' && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Ölçek Aralığı</Label>
            <div className="flex gap-1.5 flex-wrap">
              {LIKERT_PRESETS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ scale_max: n })}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded border transition-colors',
                    question.scale_max === n
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  1–{n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Star / Emoji: count */}
        {(question.type === 'star' || question.type === 'emoji') && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Seçenek Sayısı</Label>
            <Input
              type="number"
              min={2}
              max={10}
              value={question.scale_max ?? 5}
              onChange={e => update({ scale_max: Math.min(10, Math.max(2, Number(e.target.value))) })}
              className="h-8 text-xs"
            />
          </div>
        )}

        {/* Multiple choice: min/max */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Seçim Sınırları</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">En az</Label>
                <Input
                  type="number"
                  min={1}
                  value={question.multi_min ?? ''}
                  onChange={e => update({ multi_min: e.target.value ? Number(e.target.value) : null })}
                  placeholder="—"
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">En fazla</Label>
                <Input
                  type="number"
                  min={question.multi_min ?? 1}
                  value={question.multi_max ?? ''}
                  onChange={e => update({ multi_max: e.target.value ? Number(e.target.value) : null })}
                  placeholder="—"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Driver selector — Likert only */}
        {question.type === 'likert' && (
          <div className="space-y-1.5 p-3 bg-muted/40 rounded-lg">
            <Label className="text-xs">Driver <span className="text-muted-foreground font-normal">(sadece Likert)</span></Label>
            <Select
              value={question.driver_id ?? '__none__'}
              onValueChange={val => update({ driver_id: val === '__none__' ? null : val })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Driver seç..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="text-xs text-muted-foreground">— Yok —</SelectItem>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">{d.name || 'İsimsiz driver'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Toggles */}
        <div className="space-y-2">
          {TOGGLE_ITEMS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!question[key]}
                onClick={() => update({ [key]: !question[key] })}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  question[key] ? 'bg-primary' : 'bg-input',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
                    question[key] ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
