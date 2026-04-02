"use client";

import { useSurveyTemplateActions } from "@/hooks/useSurveyTemplateActions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { SurveyTemplate } from "@/lib/types";

interface TemplateMetadataFormProps {
  template: SurveyTemplate;
}

export function TemplateMetadataForm({
  template,
}: TemplateMetadataFormProps) {
  const { upsertTemplate } = useSurveyTemplateActions();
  const update = (patch: Partial<SurveyTemplate>) =>
    upsertTemplate({ ...template, ...patch });
  const measuredTopics = template.measured_topics ?? [];

  const updateMeasuredTopic = (index: number, value: string) => {
    update({
      measured_topics: measuredTopics.map((topic, topicIndex) =>
        topicIndex === index ? value : topic,
      ),
    });
  };

  const addMeasuredTopic = () => {
    update({ measured_topics: [...measuredTopics, ""] });
  };

  const removeMeasuredTopic = (index: number) => {
    update({
      measured_topics: measuredTopics.filter((_, topicIndex) => topicIndex !== index),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Template Metadata</span>
      </div>

      <div className="space-y-1.5">
        <Label>Template Adı</Label>
        <Textarea
          value={template.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Template adı..."
          className="min-h-8 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Template Açıklaması</Label>
        <Textarea
          value={template.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Template açıklaması..."
          rows={3}
        />
      </div>

        <div className="space-y-1.5">
            <Label>Kısa Template Açıklaması</Label>
            <Textarea
                value={template.short_description}
                onChange={(e) => update({ short_description: e.target.value })}
                placeholder="Kisa template aciklamasi..."
                rows={3}
            />
        </div>

      <div className="space-y-1.5">
        <Label>Anket Adı</Label>
        <Textarea
          value={template.survey_title}
          onChange={(e) => update({ survey_title: e.target.value })}
          placeholder="Anket adı..."
          className="min-h-8 resize-none"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label>Anket Açıklaması</Label>
        <Textarea
          value={template.survey_description}
          onChange={(e) => update({ survey_description: e.target.value })}
          placeholder="Anket açıklaması..."
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label>Neleri Ölçümler</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={addMeasuredTopic}
          >
            <IconPlus size={12} /> Alan Ekle
          </Button>
        </div>
        <div className="space-y-2">
          {measuredTopics.length > 0 ? (
            measuredTopics.map((topic, index) => (
              <div key={`${index}-${topic}`} className="flex items-center gap-2">
                <Input
                  value={topic}
                  onChange={(e) => updateMeasuredTopic(index, e.target.value)}
                  placeholder="Olculen alan..."
                  className="h-9"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMeasuredTopic(index)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              Henuz olcum alani eklenmedi.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Neden bu anketi yapmalısınız?</Label>
        <Textarea
          value={template.why_take_survey}
          onChange={(e) => update({ why_take_survey: e.target.value })}
          placeholder="Bu anketin neden yapilmasi gerektigini aciklayin..."
          rows={4}
        />
      </div>


    </div>
  );
}
