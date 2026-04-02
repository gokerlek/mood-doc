"use client";
import { useState } from "react";
import { useSurveyTemplateActions } from "@/hooks/useSurveyTemplateActions";
import { useQuestionActions } from "@/hooks/useQuestionActions";
import { QuestionList } from "@/components/survey/QuestionList";
import { SurveyFaqSection } from "@/components/survey/SurveyFaqSection";
import { SurveyRuleSection } from "@/components/survey/SurveyRuleSection";
import { GlossarySection } from "@/components/survey/GlossarySection";
import { AddQuestionModal } from "@/components/survey/AddQuestionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { IconPlus, IconTemplate } from "@tabler/icons-react";
import type { SurveyTemplate, SurveyQuestion } from "@/lib/types";

interface TemplateLeftPanelProps {
  template: SurveyTemplate;
  questions: SurveyQuestion[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function TemplateLeftPanel({
  template,
  questions,
  selectedId,
  onSelect,
}: TemplateLeftPanelProps) {
  const { upsertTemplate } = useSurveyTemplateActions();
  const { addQuestion, removeQuestion, reorderQuestions } =
    useQuestionActions(template);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const update = (patch: Partial<SurveyTemplate>) =>
    upsertTemplate({ ...template, ...patch });

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Tabs */}
      <Tabs defaultValue="questions" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full rounded-none border-b border-border shrink-0 h-8">
          <TabsTrigger value="questions" className="flex-1 text-xs h-7">
            Sorular
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex-1 text-xs h-7">
            FAQ
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex-1 text-xs h-7">
            Kurallar
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex-1 text-xs h-7">
            Sözlük
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="questions"
          className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
        >
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "w-full rounded-lg border p-3 text-left transition-colors",
              selectedId === null
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                <IconTemplate size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">
                  Template Metadata
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ad, açıklama, amaç ve etiketleri düzenle.
                </p>
              </div>
            </div>
          </button>
          <QuestionList
            questions={questions}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={removeQuestion}
            onReorder={reorderQuestions}
          />
          <Separator />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => setAddModalOpen(true)}
          >
            <IconPlus size={12} /> Yeni Soru Ekle
          </Button>
        </TabsContent>

        <TabsContent value="faq" className="flex-1 overflow-y-auto p-3">
          <SurveyFaqSection
            faqIds={template.faq_ids}
            context={{ type: "template", template_id: template.id }}
            onAddFaqId={(id) => update({ faq_ids: [...template.faq_ids, id] })}
            onRemoveFaqId={(id) =>
              update({ faq_ids: template.faq_ids.filter((f) => f !== id) })
            }
          />
        </TabsContent>

        <TabsContent value="rules" className="flex-1 overflow-y-auto p-3">
          <SurveyRuleSection
            ruleIds={template.rule_ids}
            context={{ type: "template", template_id: template.id }}
            onAddRuleId={(id) =>
              update({ rule_ids: [...template.rule_ids, id] })
            }
            onRemoveRuleId={(id) =>
              update({ rule_ids: template.rule_ids.filter((r) => r !== id) })
            }
          />
        </TabsContent>

        <TabsContent value="glossary" className="flex-1 overflow-y-auto p-3">
          <GlossarySection
            glossaryIds={template.glossary_ids}
            onAddId={(id) =>
              update({ glossary_ids: [...template.glossary_ids, id] })
            }
            onRemoveId={(id) =>
              update({
                glossary_ids: template.glossary_ids.filter((g) => g !== id),
              })
            }
          />
        </TabsContent>
      </Tabs>

      <AddQuestionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={(type) => {
          const q = addQuestion(type);
          onSelect(q.id);
          setAddModalOpen(false);
        }}
      />
    </div>
  );
}
