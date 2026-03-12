'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/lib/types';

interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  description: string;
  preview: string;
}

const TYPES: QuestionTypeOption[] = [
  { type: 'likert',          label: 'Likert Ölçeği', description: 'Sayısal derecelendirme (1-5, 1-10...)', preview: '1  2  3  4  5' },
  { type: 'yes_no',          label: 'Evet / Hayır',  description: '3 sabit seçenek',                       preview: 'Evet · Kararsızım · Hayır' },
  { type: 'single_choice',   label: 'Tek Seçim',     description: 'Özel liste, bir cevap',                 preview: '○ Seçenek A  ○ Seçenek B' },
  { type: 'multiple_choice', label: 'Çoklu Seçim',   description: 'Özel liste, birden fazla',              preview: '☑ Seçenek A  ☐ Seçenek B' },
  { type: 'star',            label: 'Yıldız',        description: 'Yıldız derecelendirme',                 preview: '★ ★ ★ ★ ☆' },
  { type: 'emoji',           label: 'Emoji',         description: '5 emoji seçenek',                       preview: '😢 😕 😐 🙂 😄' },
  { type: 'text',            label: 'Açık Metin',    description: 'Serbest metin girişi',                  preview: 'Yazın...' },
];

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: QuestionType) => void;
}

export function AddQuestionModal({ open, onClose, onAdd }: AddQuestionModalProps) {
  const [selected, setSelected] = useState<QuestionType | null>(null);

  const handleAdd = () => {
    if (!selected) return;
    onAdd(selected);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { setSelected(null); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Soru Tipi Seç</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {TYPES.map(({ type, label, description, preview }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelected(type)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                selected === type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground mb-1.5">{description}</p>
              <p className="text-xs text-muted-foreground/70 font-mono">{preview}</p>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button disabled={!selected} onClick={handleAdd}>Ekle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
