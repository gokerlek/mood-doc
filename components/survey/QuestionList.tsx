'use client';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionTypeBadge } from '@/components/survey/QuestionTypeBadge';
import { Button } from '@/components/ui/button';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { SurveyQuestion } from '@/lib/types';

interface QuestionListProps {
  questions: SurveyQuestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
}

interface SortableItemProps {
  question: SurveyQuestion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableItem({ question, index, isSelected, onSelect, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-pointer transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/50',
        isDragging && 'opacity-50',
      )}
      onClick={onSelect}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        onClick={e => e.stopPropagation()}
      >
        <IconGripVertical size={13} />
      </button>
      <span className="text-xs text-muted-foreground w-4 shrink-0">{index + 1}</span>
      <QuestionTypeBadge type={question.type} className="shrink-0" />
      <span className="text-xs flex-1 truncate">
        {question.text || <span className="text-muted-foreground italic">Soru metni yok</span>}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive"
        onClick={e => { e.stopPropagation(); onDelete(); }}
      >
        <IconTrash size={11} />
      </Button>
    </div>
  );
}

export function QuestionList({ questions, selectedId, onSelect, onDelete, onReorder }: QuestionListProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);
    onReorder(arrayMove(questions, oldIndex, newIndex).map(q => q.id));
  };

  if (questions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Henüz soru yok. Aşağıdan ekleyin.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {questions.map((q, i) => (
            <SortableItem
              key={q.id}
              question={q}
              index={i}
              isSelected={selectedId === q.id}
              onSelect={() => onSelect(q.id)}
              onDelete={() => onDelete(q.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
