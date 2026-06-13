import { create } from 'zustand';
import type {
  AssessmentResult,
  AssessmentHistory,
  SkillScore,
  KnowledgeGap,
  RoadmapMilestone,
} from '@/types';
import { assessmentService } from '@/services/assessmentService';
import { useInterviewStore } from '@/store/interviewStore';

interface AssessmentState {
  currentResult: AssessmentResult | null;
  selectedHistoryItem: AssessmentHistory | null;
  history: AssessmentHistory[];
  isLoading: boolean;
  error: string | null;

  generateResult: (topicId: string, topicName: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  resetResult: () => void;
  setSelectedHistoryItem: (item: AssessmentHistory | null) => void;
}

export const useAssessmentStore = create<AssessmentState>()((set, get) => ({
  currentResult: null,
  selectedHistoryItem: null,
  history: [],
  isLoading: false,
  error: null,

  generateResult: async (topicId: string, topicName: string) => {
    set({ isLoading: true, error: null });
    try {
      const { sessionId, getSessionStats } = useInterviewStore.getState();
      const stats = getSessionStats();
      const currentScore = Math.round(stats.averageScore) || 60;
      const duration = stats.timeElapsed || 300;

      let report = null;
      if (sessionId) {
        try {
          report = await assessmentService.getResults(sessionId);
        } catch {
          console.warn('Failed to fetch report from backend, using local data');
        }
      }

      const skillScores: SkillScore[] = report
        ? Object.entries(report.skill_xray).map(([skill, score]) => ({
            skill,
            score: Math.round(score),
            maxScore: 100,
            level: score >= 80 ? 'advanced' as const : score >= 60 ? 'intermediate' as const : 'beginner' as const,
          }))
        : [
            { skill: `${topicName} Fundamentals`, score: currentScore, maxScore: 100, level: currentScore >= 80 ? 'advanced' as const : currentScore >= 60 ? 'intermediate' as const : 'beginner' as const },
          ];

      const knowledgeGaps: KnowledgeGap[] = report
        ? [
            ...report.weak_areas.map((w, i) => ({
              concept: w,
              status: 'weak' as const,
              description: w,
              suggestedResources: [],
            })),
            ...report.strengths.map((s, i) => ({
              concept: s,
              status: 'strength' as const,
              description: s,
              suggestedResources: [],
            })),
          ]
        : [];

      const roadmap: RoadmapMilestone[] = report
        ? report.roadmap.map((r, i) => ({
            week: r.week,
            title: r.title,
            description: r.description,
            topics: [],
            status: (i === 0 ? 'in_progress' : 'locked') as 'in_progress' | 'locked' | 'completed',
            resources: [],
          }))
        : [];

      const result: AssessmentResult = {
        id: sessionId || `result-${Date.now()}`,
        topicId,
        topicName,
        date: new Date().toISOString(),
        duration,
        score: currentScore,
        totalScore: 100,
        status: 'completed',
        skillScores,
        knowledgeGaps,
        roadmap,
      };

      let history = get().history;
      if (history.length === 0) {
        history = await assessmentService.getAssessmentHistory();
      }

      const currentAssessment: AssessmentHistory = {
        id: sessionId || `current-${Date.now()}`,
        topicName,
        date: new Date().toISOString(),
        duration,
        score: currentScore,
        totalScore: 100,
        status: 'completed',
      };

      set({
        currentResult: result,
        history: [currentAssessment, ...history],
        isLoading: false,
      });
    } catch (err) {
      console.error('generateResult failed:', err);
      set({ error: 'Failed to generate results', isLoading: false });
    }
  },

  loadHistory: async () => {
    const data = await assessmentService.getAssessmentHistory();
    set({ history: data });
  },

  resetResult: () => set({ currentResult: null, selectedHistoryItem: null, error: null }),

  setSelectedHistoryItem: (item) => set({ selectedHistoryItem: item }),
}));
