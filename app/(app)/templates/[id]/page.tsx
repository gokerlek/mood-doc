'use client';
import { use, useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useKbStore } from '@/stores/kbStore';
import { TemplateLeftPanel } from '@/components/survey/TemplateLeftPanel';
import { QuestionForm } from '@/components/survey/QuestionForm';
import { QuestionSettingsPanel } from '@/components/survey/QuestionSettingsPanel';
import { IconArrowLeft } from '@tabler/icons-react';
import type { SurveyQuestion } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const data = useKbStore.useData();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const template = data?.survey_templates.find(t => t.id === id) ?? null;

  const questions: SurveyQuestion[] = useMemo(() => {
    if (!template || !data) return [];
    return template.question_ids
      .map(qid => data.survey_questions.find(q => q.id === qid))
      .filter((q): q is SurveyQuestion => q != null);
  }, [template, data]);

  const selectedQuestion = selectedQuestionId
    ? questions.find(q => q.id === selectedQuestionId) ?? null
    : null;

  const selectedIndex = selectedQuestion
    ? questions.findIndex(q => q.id === selectedQuestion.id)
    : -1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!questions.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = selectedIndex < questions.length - 1 ? selectedIndex + 1 : 0;
        setSelectedQuestionId(questions[next]!.id);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = selectedIndex > 0 ? selectedIndex - 1 : questions.length - 1;
        setSelectedQuestionId(questions[prev]!.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [questions, selectedIndex]);

  if (!data) return null;
  if (!template) return notFound();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="px-4 py-2 border-b border-border shrink-0 flex items-center gap-3">
        <Link href="/templates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <IconArrowLeft size={14} /> Templateler
        </Link>
        <span className="text-sm font-semibold text-foreground">
          {template.name || 'İsimsiz Template'}
        </span>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: 268px */}
        <div className="shrink-0 border-r border-border overflow-hidden flex flex-col" style={{ width: '268px' }}>
          <TemplateLeftPanel
            template={template}
            questions={questions}
            selectedId={selectedQuestionId}
            onSelect={setSelectedQuestionId}
          />
        </div>

        {/* Middle: flex-1 */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-8">
          {selectedQuestion ? (
            <QuestionForm question={selectedQuestion} index={selectedIndex} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <p className="text-muted-foreground text-sm">
                {questions.length === 0
                  ? 'Soldan "+ Yeni Soru Ekle" ile başlayın.'
                  : 'Düzenlemek için soldan bir soru seçin.'}
              </p>
            </div>
          )}
        </div>

        {/* Right: 296px */}
        <div className="shrink-0 border-l border-border overflow-hidden" style={{ width: '296px' }}>
          {selectedQuestion ? (
            <QuestionSettingsPanel question={selectedQuestion} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted-foreground text-center px-4">
                Bir soru seçince ayarlar burada görünür.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
