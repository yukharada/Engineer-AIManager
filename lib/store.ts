"use client";

import { create } from 'zustand';
import { 
  UserProfile, 
  RoadmapPhase, 
  Challenge, 
  ReviewHistoryItem, 
  SkillScores, 
  MonthlyReport,
  createInitialSkillProgress,
  addXp
} from './types';
import {
  getUserProfile,
  saveUserProfile,
  getChallenges,
  saveChallenges,
  updateChallenge,
  getRoadmap,
  saveRoadmap,
  getReviewHistory,
  saveReviewHistory,
  getMonthlyReports,
  saveMonthlyReports,
} from './db';

const defaultProfile: UserProfile = {
  role: "",
  experienceYears: 0,
  goals: "",
  skills: {
    frontend: createInitialSkillProgress(1),
    backend: createInitialSkillProgress(1),
    infrastructure: createInitialSkillProgress(1),
    systemDesign: createInitialSkillProgress(1),
    database: createInitialSkillProgress(1),
    security: createInitialSkillProgress(1),
    devProcess: createInitialSkillProgress(1),
  },
  hasCompletedOnboarding: false,
  evaluation: {
    summary: "",
    strengths: [],
    areasForImprovement: [],
    recommendedFocus: ""
  }
};

interface LevelUpInfo {
  skill: string;
  newLevel: number;
}

interface StoreState {
  profile: UserProfile;
  challenges: Challenge[];
  roadmap: RoadmapPhase[];
  reviewHistory: ReviewHistoryItem[];
  monthlyReports: MonthlyReport[];
  isLoaded: boolean;
  isLoading: boolean;
  
  // Computed values
  computedSkills: SkillScores;
  totalGainedXp: number;

  // Level up UI state
  levelUpInfo: LevelUpInfo | null;
  setLevelUpInfo: (info: LevelUpInfo | null) => void;

  // Actions
  loadData: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveChallenges: (challenges: Challenge[]) => Promise<void>;
  saveReviewHistory: (review: ReviewHistoryItem) => Promise<void>;
  saveRoadmap: (roadmap: RoadmapPhase[]) => Promise<void>;
  saveMonthlyReports: (reports: MonthlyReport[]) => Promise<void>;
  completeCriteria: (challengeId: string, criteriaIndices: number[]) => Promise<void>;
  resetAll: () => Promise<void>;
}

const computeDerived = (profile: UserProfile, challenges: Challenge[], reviewHistory: ReviewHistoryItem[]) => {
  const skills = JSON.parse(JSON.stringify(profile.skills)) as SkillScores;
  let totalGainedXp = 0;
  
  // 1. Add XP from completed challenges
  challenges.forEach(c => {
    if (c.completed && c.gainedSkills) {
      const baseXp = c.difficulty === 'Advanced' ? 200 : c.difficulty === 'Intermediate' ? 100 : 50;
      
      c.gainedSkills.forEach(gs => {
        if (gs.category in skills) {
          const { progress } = addXp(skills[gs.category as keyof SkillScores], baseXp);
          skills[gs.category as keyof SkillScores] = progress;
          totalGainedXp += baseXp;
        }
      });
    }
  });

  // 2. Add bonus XP from reviews
  reviewHistory.forEach(h => {
    if (h.result.status === 'Approved') {
      const avgScore = Object.values(h.result.scores).reduce((a, b) => (a as number) + (b as number), 0) / 5;
      const bonusXp = avgScore >= 9 ? 50 : avgScore >= 7 ? 30 : 10;
      
      const challenge = challenges.find(c => c.id === h.taskId);
      if (challenge) {
        challenge.gainedSkills.forEach(gs => {
          if (gs.category in skills) {
            const { progress } = addXp(skills[gs.category as keyof SkillScores], bonusXp);
            skills[gs.category as keyof SkillScores] = progress;
            totalGainedXp += bonusXp;
          }
        });
      }
    }
  });

  return { computedSkills: skills, totalGainedXp };
};

// Check if a skill leveled up after an action
const checkLevelUp = (oldSkills: SkillScores, newSkills: SkillScores): LevelUpInfo | null => {
  for (const key in newSkills) {
    const k = key as keyof SkillScores;
    if (newSkills[k].level > oldSkills[k].level) {
      const labels: Record<string, string> = {
        frontend: 'フロントエンド',
        backend: 'バックエンド',
        infrastructure: 'インフラ',
        systemDesign: 'システム設計',
        database: 'データベース',
        security: 'セキュリティ',
        devProcess: '開発プロセス'
      };
      return { skill: labels[k] || k, newLevel: newSkills[k].level };
    }
  }
  return null;
};

export const useStore = create<StoreState>((set, get) => ({
  profile: defaultProfile,
  challenges: [],
  roadmap: [],
  reviewHistory: [],
  monthlyReports: [],
  isLoaded: false,
  isLoading: true,
  computedSkills: defaultProfile.skills,
  totalGainedXp: 0,
  levelUpInfo: null,
  
  setLevelUpInfo: (info) => set({ levelUpInfo: info }),

  loadData: async () => {
    try {
      set({ isLoading: true });
      const [profile, challenges, roadmap, reviewHistory, monthlyReports] = await Promise.all([
        getUserProfile(),
        getChallenges(),
        getRoadmap(),
        getReviewHistory(),
        getMonthlyReports(),
      ]);
      
      let loadedProfile = profile || defaultProfile;
      const loadedChallenges = challenges || [];
      const loadedHistory = reviewHistory || [];
      const loadedMonthly = monthlyReports || [];

      // Migration: Handle old numeric skill scores
      const migratedSkills = { ...loadedProfile.skills };
      let updated = false;
      for (const key in migratedSkills) {
        if (typeof (migratedSkills as any)[key] === 'number') {
          (migratedSkills as any)[key] = createInitialSkillProgress((migratedSkills as any)[key] * 10);
          updated = true;
        }
      }
      if (updated) {
        loadedProfile = { ...loadedProfile, skills: migratedSkills };
      }

      const { computedSkills, totalGainedXp } = computeDerived(loadedProfile, loadedChallenges, loadedHistory);

      set({
        profile: loadedProfile,
        challenges: loadedChallenges,
        roadmap: roadmap || [],
        reviewHistory: loadedHistory,
        monthlyReports: loadedMonthly,
        computedSkills,
        totalGainedXp,
        isLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      set({ isLoading: false, isLoaded: true });
    }
  },
  
  saveProfile: async (profile: UserProfile) => {
    await saveUserProfile(profile);
    const { computedSkills, totalGainedXp } = computeDerived(profile, get().challenges, get().reviewHistory);
    set({ profile, computedSkills, totalGainedXp });
  },
  
  saveChallenges: async (challenges: Challenge[]) => {
    await saveChallenges(challenges);
    const { computedSkills, totalGainedXp } = computeDerived(get().profile, challenges, get().reviewHistory);
    set({ challenges, computedSkills, totalGainedXp });
  },
  
  saveReviewHistory: async (review: ReviewHistoryItem) => {
    await saveReviewHistory(review);
    const oldComputed = get().computedSkills;
    const nextHistory = [...get().reviewHistory, review];
    const { computedSkills, totalGainedXp } = computeDerived(get().profile, get().challenges, nextHistory);
    
    // Check for level up
    const levelUp = checkLevelUp(oldComputed, computedSkills);
    
    set({ 
      reviewHistory: nextHistory, 
      computedSkills, 
      totalGainedXp,
      levelUpInfo: levelUp || get().levelUpInfo
    });
  },
  
  saveRoadmap: async (roadmap: RoadmapPhase[]) => {
    await saveRoadmap(roadmap);
    set({ roadmap });
  },

  saveMonthlyReports: async (reports: MonthlyReport[]) => {
    await saveMonthlyReports(reports);
    set({ monthlyReports: reports });
  },

  completeCriteria: async (challengeId: string, criteriaIndices: number[]) => {
    const challenges = get().challenges;
    const targetChallenge = challenges.find(c => c.id === challengeId);
    if (!targetChallenge) return;

    const completedCriteria = { ...(targetChallenge.completedCriteria || {}) };
    criteriaIndices.forEach(idx => { completedCriteria[idx] = true; });
    
    const allMet = targetChallenge.acceptanceCriteria.every((_, idx) => completedCriteria[idx]);
    const completedAt = allMet ? new Date().toISOString() : targetChallenge.completedAt;

    await updateChallenge(challengeId, {
      completedCriteria,
      completed: allMet,
      completedAt
    });

    const nextChallenges = challenges.map(c => 
      c.id === challengeId ? { ...c, completedCriteria, completed: allMet, completedAt } : c
    );

    const oldComputed = get().computedSkills;
    const { computedSkills, totalGainedXp } = computeDerived(get().profile, nextChallenges, get().reviewHistory);
    
    // Check for level up
    const levelUp = checkLevelUp(oldComputed, computedSkills);

    set({ 
      challenges: nextChallenges, 
      computedSkills, 
      totalGainedXp,
      levelUpInfo: levelUp || get().levelUpInfo
    });
  },

  resetAll: async () => {
    await saveUserProfile(defaultProfile);
    await saveChallenges([]);
    await saveRoadmap([]);
    await saveMonthlyReports([]);
    set({
      profile: defaultProfile,
      challenges: [],
      roadmap: [],
      reviewHistory: [],
      monthlyReports: [],
      computedSkills: defaultProfile.skills,
      totalGainedXp: 0,
      levelUpInfo: null
    });
  }
}));
