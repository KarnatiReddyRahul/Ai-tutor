import { create } from 'zustand';
import type { LearningRoadmap, LearningModule, LearningProgress } from '@/types';
import type { AiProvider } from '@/store/settingsStore';
import { learningService } from '@/services/learningService';
import { useSettingsStore } from '@/store/settingsStore';

interface LearningState {
  roadmap: LearningRoadmap | null;
  currentModule: LearningModule | null;
  progress: LearningProgress | null;
  isLoading: boolean;
  error: string | null;

  generateRoadmap: (sessionId: string, language: string) => Promise<void>;
  loadRoadmap: (sessionId: string) => Promise<void>;
  loadModuleContent: (moduleId: string) => Promise<void>;
  completeModule: (moduleId: string) => Promise<void>;
  submitQuiz: (moduleId: string, score: number) => Promise<LearningModule>;
  loadProgress: (sessionId: string) => Promise<void>;
  setCurrentModule: (module: LearningModule | null) => void;
  reset: () => void;
}

function getCredentials() {
  const s = useSettingsStore.getState();
  return { provider: s.provider, apiKey: s.apiKey };
}

export const useLearningStore = create<LearningState>((set, get) => ({
  roadmap: null,
  currentModule: null,
  progress: null,
  isLoading: false,
  error: null,

  generateRoadmap: async (sessionId, language) => {
    set({ isLoading: true, error: null });
    try {
      const { provider, apiKey } = getCredentials();
      const roadmap = await learningService.generateRoadmap(sessionId, language, provider, apiKey);
      set({ roadmap, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  loadRoadmap: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const { provider, apiKey } = getCredentials();
      const roadmap = await learningService.getRoadmap(sessionId, provider, apiKey);
      set({ roadmap, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  loadModuleContent: async (moduleId) => {
    set({ isLoading: true, error: null });
    try {
      const { provider, apiKey } = getCredentials();
      const moduleData = await learningService.generateModuleContent(moduleId, provider, apiKey);
      set({ currentModule: moduleData, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  completeModule: async (moduleId) => {
    try {
      const { provider, apiKey } = getCredentials();
      const updated = await learningService.completeModule(moduleId, provider, apiKey);
      const state = get();
      if (state.roadmap) {
        const modules = state.roadmap.modules.map(m =>
          m.id === moduleId ? { ...m, ...updated } : m
        );
        set({ roadmap: { ...state.roadmap, modules } });
      }
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  submitQuiz: async (moduleId, score) => {
    const { provider, apiKey } = getCredentials();
    const updated = await learningService.submitQuiz(moduleId, score, provider, apiKey);
    const state = get();
    if (state.roadmap) {
      const modules = state.roadmap.modules.map(m =>
        m.id === moduleId ? { ...m, ...updated } : m
      );
      set({ roadmap: { ...state.roadmap, modules }, currentModule: updated });
    }
    return updated;
  },

  loadProgress: async (sessionId) => {
    try {
      const { provider, apiKey } = getCredentials();
      const progress = await learningService.getProgress(sessionId, provider, apiKey);
      set({ progress });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  setCurrentModule: (module) => set({ currentModule: module }),
  reset: () => set({ roadmap: null, currentModule: null, progress: null, error: null }),
}));
