'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTrash, IconQuestionMark } from '@tabler/icons-react';
import type { SurveyTemplate } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';

interface TemplateCardProps {
  template: SurveyTemplate;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => template.tag_ids.includes(t.id));
  const questionCount = template.question_ids.length;
  const title = template.survey_title || template.name;
  const summary = template.short_description || template.survey_description || template.purpose;

  return (
    <Card className="p-4 flex flex-col gap-2 group hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/templates/${template.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
            {title || <span className="text-muted-foreground italic">İsimsiz template</span>}
          </p>
        </Link>
        <Button
          variant="ghost" size="icon"
          className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(template.id)}
        >
          <IconTrash size={13} />
        </Button>
      </div>
      {summary && (
        <p className="text-xs text-muted-foreground line-clamp-2">{summary}</p>
      )}
      <div className="flex gap-1 flex-wrap items-center mt-auto">
        <Badge variant="outline" className="text-xs gap-1">
          <IconQuestionMark size={9} />{questionCount} soru
        </Badge>
        {tags.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.label}</Badge>)}
      </div>
    </Card>
  );
}
