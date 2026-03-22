import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "@/lib/prompts";
import { analyzeWeaknesses, identifyLowestScoreArea } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  // スコープの問題を避けるため、関数の最上位で定義
  let apiAction: string = "unknown";
  let apiPayload: any = null;

  try {
    const body = await req.json();
    apiAction = body.action || "unknown";
    apiPayload = body.payload || null;

    const apiKey = process.env.GEMINI_API_KEY;
    
    // 1. APIキーがない場合はデモモード
    if (!apiKey) {
      console.log("[Gemini API] No API key found, returning demo data.");
      return getDemoResponse(apiAction, apiPayload);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ユーザーのリクエストに基づき gemini-2.0-flash を優先候補に追加
    const MODEL_CANDIDATES = [
      "gemini-2.0-flash",
      "gemini-1.5-flash", 
      "gemini-1.5-flash-latest", 
      "gemini-pro"
    ];
    
    let lastError = null;
    let text = "";

    // モデルを順番に試す
    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName, 
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

        console.log(`[Gemini API] Trying model: ${modelName} | Action: ${apiAction}`);
        const result = await model.generateContent(prompt);
        text = result.response.text();
        
        if (text) break;
      } catch (err: any) {
        console.warn(`[Gemini API] Failed with ${modelName}:`, err.message);
        lastError = err;
        if (err.message?.includes("404") || err.message?.includes("not found")) {
          continue;
        }
        // クォータエラーなどの場合はループを抜けてエラー処理へ
        break; 
      }
    }

    if (!text && lastError) throw lastError;
    if (!text) throw new Error("AIからの応答が空でした。");

    try {
        const parsed = JSON.parse(text);
        return NextResponse.json(parsed);
    } catch (parseError) {
        const cleanText = text.replace(/```json\s?|\s?```/g, '').trim();
        return NextResponse.json(JSON.parse(cleanText));
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");
    
    if (isQuotaError) {
      let retryAfter = null;
      const match = error.message?.match(/retry in ([\d\.]+)s/);
      if (match) {
        const seconds = parseFloat(match[1]);
        retryAfter = new Date(Date.now() + (seconds + 2) * 1000).toISOString();
      } else {
        retryAfter = new Date(Date.now() + 60 * 1000).toISOString();
      }
      
      return NextResponse.json({ 
        error: "API利用制限に達しました。", 
        isQuotaExceeded: true,
        retryAfter 
      }, { status: 429 });
    }

    // デモデータへのフォールバック（isDemoフラグを付与）
    console.warn("[Gemini API] Final Fallback to demo data.");
    return getDemoResponse(apiAction, apiPayload);
  }
}

function getDemoResponse(action: string, payload: any) {
  let data: any = { isDemo: true }; // UI側で検知できるようフラグを追加
  
  if (action === "evaluate_skills") {
    Object.assign(data, {
      summary: "バックエンドエンジニアとしての基礎がしっかりしており、さらなる高みを目指せるポテンシャルがあります。(DEMO)",
      strengths: ["プログラミング基礎", "論理的思考"],
      areasForImprovement: ["クラウドインフラの実践経験", "分散システムの深い理解"],
      recommendedFocus: "クラウドネイティブ技術とスケーラブルなシステム設計"
    });
  } else if (action === "generate_roadmap") {
    data = [
      {
        period: "1-6ヶ月目",
        focus: "クラウド基礎 & インフラ自動化 (DEMO)",
        milestones: ["AWS SAA取得", "Terraformによる環境構築の実践"],
        details: "クラウドサービスの基本からIaCによる自動化までを網羅します。",
        isDemo: true
      },
      {
        period: "7-12ヶ月目",
        focus: "スケーラブルアーキテクチャ (DEMO)",
        milestones: ["マイクロサービス設計の実装", "分散メッセージングの導入"],
        details: "大規模トラフィックを支えるための設計と実装技術を学びます。",
        isDemo: true
      }
    ];
  } else if (action === "generate_challenges") {
    data = [
      {
        id: "demo-task-1",
        title: "RESTful APIのパフォーマンス最適化 (DEMO)",
        description: "既存のAPIエンドポイントのレスポンス時間を改善してください。(DEMO)",
        acceptanceCriteria: ["クエリチューニングの実施", "キャッシュ戦略の導入", "N+1問題の解消"],
        difficulty: "Intermediate",
        gainedSkills: [{ category: "backend", points: 1 }],
        isDemo: true
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
  }

  return NextResponse.json(data);
}
