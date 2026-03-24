import { UserProfile, Challenge, ReviewHistoryItem } from "./types";

export const PROMPTS = {
  evaluate_skills: (profile: UserProfile) => `
あなたはエンジニアのプロファイルを評価するエキスパートAIマネージャーです。
以下のプロフィール情報に基づいて、エンジニアの現状を分析し、JSONフォーマットで回答してください。

プロフィール:
職種（現在）: ${profile.role}
目指しているロール: ${profile.targetRole || '未設定'}
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
あなたは経験豊富なエンジニアリングマネージャーです。
以下のプロフィールに基づいて、${months}ヶ月の学習ロードマップを生成してください。

# ユーザープロフィール
- 現在のロール: ${profile.role}
- 目指しているロール: ${profile.targetRole || '未設定'}
- 経験年数: ${profile.experienceYears}年
- 目標: ${profile.goals}
- 現在のスキルレベル: ${JSON.stringify(profile.skills)}
- 学習期間: ${months}ヶ月

# ロードマップ生成の指示
1. **期間に応じたフェーズ分割**:
   - 3-6ヶ月: 2-3フェーズ（各2-3ヶ月）
   - 12ヶ月: 4フェーズ（各3ヶ月）
   - 18-24ヶ月: 6フェーズ（各3-4ヶ月）
   - 36ヶ月: 6フェーズ（各6ヶ月）

2. **各フェーズの構成**:
   - フェーズ名（例: "1-3ヶ月目: 基礎固め"）
   - 学習目標
   - 重点技術スタック (focusAreas)
   - マイルストーン（資格、成果物など）
   - 推奨課題テーマ (recommendedChallenges): 各フェーズで取り組むべき具体的な課題案を2-3個

3. **目標との整合性**:
   - ユーザーの目標「${profile.goals}」に直接結びつく内容
   - 現在のスキルレベルから無理なく成長できる計画

出力形式（JSONのみ）:
{
  "totalMonths": ${months},
  "phases": [
    {
      "phaseNumber": 1,
      "period": "1-3ヶ月目",
      "focus": "基礎固めとSpring Cloud入門",
      "goals": ["...", "..."],
      "focusAreas": ["Spring Boot", "Docker", "AWS基礎"],
      "milestones": ["AWS SAA取得", "マイクロサービス構築"],
      "recommendedChallenges": [
        "商品管理マイクロサービス構築",
        "Spring Cloud Configサーバー実装"
      ],
      "details": "詳細なアドバイス..."
    },
    ...
  ]
}

必ず日本語で回答してください。
`,

  generate_challenges: (profile: UserProfile, phaseInfo?: any, reviewAnalysis?: any) => `
あなたは経験豊富なエンジニアリングマネージャーです。
以下の情報に基づいて、今週取り組むべき「課題（Task）」を1つ生成してください。

# ユーザープロフィール
- 現在のロール: ${profile.role}
- 目指しているロール: ${profile.targetRole || '未設定'}
- 現在のスキルレベル: ${JSON.stringify(profile.skills)}
- 目標: ${profile.goals}

${phaseInfo ? `
# ロードマップの現在地
- フェーズ: ${phaseInfo.period}「${phaseInfo.focus}」
- 学習目標: ${phaseInfo.goals?.join(', ') || phaseInfo.focus}
- 重点技術: ${phaseInfo.focusAreas?.join(', ') || '特になし'}
- 推奨課題テーマ: ${phaseInfo.recommendedChallenges?.join(', ') || '特になし'}
` : ''}

${reviewAnalysis ? `
# 過去のレビュー分析（弱点を補強）
- 頻出の弱点: ${reviewAnalysis.weaknesses?.join(', ') || '特になし'}
- 平均スコアが低い領域: ${reviewAnalysis.lowestArea || '特になし'}
` : ''}

# 課題生成の指示
1. **ロードマップとの整合性**:
   ${phaseInfo ? `- 現在フェーズ「${phaseInfo.focus}」の重点技術を含める
   - 推奨課題テーマから1つ選ぶか、類似の課題を生成` : '- ユーザーの目標に沿った内容'}

2. **過去のレビュー結果を反映**:
   - 弱点として指摘された領域を強化する要素を含める

3. **実践的な内容**:
   - 実務に近い設計・実装課題
   - PR単位（6-12個）の受け入れ条件（acceptanceCriteria）に分割

4. **適切な難易度**:
   - 現在のスキルレベルから、少し背伸びする程度
   - 1週間で完了できるボリューム

出力形式（JSONのみ）:
{
  "title": "課題のタイトル",
  "description": "詳細な説明（200-400文字）",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "acceptanceCriteria": [
    "設計のポイント",
    "実装のポイント",
    ... 6-12個
  ],
  "gainedSkills": [
    { "category": "backend", "points": 1.5 },
    { "category": "database", "points": 0.8 }
  ],
  "learningGoal": "この課題で何を学ぶか（1-2文）"
}

必ず日本語で回答してください。
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
