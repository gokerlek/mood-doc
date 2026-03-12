import { useKbStore } from '@/stores/kbStore';
import { emptyTemplate } from '@/lib/defaults';
import { toast } from 'sonner';

export function useSurveyTemplateActions() {
  const upsertTemplate = useKbStore.useUpsertSurveyTemplate();
  const deleteTemplate = useKbStore.useDeleteSurveyTemplate();

  const createTemplate = () => {
    const template = emptyTemplate();
    upsertTemplate(template);
    return template;
  };

  const removeTemplate = (id: string) => {
    deleteTemplate(id);
    toast.success('Template silindi');
  };

  return { createTemplate, removeTemplate, upsertTemplate };
}
