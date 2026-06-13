import { create } from 'zustand';
import type { Answer, SessionStats, Difficulty, Topic } from '@/types';
import type { SessionQuestion, TurnResponse } from '@/types/backend';
import { assessmentService } from '@/services/assessmentService';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

// Maps each AI provider to its correct default model name
const PROVIDER_MODEL_MAP: Record<string, string> = {
  ollama: 'llama3',
  gemini: 'gemini-2.5-flash',
  groq: 'llama-3.1-8b-instant',
};

interface InterviewState {
  topic: Topic | null;
  difficulty: Difficulty;
  sessionId: string | null;
  currentQuestion: SessionQuestion | null;
  history: TurnResponse[];
  isComplete: boolean;
  isLoading: boolean;
  currentAnswer: string;
  isSubmitting: boolean;
  elapsedSeconds: number;
  apiKey: string;
  provider: string;

  setApiKey: (key: string) => void;
  setProvider: (provider: string) => void;
  setCurrentAnswer: (answer: string) => void;
  setTopic: (topic: Topic) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  startInterview: () => Promise<void>;
  submitAnswer: () => Promise<void>;
  tick: () => void;
  reset: () => void;
  getSessionStats: () => SessionStats;
}

export const useInterviewStore = create<InterviewState>()((set, get) => ({
  topic: null,
  difficulty: 'beginner',
  sessionId: null,
  currentQuestion: null,
  history: [],
  isComplete: false,
  isLoading: false,
  currentAnswer: '',
  isSubmitting: false,
  elapsedSeconds: 0,
  apiKey: '',
  provider: 'gemini',

  setTopic: (topic: Topic) => set({ topic }),
  setDifficulty: (difficulty: Difficulty) => set({ difficulty }),
  setApiKey: (apiKey) => set({ apiKey }),
  setProvider: (provider) => set({ provider, apiKey: '' }),
  setCurrentAnswer: (currentAnswer) => set({ currentAnswer }),
  tick: () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  startInterview: async () => {
    const { topic, apiKey, provider, difficulty } = get();
    if (!topic || !apiKey) {
      console.error("Missing topic or API Key");
      return;
    }

    const model = PROVIDER_MODEL_MAP[provider] || 'gemini-2.5-flash';
    const difficultyTurns: Record<string, number> = { beginner: 6, intermediate: 8, advanced: 10 };

    set({ isLoading: true });
    try {
      const response = await assessmentService.startAssessment({
        user_id: 'guest',
        topic: topic.name,
        language: 'en',
        provider,
        model,
        difficulty,
        max_turns: difficultyTurns[difficulty] || 6,
      }, apiKey, provider);

      set({
        sessionId: response.id,
        currentQuestion: response.first_question || null,
        history: [],
        isComplete: false,
        isLoading: false,
        currentAnswer: '',
      });
    } catch (error) {
      console.error("Failed to start assessment:", error);
      set({ isLoading: false });
    }
  },

  // Fixed: removed duplicate broken submitAnswer — keeping only the correct one
  submitAnswer: async () => {
    const { sessionId, currentQuestion, currentAnswer, history, apiKey, provider } = get();
    if (!sessionId || !currentQuestion || !currentAnswer.trim()) return;

    set({ isSubmitting: true });
    try {
      const response = await assessmentService.evaluateAnswer(
        sessionId,
        { answer_text: currentAnswer },
        apiKey,
        provider
      );

      const completedTurn: TurnResponse = {
        id: crypto.randomUUID(),
        turn_number: currentQuestion.turn_number,
        question_text: currentQuestion.question_text,
        answer_text: currentAnswer,
        score: response.evaluation.score,
        correctness: response.evaluation.correctness,
        completeness: response.evaluation.completeness,
        depth: response.evaluation.depth,
        missing_concepts: response.evaluation.missing_concepts,
        misconceptions: response.evaluation.misconceptions,
        created_at: new Date().toISOString(),
      };

      set({
        history: [...history, completedTurn],
        currentQuestion: response.next_question || null,
        isComplete: response.completed,
        currentAnswer: '',
        isSubmitting: false,
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      set({ isSubmitting: false });
    }
  },

  reset: () =>
    set({
      sessionId: null,
      currentQuestion: null,
      history: [],
      isComplete: false,
      isLoading: false,
      currentAnswer: '',
      isSubmitting: false,
      elapsedSeconds: 0,
    }),

  getSessionStats: () => {
    const { history, elapsedSeconds } = get();
    const answeredQuestions = history.length;
    const correctAnswers = history.filter((h) => (h.score || 0) >= 60).length;
    const totalScore = history.reduce((acc, h) => acc + (h.score || 0), 0);
    const averageScore = answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
    const totalQuestions = (() => {
      const d = get().difficulty;
      return d === 'advanced' ? 10 : d === 'intermediate' ? 8 : 6;
    })();

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      averageScore,
      timeElapsed: elapsedSeconds,
    };
  },
}));
