export interface UserProfile {
  role: string;
  experienceYears: number;
  goals: string;
  skills: SkillScores;
  hasCompletedOnboarding: boolean;
  currentSystemDate: string;
  evaluation?: {
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendedFocus: string;
  };
}

export interface SkillScores {
  frontend: number;
  backend: number;
  infrastructure: number;
  systemDesign: number;
  database: number;
  security: number;
  devProcess: number;
}

export interface RoadmapPhase {
  period: string;
  focus: string;
  milestones: string[];
  details: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  completedCriteria?: Record<number, boolean>;
  gainedSkills?: { category: keyof SkillScores; points: number }[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
}

export interface CodeReviewResult {
  score: number;
  approved: boolean;
  summary: string;
  categories: {
    design: string;
    naming: string;
    performance: string;
    security: string;
    testing: string;
  };
}

export interface ClaudeReviewResult {
  status: 'Approved' | 'Changes Requested';
  scores: {
    design: number;
    naming: number;
    errorHandling: number;
    testing: number;
    performance: number;
  };
  feedback: string;
  questions: string[];
  nextFocus: string;
  detectedWeaknesses: string[];
  detectedStrengths: string[];
}

export interface ReviewHistoryItem {
  id: string;
  taskId: string;
  acceptanceCriteria: string; // The title of the PR/criteria
  result: ClaudeReviewResult; // This matches the user's ReviewResult interface
  timestamp: string;
}

export interface MonthlyReport {
  month: string;
  completedChallengesCount: number;
  skillImprovements: string[];
  managerNarrative: string;
  recommendations: string[];
}
