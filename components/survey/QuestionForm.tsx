'use client';
import { useKbStore } from '@/stores/kbStore';
import { ChoiceOptionList } from '@/components/survey/ChoiceOptionList';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SurveyQuestion } from '@/lib/types';

interface QuestionFormProps {
  question: SurveyQuestion;
  index: number;
}

export function QuestionForm({ question, index }: QuestionFormProps) {
  const upsert = useKbStore.useUpsertSurveyQuestion();
  const update = (patch: Partial<SurveyQuestion>) => upsert({ ...question, ...patch });

  const scaleMax = question.scale_max ?? 5;
  const scaleItems = Array.from({ length: scaleMax }, (_, i) => i + (question.scale_min ?? 1));

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Soru {index + 1}</span>
        <span>·</span>
        <QuestionTypeBadge type={question.type} />
      </div>

      {/* Question text */}
      <Input
        value={question.text}
        onChange={e => update({ text: e.target.value })}
        placeholder="Soru metnini yazın..."
        className="text-base font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        autoFocus
      />

      {/* Description */}
      <Input
        value={question.description ?? ''}
        onChange={e => update({ description: e.target.value || undefined })}
        placeholder="Açıklama ekle (opsiyonel)"
        className="text-sm text-muted-foreground border-none px-0 focus-visible:ring-0 shadow-none"
      />

      {/* Type-specific preview/edit */}
      <div className="rounded-lg border border-border p-4 bg-muted/20">
        {(question.type === 'likert' || question.type === 'star' || question.type === 'emoji') && (
          <div className="flex items-end gap-2 flex-wrap">
            {scaleItems.map((val, i) => (
              <div key={val} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-semibold transition-colors',
                  i === scaleItems.length - 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
                )}>
                  {question.type === 'star' ? '★' : question.type === 'emoji' ? (['😢','😕','😐','🙂','😄','😁','🤩'][i] ?? val) : val}
                </div>
                {(i === 0 || i === scaleItems.length - 1) && (
                  <span className="text-xs text-muted-foreground">
                    {i === 0 ? (question.scale_min ?? 1) : (question.scale_max ?? 5)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {question.type === 'yes_no' && (
          <div className="flex gap-2">
            {['Evet', 'Kararsızım', 'Hayır'].map(label => (
              <Badge key={label} variant="outline" className="text-sm px-4 py-1.5">{label}</Badge>
            ))}
          </div>
        )}

        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <ChoiceOptionList
            options={question.options ?? []}
            onChange={options => update({ options })}
          />
        )}

        {question.type === 'text' && (
          <Textarea placeholder="Kullanıcı buraya yazacak..." rows={3} disabled className="cursor-default" />
        )}
      </div>
    </div>
  );
}
