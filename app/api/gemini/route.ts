import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "@/lib/prompts";
import { analyzeWeaknesses, identifyLowestScoreArea } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  let apiAction: string = "unknown";
  let apiPayload: any = null;

  try {
    const body = await req.json();
    apiAction = body.action || "unknown";
    apiPayload = body.payload || null;

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("[Gemini API] No API key found, returning demo data.");
      return getDemoResponse(apiAction, apiPayload);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    /**
     * 最新のGeminiモデル候補リスト
     * 2026年3月現在のGemini 2.5 / 3.x シリーズを含め、多面的なフォールバックを構成します。
     */
    const MODEL_CANDIDATES = [
      "gemini-3.1-flash",       // 最新のFlashモデル
      "gemini-3.1-pro",         // 最新のProモデル
      "gemini-2.5-flash",       // 2.5シリーズ
      "gemini-2.5-pro",
      "gemini-1.5-flash-latest", // 1.5系の安定版
      "gemini-1.5-flash",
      "gemini-1.5-flash-002",
      "gemini-2.0-flash",       // 前世代のFlash
      "gemini-pro"
    ];
    
    let lastError = null;
    let text = "";
    let quotaErrorInfo = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`[Gemini API] Trying model: ${modelName} | Action: ${apiAction}`);
        
        // 明示的なモデルID指定
        const modelId = modelName.startsWith("models/") ? modelName : `models/${modelName}`;
        const model = genAI.getGenerativeModel({ 
          model: modelId, 
          generationConfig: { responseMimeType: "application/json" } 
        });

        let prompt = "";
        if (apiAction === "evaluate_skills") prompt = PROMPTS.evaluate_skills(apiPayload);
        else if (apiAction === "generate_roadmap") prompt = PROMPTS.generate_roadmap(apiPayload.profile, apiPayload.months);
        else if (apiAction === "generate_challenges") {
          const { profile, reviewHistory } = apiPayload;
          let analysis = undefined;
          
          if (reviewHistory && Array.isArray(reviewHistory) && reviewHistory.length > 0) {
            const { weaknesses, averageScores } = analyzeWeaknesses(reviewHistory);
            const lowestArea = identifyLowestScoreArea(averageScores);
            analysis = {
              weaknesses,
              averageScores,
              lowestArea,
              totalReviews: reviewHistory.length
            };
          }
          
          const userProfile = profile || apiPayload;
          prompt = PROMPTS.generate_challenges(userProfile, analysis);
        }
        else if (apiAction === "review_code") prompt = PROMPTS.review_code(apiPayload.code, apiPayload.challengeContext, apiPayload.targetCriteriaIndices);
        else if (apiAction === "monthly_review") prompt = PROMPTS.monthly_review(apiPayload.profile, apiPayload.completedCount);
        else throw new Error("Invalid action");

        const result = await model.generateContent(prompt);
        text = result.response.text();
        
        if (text) {
          console.log(`[Gemini API] Success with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini API] Error logic for ${modelName}:`, err.message);
        lastError = err;
        
        if (err.message?.includes("429") || err.message?.includes("quota")) {
           let retryAfter = null;
           const match = err.message?.match(/retry in ([\d\.]+)s/) || err.message?.match(/retryAfter: ([\d\.]+)s/);
           if (match) {
             const seconds = parseFloat(match[1]);
             retryAfter = new Date(Date.now() + (seconds + 2) * 1000).toISOString();
           } else {
             retryAfter = new Date(Date.now() + 60 * 1000).toISOString();
           }
           quotaErrorInfo = { isQuotaExceeded: true, retryAfter };
        }
        continue;
      }
    }

    if (!text && quotaErrorInfo) {
       console.warn("[Gemini API] All models exhausted (Rate-limited). Returning demo fallback.");
       return getDemoResponse(apiAction, apiPayload, quotaErrorInfo);
    }

    if (!text && lastError) {
       return getDemoResponse(apiAction, apiPayload);
    }

    if (!text) throw new Error("AIからの応答が空でした。");

    try {
        const parsed = JSON.parse(text);
        return NextResponse.json(parsed);
    } catch (parseError) {
        console.error("[Gemini API] JSON Parse Error. Raw text:", text);
        const cleanText = text.replace(/```json\s?|\s?```/g, '').trim();
        return NextResponse.json(JSON.parse(cleanText));
    }

  } catch (error: any) {
    console.error("Gemini API Fatal Error:", error);
    return getDemoResponse(apiAction, apiPayload);
  }
}

/**
 * デモ用レスポンス
 */
function getDemoResponse(action: string, payload: any, extraInfo: any = {}) {
  let data: any = { isDemo: true, ...extraInfo };
  
  if (action === "evaluate_skills") {
    Object.assign(data, {
      summary: "バックエンドエンジニアとしての基礎がしっかりしており、さらなる高みを目指せるポテンシャルがあります。(DEMO)",
      strengths: ["プログラミング基礎", "論理的思考"],
      areasForImprovement: ["クラウドインフラの実踐経験", "分散システムの深い理解"],
      recommendedFocus: "クラウドネイティブ技術とスケーラブルなシステム設計"
    });
  } else if (action === "generate_roadmap") {
    data = (Array.isArray(data)) ? data : [
      {
        period: "1-6ヶ月目",
        focus: "クラウド基礎 & インフラ自動化 (DEMO)",
        milestones: ["AWS SAA取得", "Terraformによる環境構築の実踐"],
        details: "クラウドサービスの基本からIaCによる自動化までを網羅します。",
        isDemo: true,
        ...extraInfo
      },
      {
        period: "7-12ヶ月目",
        focus: "スケーラブルアーキテクチャ (DEMO)",
        milestones: ["マイクロサービス設計の実装", "分散メッセージングの導入"],
        details: "大規模トラフィックを支えるための設計と実装技術を学びます。",
        isDemo: true,
        ...extraInfo
      }
    ];
  } else if (action === "generate_challenges") {
    data = (Array.isArray(data)) ? data : [
      {
        id: "demo-task-1",
        title: "RESTful APIのパフォーマンス最適化 (DEMO)",
        description: "既存のAPIエンドポイントのレスポンス時間を改善してください。(DEMO)",
        acceptanceCriteria: ["クエリチューニングの実施", "キャッシュ戦略の導入", "N+1問題の解消"],
        difficulty: "Intermediate",
        gainedSkills: [{ category: "backend", points: 1 }],
        isDemo: true,
        ...extraInfo
      }
    ];
  } else if (action === "review_code") {
    Object.assign(data, {
      status: "Approved",
      scores: { design: 8, naming: 9, errorHandling: 8, testing: 7, performance: 8 },
      feedback: "非常にクリーンなコードです。構造が分かりやすく、命名も適切です。(DEMO)",
      questions: ["この実装をより拡張しやすくするにはどうすれば良いでしょうか？"],
      nextFocus: "より複雑な例外パターンの考慮",
      detectedWeaknesses: ["一部の境界値テストの不足"],
      detectedStrengths: ["一貫した非同期処理の実装"]
    });
  } else if (action === "monthly_review") {
    Object.assign(data, {
       title: "素晴らしい成長を見せています (DEMO)",
       content: "この1ヶ月で、バックエンド開発におけるベストプラクティスを一貫して適用できるようになりました。課題の達成率も高く、エンジニアとしての基礎体力が向上しています。",
       strengths: ["適切なエラーハンドリングの実写", "コードの可読性向上"],
       nextSteps: ["分散トレーシングの導入検討", "負荷試験ツールの活用"],
       isDemo: true,
       ...extraInfo
    });
  }

  return NextResponse.json(data);
}
