"use client";

import { create } from 'zustand';
import { UserProfile, RoadmapPhase, Challenge, ReviewHistoryItem, SkillScores, MonthlyReport } from './types';
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
    frontend: 1,
    backend: 1,
    infrastructure: 1,
    systemDesign: 1,
    database: 1,
    security: 1,
    devProcess: 1,
  },
  hasCompletedOnboarding: false,
  evaluation: {
    summary: "",
    strengths: [],
    areasForImprovement: [],
    recommendedFocus: ""
  }
};

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
  totalGainedPoints: number;

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

const computeDerived = (profile: UserProfile, challenges: Challenge[]) => {
  const computedSkills = { ...profile.skills };
  let totalGainedPoints = 0;
  
  challenges.forEach(c => {
    if (c.completed && c.gainedSkills) {
      c.gainedSkills.forEach(gs => {
        if (gs.category in computedSkills) {
          computedSkills[gs.category as keyof SkillScores] = Math.min(10, computedSkills[gs.category as keyof SkillScores] + gs.points);
          totalGainedPoints += gs.points;
        }
      });
    }
  });

  return { computedSkills, totalGainedPoints };
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
  totalGainedPoints: 0,

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
      
      const loadedProfile = profile || defaultProfile;
      const loadedChallenges = challenges || [];
      const { computedSkills, totalGainedPoints } = computeDerived(loadedProfile, loadedChallenges);

      set({
        profile: loadedProfile,
        challenges: loadedChallenges,
        roadmap: roadmap || [],
        reviewHistory: reviewHistory || [],
        monthlyReports: monthlyReports || [],
        computedSkills,
        totalGainedPoints,
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
    const { computedSkills, totalGainedPoints } = computeDerived(profile, get().challenges);
    set({ profile, computedSkills, totalGainedPoints });
  },
  
  saveChallenges: async (challenges: Challenge[]) => {
    await saveChallenges(challenges);
    const { computedSkills, totalGainedPoints } = computeDerived(get().profile, challenges);
    set({ challenges, computedSkills, totalGainedPoints });
  },
  
  saveReviewHistory: async (review: ReviewHistoryItem) => {
    await saveReviewHistory(review);
    set(state => ({ reviewHistory: [...state.reviewHistory, review] }));
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

    const { computedSkills, totalGainedPoints } = computeDerived(get().profile, nextChallenges);
    set({ challenges: nextChallenges, computedSkills, totalGainedPoints });
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
      totalGainedPoints: 0,
    });
  }
}));
