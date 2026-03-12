import { useKbStore } from '@/stores/kbStore';
import { emptyDriver } from '@/lib/defaults';
import { toast } from 'sonner';

export function useDriverActions() {
  const upsertDriver = useKbStore.useUpsertSurveyDriver();
  const deleteDriver = useKbStore.useDeleteSurveyDriver();

  const createDriver = () => {
    const driver = emptyDriver();
    upsertDriver(driver);
    return driver;
  };

  const removeDriver = (id: string) => {
    deleteDriver(id);
    toast.success('Driver silindi');
  };

  return { createDriver, removeDriver, upsertDriver };
}
