import type { LearningRoadmap, LearningModule, LearningProgress } from '@/types';
import type { AiProvider } from '@/store/settingsStore';
import api from './apiClient';

function buildHeaders(provider: AiProvider, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = { 'x-provider': provider };
  if (provider === 'groq') headers['x-groq-api-key'] = apiKey;
  if (provider === 'gemini') headers['x-gemini-api-key'] = apiKey;
  return headers;
}

export const learningService = {
  generateRoadmap: (sessionId: string, language: string, provider: AiProvider, apiKey: string) =>
    api.post<LearningRoadmap>('/learning/roadmap/generate', { session_id: sessionId, language }, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  getRoadmap: (sessionId: string, provider: AiProvider, apiKey: string) =>
    api.get<LearningRoadmap>(`/learning/roadmap/${sessionId}`, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  generateModuleContent: (moduleId: string, provider: AiProvider, apiKey: string) =>
    api.post<LearningModule>('/learning/module/generate-content', { module_id: moduleId }, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  completeModule: (moduleId: string, provider: AiProvider, apiKey: string) =>
    api.post<LearningModule>(`/learning/module/${moduleId}/complete`, {}, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  submitQuiz: (moduleId: string, score: number, provider: AiProvider, apiKey: string) =>
    api.post<LearningModule>('/learning/quiz/submit', { module_id: moduleId, score }, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  getProgress: (sessionId: string, provider: AiProvider, apiKey: string) =>
    api.get<LearningProgress>(`/learning/progress/${sessionId}`, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  searchConcept: (query: string, topic: string, difficulty: string, language: string, provider: AiProvider, apiKey: string) =>
    api.post<{ explanation: string; examples: string | null }>('/learning/search', { query, topic, difficulty, language }, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),

  chat: (roadmapId: string, sessionId: string, question: string, history: { role: string; content: string }[], provider: AiProvider, apiKey: string, moduleId?: string) =>
    api.post<{ answer: string }>('/learning/chat', {
      roadmap_id: roadmapId, session_id: sessionId, module_id: moduleId || null, question, history,
    }, { headers: buildHeaders(provider, apiKey) }).then(r => r.data),
};
