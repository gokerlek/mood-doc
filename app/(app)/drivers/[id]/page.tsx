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
import { IconArrowLeft } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DriverDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const upsertDriver = useKbStore.useUpsertSurveyDriver();

  if (!data) return null;

  const driver = data.survey_drivers.find(d => d.id === id);
  if (!driver) return notFound();

  const update = (patch: Partial<typeof driver>) =>
    upsertDriver({ ...driver, ...patch });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-b border-border shrink-0">
        <Link href="/drivers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <IconArrowLeft size={14} /> Driverlar
        </Link>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Info */}
        <div className="w-72 shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
          <Input
            value={driver.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Driver adı..."
            className="font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
          />
          <Textarea
            value={driver.description}
            onChange={e => update({ description: e.target.value })}
            placeholder="Açıklama..."
            rows={4}
          />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Taglar</p>
            <TagSelector selectedIds={driver.tag_ids} onChange={tag_ids => update({ tag_ids })} />
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
                faqIds={driver.faq_ids}
                context={{ type: 'driver', driver_id: driver.id }}
                onAddFaqId={faqId => update({ faq_ids: [...driver.faq_ids, faqId] })}
                onRemoveFaqId={faqId => update({ faq_ids: driver.faq_ids.filter(f => f !== faqId) })}
              />
            </TabsContent>
            <TabsContent value="rules">
              <SurveyRuleSection
                ruleIds={driver.rule_ids}
                context={{ type: 'driver', driver_id: driver.id }}
                onAddRuleId={ruleId => update({ rule_ids: [...driver.rule_ids, ruleId] })}
                onRemoveRuleId={ruleId => update({ rule_ids: driver.rule_ids.filter(r => r !== ruleId) })}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
