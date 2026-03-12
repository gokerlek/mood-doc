'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKbStore } from '@/stores/kbStore';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { TemplateCard } from '@/components/survey/TemplateCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { TagFilterBar } from '@/components/shared/TagFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { NoResults } from '@/components/shared/NoResults';
import { Button } from '@/components/ui/button';
import { useSurveyTemplateActions } from '@/hooks/useSurveyTemplateActions';
import { useSearchParam } from '@/hooks/useSearchParam';
import { IconTemplate, IconPlus } from '@tabler/icons-react';

export default function TemplatesPage() {
  const data = useKbStore.useData();
  const { createTemplate, removeTemplate } = useSurveyTemplateActions();
  const router = useRouter();
  const [search] = useSearchParam('q');
  const [activeTag, setActiveTag] = useSearchParam('tag');

  const allTagIds = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.survey_templates.flatMap(t => t.tag_ids))].sort();
  }, [data]);

  if (!data) return null;

  const q = search.toLowerCase().trim();
  const filtered = data.survey_templates
    .filter(t => !activeTag || t.tag_ids.includes(activeTag))
    .filter(t => !q || t.name.toLowerCase().includes(q) || t.purpose.toLowerCase().includes(q));

  const handleCreate = () => {
    const template = createTemplate();
    router.push(`/templates/${template.id}`);
  };

  return (
    <ListPageLayout
      icon={<IconTemplate size={22} className="text-primary" />}
      title="Templateler"
      description="Anket şablonları."
      action={<Button onClick={handleCreate}><IconPlus size={14} /> Yeni Template</Button>}
      maxWidth="5xl"
    >
      <div className="flex flex-col gap-3">
        <SearchBar placeholder="Template ara..." />
        <TagFilterBar tagIds={allTagIds} tags={data.tags} activeTag={activeTag} onSelect={setActiveTag} />
      </div>

      {data.survey_templates.length === 0 ? (
        <EmptyState
          icon={<IconTemplate size={28} />}
          title="Henüz template yok."
          action={<Button variant="link" onClick={handleCreate} className="mt-1 h-auto p-0 text-sm">İlk template&apos;i ekle →</Button>}
        />
      ) : filtered.length === 0 ? (
        <NoResults message="Eşleşen template bulunamadı." onClear={() => setActiveTag('')} clearLabel="Filtreyi temizle" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <TemplateCard key={template.id} template={template} onDelete={removeTemplate} />
          ))}
        </div>
      )}
    </ListPageLayout>
  );
}
