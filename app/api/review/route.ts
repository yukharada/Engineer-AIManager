import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { code, acceptanceCriteria, userProfile, taskContext } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `あなたは10年以上の経験を持つシニアスタッフエンジニアです。
以下のコードを厳密にレビューし、学びを促す問いかけを含めてフィードバックしてください。

# ユーザープロフィール
- 現在のスキルレベル: ${JSON.stringify(userProfile.skills, null, 2)}
- 過去に指摘された弱点: ${(userProfile.weaknesses || []).join(', ')}
- 評価された強み: ${(userProfile.strengths || []).join(', ')}

# 課題の学習目的
${taskContext.learningGoal}

# レビュー対象
受け入れ条件: ${typeof acceptanceCriteria === 'string' ? acceptanceCriteria : acceptanceCriteria.title}

提出コード:
\`\`\`
${code}
\`\`\`

# レビュー指示
以下の5つの観点で評価してください:

## 1. 設計 (Design) - 0-10点
- アーキテクチャの妥当性
- 責務の分離（単一責任原則）
- 拡張性・保守性
- **問いかけ例**: 「なぜこの設計パターンを選びましたか？他の選択肢と比較してどうですか？」

## 2. 命名 (Naming) - 0-10点
- 変数名・メソッド名の明確さ
- ドメイン用語の適切な使用
- 一貫性
- **問いかけ例**: 「この変数名は5年後に読んだ人に意図が伝わりますか？」

## 3. エラーハンドリング (Error Handling) - 0-10点
⚠️ ユーザーの弱点領域のため特に厳しく評価
- 例外処理の網羅性
- エッジケースへの対応
- エラーメッセージの有用性
- **問いかけ例**: 「DBが停止している場合、このコードはどう振る舞いますか？」

## 4. テスト (Testing) - 0-10点
- テストケースの網羅性
- 境界値テスト
- モック/スタブの適切な使用
- **問いかけ例**: 「どのようなテストケースを追加すれば、より堅牢になりますか？」

## 5. パフォーマンス & セキュリティ - 0-10点
- N+1問題
- SQLインジェクション
- メモリリーク
- **問いかけ例**: 「100万件のデータでこのクエリは問題なく動きますか？」

# 判定基準
- **Approved（承認）**: すべての観点で7点以上、かつ重大な問題なし
- **Changes Requested（修正依頼）**: 1つ以上の観点で6点以下、または致命的な問題あり

# 出力形式（重要）
**必ず以下のJSON形式のみで回答してください。前後に説明文や\`\`\`jsonなどは不要です。**

{
  "status": "Approved" または "Changes Requested",
  "scores": {
    "design": 8,
    "naming": 9,
    "errorHandling": 6,
    "testing": 7,
    "performance": 8
  },
  "feedback": "具体的なフィードバック（日本語で250-400文字。褒めるべき点と改善点をバランス良く記載）",
  "questions": [
    "このエッジケースではどうなりますか？（具体例を挙げる）",
    "なぜこのアプローチを選びましたか？代替案は検討しましたか？",
    "パフォーマンス面でのトレードオフは何ですか？"
  ],
  "nextFocus": "次の課題で重点的に学ぶべき技術やパターン（具体的に）",
  "detectedWeaknesses": ["エラーハンドリング", "テストカカバレッジ"],
  "detectedStrengths": ["コードの可読性", "命名規則の一貫性"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // JSONをパース（余計な文字を除去）
    const cleanedText = responseText
      .replace(/```json\n?|\n?```/g, '')
      .replace(/^[^{]*/, '')  // 最初の { より前を削除
      .replace(/[^}]*$/, '')  // 最後の } より後を削除
      .trim();
    
    const reviewResult = JSON.parse(cleanedText);

    return NextResponse.json(reviewResult);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'レビューの生成に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
