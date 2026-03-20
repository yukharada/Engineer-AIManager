import { format, formatDistanceToNow, parseISO, differenceInMonths } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 現在の日時を取得
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * 現在の日時を ISO 8601 形式の文字列で取得
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString();
}

/**
 * 日付を「2024年3月19日」形式でフォーマット
 */
export function formatDateJapanese(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy年M月d日', { locale: ja });
}

/**
 * 日付を「3日前」「2時間前」形式でフォーマット
 */
export function formatRelativeTime(date: Date | string): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ja });
}

/**
 * ロードマップの開始日を取得（オンボーディング完了日 or 現在）
 */
export function getRoadmapStartDate(onboardingCompletedDate?: string): Date {
  if (onboardingCompletedDate) {
    return parseISO(onboardingCompletedDate);
  }
  return getCurrentDate();
}

/**
 * ロードマップの現在フェーズを計算
 * @param startDate ロードマップ開始日
 * @param totalMonths ロードマップの総期間（月数）
 * @returns 現在のフェーズ（例: "1-6ヶ月目"）
 */
export function getCurrentRoadmapPhase(startDate: Date | string, totalMonths: number = 36): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const now = getCurrentDate();
  const monthsPassed = differenceInMonths(now, start) + 1; // 1ヶ月目から開始
  
  if (monthsPassed <= 6) return '1-6ヶ月目';
  if (monthsPassed <= 12) return '7-12ヶ月目';
  if (monthsPassed <= 18) return '13-18ヶ月目';
  if (monthsPassed <= 24) return '19-24ヶ月目';
  if (monthsPassed <= 30) return '25-30ヶ月目';
  if (monthsPassed <= 36) return '31-36ヶ月目';
  
  return '完了'; // 36ヶ月を超えた場合
}

/**
 * ロードマップの経過月数を取得
 */
export function getRoadmapElapsedMonths(startDate: Date | string): number {
  if (!startDate) return 0;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const now = getCurrentDate();
  return differenceInMonths(now, start) + 1;
}

/**
 * 課題の推奨完了期限を計算（生成日から1週間後）
 */
export function getChallengeDeadline(createdDate: Date | string, daysToComplete: number = 7): string {
  const created = typeof createdDate === 'string' ? parseISO(createdDate) : createdDate;
  const deadline = new Date(created);
  deadline.setDate(deadline.getDate() + daysToComplete);
  return deadline.toISOString();
}

/**
 * 期限が過ぎているかチェック
 */
export function isOverdue(deadline: Date | string): boolean {
  if (!deadline) return false;
  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  return deadlineDate < getCurrentDate();
}
