export interface SessionQuestion {
  turn_number: number;
  question_text: string;
}

export interface EvaluationResult {
  score: number;
  correctness: string;
  completeness: string;
  depth: string;
  missing_concepts: string[];
  misconceptions: string[];
}

export interface AnswerSubmit {
  answer_text: string;
}

export interface AnswerResponse {
  evaluation: EvaluationResult;
  completed: boolean;
  next_question?: SessionQuestion;
}

export interface TurnResponse {
  id: string;
  turn_number: number;
  question_text: string;
  answer_text?: string;
  score?: number;
  correctness?: string;
  completeness?: string;
  depth?: string;
  missing_concepts?: string[];
  misconceptions?: string[];
  created_at: string;
}

export interface SessionCreate {
  user_id: string;
  topic: string;
  language: string;
  provider: string;
  model: string;
  difficulty: string;
  max_turns?: number;
}

export interface SessionResponse {
  id: string;
  topic: string;
  language: string;
  provider: string;
  model: string;
  difficulty: string;
  max_turns: number;
  created_at: string;
  completed_at?: string;
  overall_score?: number;
  first_question?: SessionQuestion;
}

export interface SessionDetailResponse {
  id: string;
  topic: string;
  language: string;
  provider: string;
  model: string;
  difficulty: string;
  max_turns: number;
  created_at: string;
  completed_at?: string;
  overall_score?: number;
  turns: TurnResponse[];
}

export interface RoadmapWeek {
  week: number;
  title: string;
  description: string;
}

export interface ReportResponse {
  id: string;
  session_id: string;
  summary: string;
  skill_xray: Record<string, number>;
  strengths: string[];
  weak_areas: string[];
  roadmap: RoadmapWeek[];
  created_at: string;
}

// Auth types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;    // Real user ID from backend
  username: string;   // Username for display
}

export interface UserResponse {
  id: string;
  username: string;
}
