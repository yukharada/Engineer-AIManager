import { supabase, FIXED_USER_ID } from './supabase';
import { UserProfile, Challenge, ClaudeReviewResult, ReviewHistoryItem, RoadmapPhase, MonthlyReport } from './types';

// =====================================
// ユーザープロファイル
// =====================================

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: FIXED_USER_ID,
      role: profile.role,
      experience_years: profile.experienceYears,
      goals: profile.goals,
      skills: profile.skills,
      strengths: profile.evaluation?.strengths || [],
      weaknesses: profile.evaluation?.areasForImprovement || [],
      has_completed_onboarding: profile.hasCompletedOnboarding,
      onboarding_completed_date: profile.onboardingCompletedDate || null,
      roadmap_start_date: profile.roadmapStartDate || null,
      evaluation: profile.evaluation || null,
    }, {
      onConflict: 'id'
    });
  
  if (error) {
    console.error('プロファイル保存エラー:', error);
    throw error;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', FIXED_USER_ID)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // データなし
    console.error('プロファイル取得エラー:', error);
    throw error;
  }
  
  if (!data) return null;
  
  return {
    role: data.role,
    experienceYears: data.experience_years,
    goals: data.goals,
    skills: data.skills,
    hasCompletedOnboarding: data.has_completed_onboarding,
    onboardingCompletedDate: data.onboarding_completed_date,
    roadmapStartDate: data.roadmap_start_date,
    evaluation: data.evaluation,
  };
}

// =====================================
// ロードマップ
// =====================================

export async function saveRoadmap(roadmap: RoadmapPhase[]): Promise<void> {
  const { error } = await supabase
    .from('roadmaps')
    .upsert({
      user_id: FIXED_USER_ID,
      content: roadmap,
    }, {
      onConflict: 'user_id'
    });
  
  if (error) {
    console.error('ロードマップ保存エラー:', error);
    throw error;
  }
}

export async function getRoadmap(): Promise<RoadmapPhase[] | null> {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('content')
    .eq('user_id', FIXED_USER_ID)
    .maybeSingle();
  
  if (error) {
    console.error('ロードマップ取得エラー:', error);
    throw error;
  }
  
  return data?.content || null;
}

// =====================================
// 課題（Challenge）
// =====================================

export async function saveChallenges(challenges: Challenge[]): Promise<void> {
  // First, delete current challenges for this user to keep it clean (sync style)
  const { error: deleteError } = await supabase
    .from('challenges')
    .delete()
    .eq('user_id', FIXED_USER_ID);
    
  if (deleteError) {
    console.error('課題削除エラー:', deleteError);
  }
  
  if (challenges.length === 0) return;

  const { error } = await supabase
    .from('challenges')
    .insert(
      challenges.map(c => ({
        id: c.id,
        user_id: FIXED_USER_ID,
        title: c.title,
        description: c.description,
        acceptance_criteria: c.acceptanceCriteria,
        completed_criteria: c.completedCriteria || {}, // Ensure non-null
        difficulty: c.difficulty,
        completed: c.completed,
        gained_skills: c.gainedSkills,
        created_at: c.createdAt,
        deadline: c.deadline || null,
        completed_at: c.completedAt || null,
      }))
    );
  
  if (error) {
    console.error('課題保存エラー:', error);
    throw error;
  }
}

export async function getChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', FIXED_USER_ID)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('課題取得エラー:', error);
    throw error;
  }
  
  return (data || []).map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    acceptanceCriteria: c.acceptance_criteria,
    completedCriteria: c.completed_criteria,
    difficulty: c.difficulty as any,
    completed: c.completed,
    gainedSkills: c.gained_skills,
    createdAt: c.created_at,
    deadline: c.deadline,
    completedAt: c.completed_at,
  }));
}

export async function updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<void> {
  const dbUpdates: any = {};
  if (updates.completedCriteria !== undefined) dbUpdates.completed_criteria = updates.completedCriteria || {};
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

  const { error } = await supabase
    .from('challenges')
    .update(dbUpdates)
    .eq('id', challengeId)
    .eq('user_id', FIXED_USER_ID);
  
  if (error) {
    console.error('課題更新エラー:', error);
    throw error;
  }
}

// =====================================
// レビュー履歴
// =====================================

export async function saveReviewHistory(review: ReviewHistoryItem): Promise<void> {
  const { error } = await supabase
    .from('review_history')
    .insert({
      id: review.id || undefined,
      user_id: FIXED_USER_ID,
      task_id: review.taskId,
      acceptance_criteria: review.acceptanceCriteria,
      code: '',
      result: review.result,
      timestamp: review.timestamp || new Date().toISOString()
    });
  
  if (error) {
    console.error('レビュー保存エラー:', error);
    throw error;
  }
}

export async function getReviewHistory(): Promise<ReviewHistoryItem[]> {
  const { data, error } = await supabase
    .from('review_history')
    .select('*')
    .eq('user_id', FIXED_USER_ID)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('レビュー履歴取得エラー:', error);
    throw error;
  }
  
  return (data || []).map(r => ({
    id: r.id,
    taskId: r.task_id,
    acceptanceCriteria: r.acceptance_criteria,
    result: r.result,
    timestamp: r.timestamp
  }));
}

// =====================================
// マンスリーレポート
// =====================================

export async function saveMonthlyReports(reports: MonthlyReport[]): Promise<void> {
  if (reports.length === 0) return;

  const { error } = await supabase
    .from('monthly_reports')
    .upsert(
      reports.map(r => ({
        user_id: FIXED_USER_ID,
        month: r.month,
        content: r
      })),
      { onConflict: 'user_id, month' }
    );
  
  if (error) {
    console.error('マンスリーレポート保存エラー:', error);
    throw error;
  }
}

export async function getMonthlyReports(): Promise<MonthlyReport[]> {
  const { data, error } = await supabase
    .from('monthly_reports')
    .select('content')
    .eq('user_id', FIXED_USER_ID)
    .order('month', { ascending: false });
  
  if (error) {
    console.error('マンスリーレポート取得エラー:', error);
    throw error;
  }
  
  return (data || []).map(r => r.content);
}
