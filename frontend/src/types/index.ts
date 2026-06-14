export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Language = 'en' | 'te' | 'hi';

export type Theme = 'light' | 'dark' | 'system';

export type AssessmentStatus = 'completed' | 'in_progress' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  joinedDate: string;
  totalAssessments: number;
  averageScore: number;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface Topic {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

export interface Question {
  id: string;
  text: string;
  topicId: string;
  difficulty: Difficulty;
  hints: string[];
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  timestamp: string;
}

export interface SkillScore {
  skill: string;
  score: number;
  maxScore: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface KnowledgeGap {
  concept: string;
  status: 'strength' | 'weak' | 'missing';
  description: string;
  suggestedResources: string[];
}

export interface RoadmapMilestone {
  week: number;
  title: string;
  description: string;
  topics: string[];
  status: 'completed' | 'in_progress' | 'locked';
  resources: string[];
}

export interface AssessmentResult {
  id: string;
  topicId: string;
  topicName: string;
  date: string;
  duration: number;
  score: number;
  totalScore: number;
  status: AssessmentStatus;
  skillScores: SkillScore[];
  knowledgeGaps: KnowledgeGap[];
  roadmap: RoadmapMilestone[];
}

export interface AssessmentHistory {
  id: string;
  topicName: string;
  date: string;
  duration: number;
  score: number;
  totalScore: number;
  status: AssessmentStatus;
}

export interface InterviewState {
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[];
  isComplete: boolean;
  startTime: string | null;
  elapsedSeconds: number;
}

export interface SessionStats {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  averageScore: number;
  timeElapsed: number;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: string;
}

export interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: string;
}

export interface LearningModule {
  id: string;
  roadmap_id: string;
  week_number: number;
  title: string;
  description: string;
  focus_area: string;
  difficulty: string;
  status: 'locked' | 'available' | 'completed';
  quiz_score: number | null;
  completed_at: string | null;
  concept_explanation: string | null;
  examples: string | null;
  practice_exercises: string | null;
  quiz_questions: string | null;
  revision_notes: string | null;
}

export interface LearningRoadmap {
  id: string;
  session_id: string;
  topic: string;
  language: string;
  weak_areas: string[];
  strengths: string[];
  overall_score: number;
  created_at: string;
  modules: LearningModule[];
}

export interface LearningProgress {
  exists: boolean;
  total_modules: number;
  completed_modules: number;
  available_modules: number;
  progress_percent: number;
  average_quiz_score: number | null;
  modules: {
    id: string;
    week_number: number;
    title: string;
    status: string;
    quiz_score: number | null;
    completed_at: string | null;
  }[];
}
