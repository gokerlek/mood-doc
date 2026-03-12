'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import type { SurveyQuestionTypeDef } from '@/lib/types';
import { useKbStore } from '@/stores/kbStore';

interface QuestionTypeCardProps {
  typeDef: SurveyQuestionTypeDef;
}

export function QuestionTypeCard({ typeDef }: QuestionTypeCardProps) {
  const data = useKbStore.useData();
  const tags = (data?.tags ?? []).filter(t => typeDef.tag_ids.includes(t.id));

  return (
    <Link href={`/question-types/${typeDef.key}`}>
      <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <QuestionTypeBadge type={typeDef.key} />
          <span className="font-semibold text-sm">{typeDef.name}</span>
        </div>
        {typeDef.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{typeDef.description}</p>
        )}
        <div className="flex gap-1 flex-wrap mt-auto">
          {tags.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.label}</Badge>)}
          {typeDef.faq_ids.length > 0 && (
            <Badge variant="outline" className="text-xs">FAQ ({typeDef.faq_ids.length})</Badge>
          )}
          {typeDef.rule_ids.length > 0 && (
            <Badge variant="outline" className="text-xs">Kural ({typeDef.rule_ids.length})</Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
