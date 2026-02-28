'use client';
import { useKbStore } from '@/stores/kbStore';
import { IconPuzzle, IconPlus, IconX } from '@tabler/icons-react';
import type { PageSection } from '@/lib/types';

interface ComponentsSectionProps {
  section: Extract<PageSection, { type: 'components' }>;
  nodeId: string;
}

export function ComponentsSection({ section, nodeId }: ComponentsSectionProps) {
  const data = useKbStore.useData();
  const upsertPageSection = useKbStore.useUpsertPageSection();

  if (!data) return null;

  const selectedComponents = data.components.filter(c =>
    section.component_ids.includes(c.id)
  );
  const availableComponents = data.components.filter(c =>
    !section.component_ids.includes(c.id)
  );

  const addComponent = (compId: string) => {
    upsertPageSection(nodeId, {
      ...section,
      component_ids: [...section.component_ids, compId],
    });
  };

  const removeComponent = (compId: string) => {
    upsertPageSection(nodeId, {
      ...section,
      component_ids: section.component_ids.filter(id => id !== compId),
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Componentler
      </p>

      {selectedComponents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedComponents.map(comp => (
            <span
              key={comp.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <IconPuzzle size={11} />
              {comp.name}
              <button
                type="button"
                onClick={() => removeComponent(comp.id)}
                className="hover:text-destructive transition-colors"
                aria-label={`${comp.name} kaldır`}
              >
                <IconX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {availableComponents.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableComponents.map(comp => (
            <button
              key={comp.id}
              type="button"
              onClick={() => addComponent(comp.id)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              <IconPlus size={10} />
              {comp.name}
            </button>
          ))}
        </div>
      )}

      {data.components.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Önce /components sayfasından component oluşturun.
        </p>
      )}
    </div>
  );
}
