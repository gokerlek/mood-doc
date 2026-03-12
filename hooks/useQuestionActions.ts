import { useKbStore } from '@/stores/kbStore';
import { emptyQuestion } from '@/lib/defaults';
import type { QuestionType, SurveyTemplate } from '@/lib/types';
import { toast } from 'sonner';

export function useQuestionActions(template: SurveyTemplate) {
  const upsertQuestion = useKbStore.useUpsertSurveyQuestion();
  const deleteQuestion = useKbStore.useDeleteSurveyQuestion();
  const upsertTemplate = useKbStore.useUpsertSurveyTemplate();
  const reorder = useKbStore.useReorderTemplateQuestions();

  const addQuestion = (type: QuestionType) => {
    const q = emptyQuestion(type);
    upsertQuestion(q);
    upsertTemplate({ ...template, question_ids: [...template.question_ids, q.id] });
    return q;
  };

  const removeQuestion = (id: string) => {
    deleteQuestion(id);
    toast.success('Soru silindi');
  };

  const reorderQuestions = (question_ids: string[]) => {
    reorder(template.id, question_ids);
  };

  return { addQuestion, removeQuestion, reorderQuestions };
}
