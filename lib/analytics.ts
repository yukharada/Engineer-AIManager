import { ClaudeReviewResult as ReviewResult, ReviewHistoryItem as ReviewHistory } from './types';

/**
 * 過去のレビュー結果から頻出の弱点を抽出
 */
export function analyzeWeaknesses(reviews: ReviewHistory[]): {
  weaknesses: { issue: string; count: number }[];
  averageScores: { design: number; naming: number; errorHandling: number; testing: number; performance: number };
} {
  const weaknessMap = new Map<string, number>();
  let totalScores = { design: 0, naming: 0, errorHandling: 0, testing: 0, performance: 0 };
  
  if (reviews.length === 0) {
    return {
      weaknesses: [],
      averageScores: { design: 10, naming: 10, errorHandling: 10, testing: 10, performance: 10 }
    };
  }

  reviews.forEach(review => {
    // 弱点をカウント
    (review.result.detectedWeaknesses || []).forEach(weakness => {
      weaknessMap.set(weakness, (weaknessMap.get(weakness) || 0) + 1);
    });
    
    // スコアを集計
    totalScores.design += review.result.scores.design;
    totalScores.naming += review.result.scores.naming;
    totalScores.errorHandling += review.result.scores.errorHandling;
    totalScores.testing += review.result.scores.testing;
    totalScores.performance += review.result.scores.performance;
  });
  
  // 弱点を頻度順にソート
  const weaknesses = Array.from(weaknessMap.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count);
  
  // 平均スコアを計算
  const reviewCount = reviews.length;
  const averageScores = {
    design: totalScores.design / reviewCount,
    naming: totalScores.naming / reviewCount,
    errorHandling: totalScores.errorHandling / reviewCount,
    testing: totalScores.testing / reviewCount,
    performance: totalScores.performance / reviewCount
  };
  
  return { weaknesses, averageScores };
}

/**
 * 最もスコアが低い観点を特定
 */
export function identifyLowestScoreArea(averageScores: { design: number; naming: number; errorHandling: number; testing: number; performance: number }): string {
  const entries = Object.entries(averageScores) as [string, number][];
  const lowest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
  
  const areaNames: Record<string, string> = {
    design: '設計',
    naming: '命名',
    errorHandling: 'エラーハンドリング',
    testing: 'テスト',
    performance: 'パフォーマンス'
  };
  
  return areaNames[lowest[0]] || '設計';
}
