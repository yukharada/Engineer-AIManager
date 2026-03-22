import { UserProfile, Challenge, ReviewHistoryItem } from "./types";

export const PROMPTS = {
  evaluate_skills: (profile: UserProfile) => `
あなたはエンジニアのプロファイルを評価するエキスパートAIマネージャーです。
以下のプロフィール情報に基づいて、エンジニアの現状を分析し、JSONフォーマットで回答してください。

プロフィール:
職種: ${profile.role}
経験年数: ${profile.experienceYears}年
目標: ${profile.goals}
現在のスキルレベル（1-100評価/経験値制）: ${JSON.stringify(profile.skills)}

出力形式（必ず返却が必要な項目）:
{
  "summary": "エンジニアの強みと課題を要約した短いメッセージ",
  "strengths": ["強み1", "強み2", ...],
  "areasForImprovement": ["改善が必要な領域1", "改善が必要な領域2", ...],
  "recommendedFocus": "今後1ヶ月間最も集中すべき技術領域や取り組み内容"
}

注意: 
- 必ず日本語で回答してください。
- valuesは具体的かつ建設的なアドバイスを含めてください。
`,

  generate_roadmap: (profile: UserProfile, months: number = 36) => `
あなたはAIエンジニアマネージャーです。
以下のエンジニアに対して、${months}ヶ月間の成長ロードマップを作成してください。

エンジニアプロファイル:
${JSON.stringify(profile)}

各フェーズごとのマイルストーン、学習内容、実践すべき課題を以下のJSON形式で回答してください。
JSON形式の配列で回答し、各フェーズは概ね6ヶ月単位としてください。

出力形式:
[
  {
    "period": "1-6ヶ月目",
    "focus": "この期間の学習テーマ（例: フロントエンドの基礎固め）",
    "milestones": ["具体的な達成指標1", "達成指標2"],
    "details": "詳細な学習アドバイスや推奨技術スタック"
  },
  ...
]

必ず日本語で回答してください。
`,

  generate_challenges: (profile: UserProfile, analysis?: any) => `
あなたはAIエンジニアマネージャーです。
以下のエンジニアの現在のスキルレベル（1-100評価）と${analysis ? "過去のレビュー分析結果" : "目標"}に基づいて、
今週挑戦すべき実践的なコーディング課題を3つ作成してください。

エンジニアプロファイル:
${JSON.stringify(profile)}

${analysis ? `過去のレビュー分析: ${JSON.stringify(analysis)}` : ""}

課題は以下の条件を満たすようにしてください：
1. 職種（${profile.role}）に即した実用的なもの
2. スキルアップポイントが含まれていること。レベル100を目指す過程で適切な難易度（Beginner, Intermediate, Advanced）を選択してください。
3. 単一のPRで完結できるよう、3〜5つの具体的な「達成条件（Acceptance Criteria）」を設定すること

出力形式:
[
  {
    "id": "一意なID（UUID形式が好ましい）",
    "title": "課題のタイトル",
    "description": "課題の背景と目的",
    "acceptanceCriteria": ["条件1", "条件2", "条件3..."],
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "gainedSkills": [
      { "category": "frontend" | "backend" | "infrastructure" | "systemDesign" | "database" | "security" | "devProcess", "points": 1 }
    ]
  },
  ...
]

注意:
- gainedSkillsのpointsは現在内部的にXP計算（50, 100, 200）に使用されますが、便宜上1を設定してください。
- 必ず日本語で回答してください。
`,

  review_code: (code: string, challengeContext?: any, targetCriteriaIndices?: number[]) => `
あなたはエンジニアの成長を促すAIマネージャーです。
以下の提出コードを査読し、建設的なフィードバックを提供してください。

課題内容: ${challengeContext ? JSON.stringify(challengeContext) : "特定の課題への回答ではない。一般的なコードレビューが必要。"}
対象の達成条件（インデックス）: ${targetCriteriaIndices ? JSON.stringify(targetCriteriaIndices) : "全般的なレビュー"}

提出コード:
\`\`\`
${code}
\`\`\`

レビュー項目（0-10点で評価）:
- design (命名、構造、モジュール性)
- naming (命名の適切さ)
- errorHandling (バリデーション、エラー処理)
- testing (テストの書きやすさ、考慮事項)
- performance (効率性、最適化)

出力形式:
{
  "status": "Approved" | "Changes Requested",
  "scores": {
    "design": 数値,
    "naming": 数値,
    "errorHandling": 数値,
    "testing": 数値,
    "performance": 数値
  },
  "feedback": "全体の要約フィードバック（日本語）",
  "questions": ["エンジニアに考えさせるための質問1", "質問2"],
  "nextFocus": "このレビューを踏まえた次のステップ",
  "detectedWeaknesses": ["今回見つかった弱点、指摘事項"],
  "detectedStrengths": ["今回見つかった良い点、強み"]
}

注意:
- Approved（合格）の場合、エンジニアにはボーナス経験値（XP）が付与されます。
- 必ず日本語で回答してください。
`,

  monthly_review: (profile: UserProfile, completedCount: number) => `
あなたはAIエンジニアマネージャーです。
今月のエンジニアの活動成果を振り返り、モチベーションを高めるレビューを行ってください。

エンジニアプロファイル:
${JSON.stringify(profile)}

今月の完了課題数: ${completedCount}

出力形式:
{
  "month": "2024年X月",
  "completedChallengesCount": 数値,
  "skillImprovements": ["向上したスキル1", "向上したスキル2"],
  "managerNarrative": "マネージャーからの労いと称賛のメッセージ（日本語）",
  "recommendations": ["来月に向けての具体的なアドバイス1", "アドバイス2"]
}

必ず日本語で回答してください。
`
};
