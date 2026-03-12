'use client';
import { useKbStore } from '@/stores/kbStore';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { QuestionTypeCard } from '@/components/survey/QuestionTypeCard';
import { IconListDetails } from '@tabler/icons-react';

export default function QuestionTypesPage() {
  const data = useKbStore.useData();
  if (!data) return null;

  return (
    <ListPageLayout
      icon={<IconListDetails size={22} className="text-primary" />}
      title="Soru Tipleri"
      description="Anketlerde kullanılabilen sabit soru tipi tanımları."
      maxWidth="5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.survey_question_types.map(typeDef => (
          <QuestionTypeCard key={typeDef.key} typeDef={typeDef} />
        ))}
      </div>
    </ListPageLayout>
  );
}
