import { cn } from '@/lib/utils';
import type { QuestionType } from '@/lib/types';

const TYPE_CONFIG: Record<QuestionType, { label: string; className: string }> = {
  likert:          { label: 'LİKERT',  className: 'bg-qt-likert-bg text-qt-likert-fg' },
  yes_no:          { label: 'E/H',     className: 'bg-qt-yesno-bg text-qt-yesno-fg' },
  single_choice:   { label: 'TEK',     className: 'bg-qt-single-bg text-qt-single-fg' },
  multiple_choice: { label: 'ÇOKLU',   className: 'bg-qt-multi-bg text-qt-multi-fg' },
  star:            { label: 'YILDIZ',  className: 'bg-qt-star-bg text-qt-star-fg' },
  emoji:           { label: 'EMOJİ',   className: 'bg-qt-emoji-bg text-qt-emoji-fg' },
  text:            { label: 'METİN',   className: 'bg-qt-text-bg text-qt-text-fg' },
};

interface QuestionTypeBadgeProps {
  type: QuestionType;
  className?: string;
}

export function QuestionTypeBadge({ type, className }: QuestionTypeBadgeProps) {
  const { label, className: colorClass } = TYPE_CONFIG[type];
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold', colorClass, className)}>
      {label}
    </span>
  );
}
