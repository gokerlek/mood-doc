'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TagSelector } from '@/components/tags/TagSelector';
import { SurveyFaqSection } from '@/components/survey/SurveyFaqSection';
import { SurveyRuleSection } from '@/components/survey/SurveyRuleSection';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ key: string }>;
}

export default function QuestionTypeDetailPage({ params }: PageProps) {
  const { key } = use(params);
  const data = useKbStore.useData();
  const upsertSurveyQuestionType = useKbStore.useUpsertSurveyQuestionType();

  if (!data) return null;

  const typeDef = data.survey_question_types.find(t => t.key === key);
  if (!typeDef) return notFound();

  const update = (patch: Partial<typeof typeDef>) =>
    upsertSurveyQuestionType({ ...typeDef, ...patch });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link href="/question-types" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <IconArrowLeft size={14} /> Soru Tipleri
        </Link>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Info */}
        <div className="w-72 shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <QuestionTypeBadge type={typeDef.key} />
            <span className="text-xs text-muted-foreground">sabit tip</span>
          </div>
          <Input
            value={typeDef.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Tip adı..."
            className="font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
          />
          <Textarea
            value={typeDef.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="Açıklama..."
            rows={4}
          />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
            <TagSelector selectedIds={typeDef.tag_ids} onChange={tag_ids => update({ tag_ids })} />
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="faq">
            <TabsList>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="rules">Kurallar</TabsTrigger>
            </TabsList>
            <Separator className="my-3" />
            <TabsContent value="faq">
              <SurveyFaqSection
                faqIds={typeDef.faq_ids}
                context={{ type: 'question_type', question_type_key: typeDef.key }}
                onAddFaqId={id => update({ faq_ids: [...typeDef.faq_ids, id] })}
                onRemoveFaqId={id => update({ faq_ids: typeDef.faq_ids.filter(f => f !== id) })}
              />
            </TabsContent>
            <TabsContent value="rules">
              <SurveyRuleSection
                ruleIds={typeDef.rule_ids}
                context={{ type: 'question_type', question_type_key: typeDef.key }}
                onAddRuleId={id => update({ rule_ids: [...typeDef.rule_ids, id] })}
                onRemoveRuleId={id => update({ rule_ids: typeDef.rule_ids.filter(r => r !== id) })}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
