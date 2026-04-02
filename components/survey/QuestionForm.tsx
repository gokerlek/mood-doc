"use client";
import { useKbStore } from "@/stores/kbStore";
import { ChoiceOptionList } from "@/components/survey/ChoiceOptionList";
import { QuestionTypeBadge } from "@/components/survey/QuestionTypeBadge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SurveyQuestion } from "@/lib/types";

interface QuestionFormProps {
  question: SurveyQuestion;
  index: number;
}

export function QuestionForm({ question, index }: QuestionFormProps) {
  const upsert = useKbStore.useUpsertSurveyQuestion();
  const update = (patch: Partial<SurveyQuestion>) =>
    upsert({ ...question, ...patch });

  const scaleMax = question.scale_max ?? 5;
  const scaleItems = Array.from(
    { length: scaleMax },
    (_, i) => i + (question.scale_min ?? 1),
  );

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Soru {index + 1}</span>
        <QuestionTypeBadge type={question.type} />
      </div>

      {/* Question text */}
      <Label>Soru Metni</Label>
      <Textarea
        value={question.text}
        onChange={(e) => update({ text: e.target.value })}
        placeholder="Soru metnini yazın..."
        autoFocus
        className="min-h-8"
      />

      {/* Description */}
      <Label>Açıklama</Label>
      <Textarea
        value={question.description ?? ""}
        onChange={(e) => update({ description: e.target.value || undefined })}
        placeholder="Açıklama ekle (opsiyonel)"
      />

      {/* Type-specific preview/edit */}
      <Label>Soru Önizleme</Label>
      <div className="rounded-lg border border-border p-4 bg-muted/20">
        {(question.type === "likert" ||
          question.type === "star" ||
          question.type === "emoji") && (
          <div className="flex items-end gap-2 flex-wrap justify-center">
            {scaleItems.map((val, i) => (
              <div key={val} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-semibold transition-colors",
                    i === scaleItems.length - 1
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {question.type === "star"
                    ? "★"
                    : question.type === "emoji"
                      ? (["😢", "😕", "😐", "🙂", "😄", "😁", "🤩"][i] ?? val)
                      : val}
                </div>
              </div>
            ))}
          </div>
        )}

        {question.type === "yes_no" && (
          <div className="flex gap-2">
            {["Evet", "Kararsızım", "Hayır"].map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="text-sm px-4 py-1.5"
              >
                {label}
              </Badge>
            ))}
          </div>
        )}

        {(question.type === "single_choice" ||
          question.type === "multiple_choice") && (
          <ChoiceOptionList
            options={question.options ?? []}
            onChange={(options) => update({ options })}
          />
        )}

        {question.type === "text" && (
          <Textarea
            placeholder="Kullanıcı buraya yazacak..."
            rows={3}
            disabled
            className="cursor-default"
          />
        )}
      </div>
    </div>
  );
}
