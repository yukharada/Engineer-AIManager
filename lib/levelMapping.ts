import { SkillProgress, calculateXpForLevel } from "./types";

/**
 * オンボーディングの経験度（1-10）をゲーム内レベル（1-100）にマッピング
 */
export function mapExperienceToLevel(experience: number): number {
  // 経験度1-10を、より広いレベル範囲に変換
  const mapping: Record<number, number> = {
    1: 5,   // 完全初心者 → Lv.5
    2: 12,  // 入門 → Lv.12
    3: 20,  // 基礎理解 → Lv.20
    4: 30,  // 実務経験1年程度 → Lv.30
    5: 42,  // 実務経験2-3年 → Lv.42
    6: 55,  // 中堅 → Lv.55
    7: 68,  // 上級者手前 → Lv.68
    8: 78,  // 上級者 → Lv.78
    9: 88,  // エキスパート → Lv.88
    10: 95  // マスター級 → Lv.95（100は目標として残す）
  };
  
  return mapping[experience] || 5;
}

/**
 * マッピング後のレベルでSkillProgressを初期化
 */
export function initializeSkillProgress(experience: number): SkillProgress {
  const level = mapExperienceToLevel(experience);
  
  return {
    level,
    xp: 0,
    xpToNext: calculateXpForLevel(level)
  };
}

/**
 * 現在のレベルに応じたステージ表示
 */
export function getStageLabel(level: number): { label: string; color: string } {
  if (level < 30) return { label: '初級者', color: 'text-blue-400' };
  if (level < 60) return { label: '中級者', color: 'text-green-400' };
  if (level < 90) return { label: '上級者', color: 'text-purple-400' };
  return { label: 'エキスパート', color: 'text-yellow-400' };
}
