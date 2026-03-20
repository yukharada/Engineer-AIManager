import { getCurrentDateISO } from "./dateUtils";
import { UserProfile, Challenge } from "./types";

export const PROMPTS = {
  evaluate_skills: (profile: UserProfile) => `
You are an expert AI Engineering Manager evaluating an engineer's profile.
Profile Role: ${profile.role}
Experience: ${profile.experienceYears} years
Profile Goals: ${profile.goals}
Self-assessed Skills (1-10):
- Frontend: ${profile.skills.frontend}
- Backend: ${profile.skills.backend}
- Infrastructure: ${profile.skills.infrastructure}
- System Design: ${profile.skills.systemDesign}
- Database: ${profile.skills.database}
- Security: ${profile.skills.security}
- Dev Process: ${profile.skills.devProcess}

Return a valid JSON string with the following structure:
{
  "summary": "現在のレベルとポテンシャルについての2〜3文の総評",
  "strengths": ["強み1", "強み2", "強み3"],
  "areasForImprovement": ["改善点1", "改善点2"],
  "recommendedFocus": "今最も注力すべき1つの優先事項"
}

IMPORTANT: All text values in the JSON output MUST be entirely in Japanese.
`,

  generate_roadmap: (profile: UserProfile, months: number = 36) => `
あなたはエンジニアのスキルアップを導く、熟練のAIエンジニアリングマネージャーです。
以下のプロフィールに基づき、${months}ヶ月間の成長ロードマップを作成してください。
Profile: ${JSON.stringify(profile)}

以下の構造を持つ JSON 配列を出力してください。スケジュールは全体で${months}ヶ月間になるように、${months <= 6 ? '1ヶ月ごと' : (months <= 12 ? '2〜3ヶ月ごと' : '四半期または半年ごと')}にフェーズを分けてください。
[
  {
    "period": "期間 (例: 1ヶ月目, 1〜3ヶ月目, Q1 など)",
    "focus": "この期間の主要な目標・テーマ",
    "milestones": ["マイルストーン1", "マイルストーン2", "マイルストーン3"],
    "details": "どのような技術をなぜ学ぶべきか、推奨される学習リソースや、実践すべき具体的なプロジェクトのアイデアなど、実行可能で詳細なアドバイスを記述してください。"
  }
]

IMPORTANT: All text values in the JSON output MUST be entirely in Japanese.
`,

  generate_challenges: (profile: UserProfile, analysis?: { 
    weaknesses: { issue: string; count: number }[], 
    averageScores: any, 
    lowestArea: string,
    totalReviews: number
  }) => `
Based on the following engineer's profile, generate 3-4 practical coding/system tasks for this week.
Profile: ${JSON.stringify(profile)}

${analysis && analysis.totalReviews > 0 ? `
# **過去のレビュー結果（重要）**
- 総レビュー数: ${analysis.totalReviews}
- 頻出の弱点:
  ${analysis.weaknesses.slice(0, 5).map(w => `  - ${w.issue} (${w.count}回指摘)`).join('\n')}
- 平均スコア:
  - 設計: ${analysis.averageScores.design.toFixed(1)}
  - 命名: ${analysis.averageScores.naming.toFixed(1)}
  - エラーハンドリング: ${analysis.averageScores.errorHandling.toFixed(1)}
  - テスト: ${analysis.averageScores.testing.toFixed(1)}
  - パフォーマンス: ${analysis.averageScores.performance.toFixed(1)}
- **最も改善が必要な領域: ${analysis.lowestArea}**

# 課題生成の追加指示:
- 過去のレビューで頻出した弱点（特に「${analysis.lowestArea}」）を補強する要素を必ず課題に含めてください。
` : ''}

CRITICAL INSTRUCTION: Analyze the user's self-assessed Skills (1-10) before generating tasks.
- The user is an INDIVIDUAL LEARNER (独学・個人開発), NOT working in a team environment. Do not suggest tasks that require teammates, PR reviews by others, or enterprise team environments.
- Provide HIGHLY SPECIFIC AND CONCRETE tasks (e.g., "Build a CLI tool that fetches weather from XYZ API and caches it in SQLite" instead of "Learn an API").
- If a skill is low (1-3), assign BEGINNER tasks focused on basics, tutorials, and fundamental understanding.
- If a skill is medium (4-7), assign INTERMEDIATE tasks focused on practical implementation, optimization, and real-world features.
- If a skill is high (8-10), assign ADVANCED tasks focused on architecture, performance tuning, system design, or mentoring others.
Make sure the tasks are challenging but highly achievable for their EXACT current skill level.

IMPORTANT STIPULATION FOR ACCEPTANCE CRITERIA:
The "acceptanceCriteria" must be broken down into VERY GRANULAR steps that represent individual Pull Requests (PRs). Do not make them broad. 
For example, for a backend task, break it down like: ["DBスキーマ設計とマイグレーション作成", "DBモックデータのシード作成", "Entity/Model層の実装", "Repository層のCRUD実装", "Repositoryの単体テスト", "API/Controllerのエンドポイント実装", "E2Eテストの実装"].
For a frontend task: ["Figma等でのコンポーネント設計", "UIコンポーネント(A)のモック実装", "UIコンポーネント(B)のモック実装", "状態管理(Store/Hooks)の実装とテスト", "APIクライアントの作成", "API通信との結合", "エラーハンドリングの実装"].
Provide 6-12 highly specific, finely-sliced granular criteria per task. Do not hesitate to make the list long if it means the PRs are smaller and easier to review.

Return a valid JSON string:
[
  {
    "id": "unique-id-1",
    "title": "具体的で作るものが明確なタスクのタイトル",
    "description": "何を作るのか、どの技術を使うのかの具体的なシナリオ・実装要件（なぜこのレベルのあなたにこの個人課題を出したのかの理由も含める）",
    "acceptanceCriteria": ["DBスキーマ設計とマイグレーション作成 (PR 1)", "Entity層の実装 (PR 2)", "Repository層の実装 (PR 3)", "UseCaseのテスト作成 (PR 4)"],
    "gainedSkills": [
      { "category": "backend", "points": 1.5 },
      { "category": "database", "points": 0.5 }
    ],
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "completed": false
  }
]

IMPORTANT: The "difficulty" field MUST be in English ("Beginner", "Intermediate", or "Advanced"), but all other text fields MUST be entirely in Japanese. For "category" in "gainedSkills", it MUST be one of: "frontend", "backend", "infrastructure", "systemDesign", "database", "security", "devProcess". Points should be between 0.1 and 2.0 based on difficulty and size.
`,

  review_code: (codeOrUrl: string, challengeContext?: Challenge, targetCriteriaIndices?: number[]) => {
    let contextStr = '';
    if (challengeContext) {
      if (targetCriteriaIndices && targetCriteriaIndices.length > 0) {
        const targetCriteria = targetCriteriaIndices.map(i => challengeContext.acceptanceCriteria[i]);
        contextStr = `
Context: This work was submitted for specific parts (Pull Requests) of the following challenge:
Title: ${challengeContext.title}
Target Acceptance Criteria (PR Scope):
${targetCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

The user is ONLY submitting work for these specific criteria right now. Do not penalize them for not completing the entire task, but DO strictly evaluate if they met these specific Target Acceptance Criteria.`;
      } else {
        contextStr = `
Context: This work was submitted for the entire following challenge:
Title: ${challengeContext.title}
Acceptance Criteria: ${challengeContext.acceptanceCriteria.join(', ')}`;
      }
    }

    const evaluateStr = challengeContext 
      ? ' strictly against the Target Acceptance Criteria defined above, and additionally' 
      : '';
      
    const summaryStr = challengeContext 
      ? '（受け入れ条件を満たしているかどうかも含める）' 
      : '';

    return `
You are a Staff Engineer reviewing work.
Input to review: ${codeOrUrl}
${contextStr}

Evaluate the submission${evaluateStr} on general engineering best practices.
If the input is an architectural or infrastructure design document, review it as a Staff Engineer evaluating technical design instead of code.

Return a valid JSON string:
{
  "score": number (0-100),
  "approved": boolean (true if the code satisfactorily meets the Target Acceptance Criteria, false otherwise),
  "summary": "短いフィードバックの要約",
  "categories": {
    "design": "アーキテクチャや設計に関するコメント",
    "naming": "命名や可読性に関するコメント",
    "performance": "パフォーマンスに関するコメント",
    "security": "セキュリティに関するコメント",
    "testing": "テストカバレッジに関するコメント"
  }
}
All text values MUST be in Japanese.
`;
  },

  monthly_review: (profile: UserProfile, completedChallengesCount: number) => `
You are the Engineer Manager doing a monthly performance review.
Current System Date is: ${getCurrentDateISO()}
The user completed ${completedChallengesCount} challenges this month.
Profile: ${JSON.stringify(profile)}

Return a valid JSON string:
{
  "month": "現在の月 (例: 10月, 2023年10月)",
  "completedChallengesCount": ${completedChallengesCount},
  "skillImprovements": ["〜を通じてXのスキルが向上した", "Yの能力を証明した"],
  "managerNarrative": "1on1のような温かみのあるプロフェッショナルな視点での、今月の振り返りメッセージ",
  "recommendations": ["来月に向けた提案や学習内容1", "提案2"]
}

IMPORTANT: All text values in the JSON output MUST be entirely in Japanese.
`
};
