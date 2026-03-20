"use client";

import { useState, useEffect } from "react";
import { UserProfile, RoadmapPhase, Challenge, MonthlyReport, ReviewHistoryItem } from "./types";

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
  currentSystemDate: new Date("2026-03-21").toISOString(),
  evaluation: {
    summary: "",
    strengths: [],
    areasForImprovement: [],
    recommendedFocus: ""
  }
};

export function useStore() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("egs_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      parsed.currentSystemDate = new Date("2026-03-21").toISOString();
      if (!parsed.evaluation) parsed.evaluation = defaultProfile.evaluation;
      setProfile(parsed);
    } else {
      setProfile(p => ({...p, currentSystemDate: new Date("2026-03-21").toISOString()}));
    }

    const savedRoadmap = localStorage.getItem("egs_roadmap");
    if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));

    const savedChallenges = localStorage.getItem("egs_challenges");
    if (savedChallenges) setChallenges(JSON.parse(savedChallenges));

    const savedMonthly = localStorage.getItem("egs_monthly");
    if (savedMonthly) setMonthlyReports(JSON.parse(savedMonthly));

    const savedHistory = localStorage.getItem("egs_review_history");
    if (savedHistory) setReviewHistory(JSON.parse(savedHistory));

    setIsLoaded(true);
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("egs_profile", JSON.stringify(newProfile));
  };

  const saveRoadmap = (newRoadmap: RoadmapPhase[]) => {
    setRoadmap(newRoadmap);
    localStorage.setItem("egs_roadmap", JSON.stringify(newRoadmap));
  };

  const saveChallenges = (newChallenges: Challenge[]) => {
    setChallenges(newChallenges);
    localStorage.setItem("egs_challenges", JSON.stringify(newChallenges));
  };

  const saveMonthlyReports = (newReports: MonthlyReport[]) => {
    setMonthlyReports(newReports);
    localStorage.setItem("egs_monthly", JSON.stringify(newReports));
  };

  const resetAll = () => {
    localStorage.clear();
    setProfile(defaultProfile);
    setRoadmap([]);
    setChallenges([]);
    setMonthlyReports([]);
    setReviewHistory([]);
  };

  const completeCriteria = (challengeId: string, criteriaIndices: number[]) => {
    setChallenges(prev => {
      const next = prev.map(c => {
        if (c.id === challengeId) {
          const completedCriteria = { ...(c.completedCriteria || {}) };
          criteriaIndices.forEach(idx => { completedCriteria[idx] = true; });
          
          const allMet = c.acceptanceCriteria.every((_, idx) => completedCriteria[idx]);
          return { ...c, completedCriteria, completed: allMet };
        }
        return c;
      });
      localStorage.setItem("egs_challenges", JSON.stringify(next));
      return next;
    });
  };

  const saveReviewHistory = (item: ReviewHistoryItem) => {
    setReviewHistory(prev => {
      const next = [...prev, item];
      localStorage.setItem("egs_review_history", JSON.stringify(next));
      return next;
    });
  };

  const computedSkills = { ...profile.skills };
  let totalGainedPoints = 0;
  
  challenges.forEach(c => {
    if (c.completed && c.gainedSkills) {
      c.gainedSkills.forEach(gs => {
        if (gs.category in computedSkills) {
          computedSkills[gs.category] = Math.min(10, computedSkills[gs.category] + gs.points);
          totalGainedPoints += gs.points;
        }
      });
    }
  });

  return {
    isLoaded,
    profile,
    saveProfile,
    roadmap,
    saveRoadmap,
    challenges,
    saveChallenges,
    monthlyReports,
    saveMonthlyReports,
    resetAll,
    completeCriteria,
    saveReviewHistory,
    reviewHistory,
    computedSkills,
    totalGainedPoints
  };
}
