import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "@/lib/prompts";
import { analyzeWeaknesses, identifyLowestScoreArea } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Demo mode
      return NextResponse.json({ demo: true, message: "Using demo mode, returning mock data." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp", generationConfig: { responseMimeType: "application/json" } });

    let prompt = "";
    if (action === "evaluate_skills") prompt = PROMPTS.evaluate_skills(payload);
    else if (action === "generate_roadmap") prompt = PROMPTS.generate_roadmap(payload.profile, payload.months);
    else if (action === "generate_challenges") {
      const { profile, reviewHistory } = payload;
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
      
      // If payload is just profile (old format), we handle it
      const userProfile = profile || payload;
      prompt = PROMPTS.generate_challenges(userProfile, analysis);
    }
    else if (action === "review_code") prompt = PROMPTS.review_code(payload.code, payload.challengeContext, payload.targetCriteriaIndices);
    else if (action === "monthly_review") prompt = PROMPTS.monthly_review(payload.profile, payload.completedCount);
    else throw new Error("Invalid action");

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
