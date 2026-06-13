import type { AssessmentHistory } from '@/types';
import type { 
  SessionCreate, 
  SessionResponse, 
  AnswerSubmit, 
  AnswerResponse, 
  ReportResponse,
  SessionDetailResponse,
} from '@/types/backend';
import api from './apiClient';

export const assessmentService = {
  startAssessment: async (payload: SessionCreate, apiKey?: string, provider?: string): Promise<SessionResponse> => {
    const headers: Record<string, string> = {};
    if (apiKey && provider === 'gemini') headers['x-gemini-api-key'] = apiKey;
    if (apiKey && provider === 'groq') headers['x-groq-api-key'] = apiKey;

    const { data } = await api.post<SessionResponse>('/assessments/start', payload, { headers });
    return data;
  },

  evaluateAnswer: async (sessionId: string, payload: AnswerSubmit, apiKey?: string, provider?: string): Promise<AnswerResponse> => {
    const headers: Record<string, string> = {};
    if (apiKey && provider === 'gemini') headers['x-gemini-api-key'] = apiKey;
    if (apiKey && provider === 'groq') headers['x-groq-api-key'] = apiKey;

    const { data } = await api.post<AnswerResponse>(`/assessments/${sessionId}/evaluate`, payload, { headers });
    return data;
  },

  getResults: async (sessionId: string): Promise<ReportResponse> => {
    const { data } = await api.get<ReportResponse>(`/assessments/${sessionId}/results`);
    return data;
  },

  // Fixed: now calls the real backend sessions endpoint
  getAssessmentHistory: async (): Promise<AssessmentHistory[]> => {
    try {
      const { data } = await api.get<SessionDetailResponse[]>('/sessions/');
      
      // Transform backend SessionResponse → frontend AssessmentHistory
      return data.map((session) => {
        const start = new Date(session.created_at).getTime();
        const end = session.completed_at
          ? new Date(session.completed_at).getTime()
          : Date.now();
        const durationSeconds = Math.round((end - start) / 1000);

        return {
          id: session.id,
          topicName: session.topic,
          date: session.created_at,
          duration: durationSeconds,
          score: Math.round(session.overall_score ?? 0),
          totalScore: 100,
          status: session.completed_at ? 'completed' : 'in_progress',
        };
      });
    } catch (error) {
      console.error('Failed to fetch assessment history:', error);
      return [];
    }
  },
};
