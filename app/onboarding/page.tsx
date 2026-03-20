"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sparkles, Loader2, Target } from "lucide-react";
import { SkillScores, UserProfile } from "@/lib/types";

export default function Onboarding() {
  const getLevelDescription = (level: number) => {
    switch(level) {
      case 1: return "1: まったくの未経験。IT用語や基本的な概念もこれから学ぶ状態。";
      case 2: return "2: チュートリアルを見ながら、簡単な環境構築と「Hello World」ができる。";
      case 3: return "3: リファレンスを検索しながら、ごく基本的な機能や画面を自力で作れる。";
      case 4: return "4: チームのサポートを受けつつ、既存コードの修正や小規模なタスクをこなせる。";
      case 5: return "5: 一次請けとして、一般的な機能要件を自力で実装でき、最低限のテストが書ける。";
      case 6: return "6: パフォーマンスや保守性をある程度意識し、自立して中規模の実装を担当できる。";
      case 7: return "7: シニアレベル。複雑な要件定義からDB・API設計まで独自に完遂できる。";
      case 8: return "8: チームの技術的負債を解消し、アーキテクチャの選定や他者のコードレビューを主導できる。";
      case 9: return "9: テックリードレベル。複数チームにまたがる技術課題を解決し、組織全体の開発力を底上げできる。";
      case 10: return "10: 業界トップクラス。特定の技術領域における真のエキスパートとして、新たな枠組みを創造できる。";
      default: return "";
    }
  };

  const router = useRouter();
  const { profile, saveProfile } = useStore();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(profile.role || "フロントエンドエンジニア");
  const [exp, setExp] = useState(profile.experienceYears || 2);
  const [goals, setGoals] = useState(profile.goals || "");
  const [skills, setSkills] = useState<SkillScores>({
    frontend: 5, backend: 5, infrastructure: 3, systemDesign: 3, database: 4, security: 3, devProcess: 5
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleDiagnose = async () => {
    setIsAnalyzing(true);
    const newProfile: UserProfile = { 
      role, 
      experienceYears: exp, 
      goals, 
      skills, 
      hasCompletedOnboarding: true,
      currentSystemDate: new Date("2026-03-15").toISOString()
    };
    
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_skills", payload: newProfile }),
      });
      const data = await res.json();
      setAiResult(data);
      saveProfile(newProfile);
    } catch (e) {
      console.error(e);
      // Fallback
      saveProfile(newProfile);
      setAiResult({ summary: "AIへの接続に失敗しました。", strengths: [], areasForImprovement: [], recommendedFocus: "" });
    }
    setIsAnalyzing(false);
  };

  if (aiResult) {
    return (
      <div className="max-w-3xl mx-auto w-full animate-fade-in flex flex-col gap-8">
        <div className="glass-card p-10 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold">分析完了</h2>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">"{aiResult.summary}"</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6 text-left">
            <div className="bg-black/40 p-6 rounded-xl border border-green-500/20">
              <h3 className="text-green-400 font-bold mb-3">現在の強み</h3>
              <ul className="list-disc pl-5 text-slate-300 flex flex-col gap-2">
                {aiResult.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-black/40 p-6 rounded-xl border border-orange-500/20">
              <h3 className="text-orange-400 font-bold mb-3">改善できる領域</h3>
              <ul className="list-disc pl-5 text-slate-300 flex flex-col gap-2">
                {aiResult.areasForImprovement?.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="w-full bg-indigo-500/10 p-6 rounded-xl border border-indigo-500/30 text-left mt-2">
            <h3 className="text-indigo-300 font-bold mb-2 flex items-center gap-2"><Target size={18}/> 最優先のフォーカス領域</h3>
            <p className="text-slate-200">{aiResult.recommendedFocus}</p>
          </div>

          <button 
            onClick={() => router.push("/roadmap")}
            className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-slate-200 w-full md:w-auto"
          >
            ロードマップを生成する
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-pulse-slow">
        <Loader2 className="animate-spin text-indigo-500" size={64} />
        <h2 className="text-2xl font-bold">AIマネージャーがあなたのプロフィールを分析中...</h2>
        <p className="text-slate-400">強みを把握し、最適な成長ベクトルを計算しています。</p>
      </div>
    );
  }

  const skillLabels: Record<string, string> = {
    frontend: "フロントエンド",
    backend: "バックエンド",
    infrastructure: "インフラ",
    systemDesign: "システム設計",
    database: "データベース",
    security: "セキュリティ",
    devProcess: "開発プロセス (CI/CDなど)"
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in flex flex-col gap-8 pb-20">
      <h1 className="text-4xl font-bold">スキル診断</h1>
      
      {step === 1 ? (
        <div className="glass-card p-8 flex flex-col gap-6 animate-slide-up">
          <h2 className="text-xl font-medium border-b border-white/10 pb-4">ステップ 1: プロフィール</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">現在の役割・役職</label>
            <input type="text" value={role} onChange={e => setRole(e.target.value)} 
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">エンジニア歴（年）</label>
            <input type="number" value={exp} onChange={e => setExp(parseInt(e.target.value)||0)} 
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">今後のキャリア目標</label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3} placeholder="例: 2年以内にテックリードになりたい"
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors" />
          </div>

          <button onClick={() => setStep(2)} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors">
            次へ: 自己評価
          </button>
        </div>
      ) : (
        <div className="glass-card p-8 flex flex-col gap-6 animate-slide-up">
          <h2 className="text-xl font-medium border-b border-white/10 pb-4">ステップ 2: スキルの自己評価</h2>
          <p className="text-slate-400 text-sm mb-4">現在の習熟度を1（初心者）〜10（エキスパート）で評価してください。</p>
          
          <div className="flex flex-col gap-6">
            {Object.keys(skills).map((key) => (
              <div key={key} className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <span className="font-medium text-slate-200 flex items-center gap-3">
                    {skillLabels[key]}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-indigo-400 font-mono bg-indigo-500/10 px-2 py-1 rounded-md text-sm">{skills[key as keyof SkillScores]}/10</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 -mt-1 mb-1 font-medium bg-black/30 p-2 rounded-lg border border-white/5">
                  目安: {getLevelDescription(skills[key as keyof SkillScores])}
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={skills[key as keyof SkillScores]} 
                  onChange={e => setSkills({...skills, [key]: parseInt(e.target.value)})}
                  className="w-full appearance-none bg-slate-800 h-2 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={() => setStep(1)} className="bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl transition-colors">
              戻る
            </button>
            <button onClick={handleDiagnose} className="flex-1 bg-white text-black hover:bg-slate-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Sparkles size={18}/> プロフィールを分析する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
