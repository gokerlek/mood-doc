// __tests__/stores/surveyStore.test.ts
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { useKbStoreBase } from '@/stores/kbStore';
import { emptyKnowledgeBase, emptyDriver, emptyTemplate, emptyQuestion, SEED_QUESTION_TYPES } from '@/lib/defaults';

// Mock localStorage for zustand persist
beforeAll(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

// Access raw store state (before createSelectorHooks wraps it)
function getStore() {
  return useKbStoreBase.getState();
}

describe('Survey store actions', () => {
  beforeEach(() => {
    getStore().setData(emptyKnowledgeBase());
  });

  describe('upsertSurveyDriver', () => {
    it('adds a new driver', () => {
      const driver = emptyDriver();
      driver.name = 'Motivasyon';
      getStore().upsertSurveyDriver(driver);
      expect(getStore().data?.survey_drivers).toHaveLength(1);
      expect(getStore().data!.survey_drivers[0]!.name).toBe('Motivasyon');
    });

    it('updates an existing driver', () => {
      const driver = emptyDriver();
      getStore().upsertSurveyDriver(driver);
      getStore().upsertSurveyDriver({ ...driver, name: 'Updated' });
      expect(getStore().data?.survey_drivers).toHaveLength(1);
      expect(getStore().data!.survey_drivers[0]!.name).toBe('Updated');
    });

    it('sets isDirty', () => {
      getStore().upsertSurveyDriver(emptyDriver());
      expect(getStore().isDirty).toBe(true);
    });
  });

  describe('deleteSurveyDriver', () => {
    it('removes the driver', () => {
      const driver = emptyDriver();
      getStore().upsertSurveyDriver(driver);
      getStore().deleteSurveyDriver(driver.id);
      expect(getStore().data?.survey_drivers).toHaveLength(0);
    });

    it('nullifies driver_id on related questions (cascade)', () => {
      const driver = emptyDriver();
      getStore().upsertSurveyDriver(driver);
      const q = emptyQuestion('likert');
      q.driver_id = driver.id;
      getStore().upsertSurveyQuestion(q);
      getStore().deleteSurveyDriver(driver.id);
      expect(getStore().data!.survey_questions[0]!.driver_id).toBeNull();
    });
  });

  describe('upsertSurveyQuestion / deleteSurveyQuestion', () => {
    it('adds a question', () => {
      const q = emptyQuestion('text');
      getStore().upsertSurveyQuestion(q);
      expect(getStore().data?.survey_questions).toHaveLength(1);
    });

    it('removes question from template question_ids on delete (cascade)', () => {
      const q = emptyQuestion('text');
      getStore().upsertSurveyQuestion(q);
      const tmpl = emptyTemplate();
      tmpl.question_ids = [q.id];
      getStore().upsertSurveyTemplate(tmpl);
      getStore().deleteSurveyQuestion(q.id);
      expect(getStore().data?.survey_questions).toHaveLength(0);
      expect(getStore().data!.survey_templates[0]!.question_ids).toHaveLength(0);
    });
  });

  describe('reorderTemplateQuestions', () => {
    it('updates question_ids order', () => {
      const tmpl = emptyTemplate();
      tmpl.question_ids = ['a', 'b', 'c'];
      getStore().upsertSurveyTemplate(tmpl);
      getStore().reorderTemplateQuestions(tmpl.id, ['c', 'a', 'b']);
      expect(getStore().data!.survey_templates[0]!.question_ids).toEqual(['c', 'a', 'b']);
    });
  });

  describe('upsertSurveyQuestionType', () => {
    it('updates documentation fields but preserves key', () => {
      getStore().upsertSurveyQuestionType({ ...SEED_QUESTION_TYPES[0], name: 'Updated Name' });
      const qt = getStore().data?.survey_question_types.find(t => t.key === 'likert');
      expect(qt?.name).toBe('Updated Name');
      expect(qt?.key).toBe('likert');
    });
  });
});
