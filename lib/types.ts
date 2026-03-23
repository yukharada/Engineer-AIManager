export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface GainedSkill {
  category: keyof SkillScores;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  acceptanceCriteria: string[];
  completedCriteria?: Record<number, boolean>;
  gainedSkills: GainedSkill[];
  completed: boolean;
  createdAt: string;
  deadline?: string;
  completedAt?: string;
}

export interface ReviewHistoryItem {
  id: string;
  taskId: string;
  acceptanceCriteria: string;
  result: ClaudeReviewResult;
  timestamp: string;
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

export interface RoadmapPhase {
  period: string;
  focus: string;
  milestones: string[];
  details: string;
}

// =====================================
// New RPG-style Skill System
// =====================================

export interface SkillProgress {
  level: number;    // 1-100
  xp: number;       // Current XP
  xpToNext: number; // XP required for next level
}

export interface SkillScores {
  frontend: SkillProgress;
  backend: SkillProgress;
  infrastructure: SkillProgress;
  database: SkillProgress;
  systemDesign: SkillProgress;
  devProcess: SkillProgress;
  security: SkillProgress;
}

export interface UserProfile {
  role: string;
  experienceYears: number;
  goals: string;
  skills: SkillScores;
  hasCompletedOnboarding: boolean;
  onboardingCompletedDate?: string;
  roadmapStartDate?: string;
  evaluation?: {
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendedFocus: string;
  };
}

export interface MonthlyReport {
  id: string;
  timestamp: string;
  month: string;
  title: string;
  content: string;
  strengths: string[];
  nextSteps: string[];
  isDemo?: boolean;
  isQuotaExceeded?: boolean;
  retryAfter?: string | null;
}

// RPG Logic Utils
export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.1, level - 1));
}

export function createInitialSkillProgress(level: number, xp: number = 0): SkillProgress {
  return {
    level,
    xp,
    xpToNext: calculateXpForLevel(level)
  };
}

export function addXp(current: SkillProgress, xpGained: number): { progress: SkillProgress; leveledUp: boolean; newLevel: number } {
  let newXp = current.xp + xpGained;
  let newLevel = current.level;
  let leveledUp = false;

  while (newXp >= calculateXpForLevel(newLevel) && newLevel < 100) {
    newXp -= calculateXpForLevel(newLevel);
    newLevel++;
    leveledUp = true;
  }

  return {
    progress: {
      level: newLevel,
      xp: newXp,
      xpToNext: calculateXpForLevel(newLevel)
    },
    leveledUp,
    newLevel
  };
}
