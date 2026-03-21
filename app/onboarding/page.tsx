"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Target, Zap, Rocket, CheckCircle2 } from "lucide-react";
import { getCurrentDateISO } from "@/lib/dateUtils";

export default function Onboarding() {
  const { profile, saveProfile, saveRoadmap } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProfileChange = (field: string, value: any) => {
    saveProfile({ ...profile, [field]: value });
  };

  const handleSkillChange = (skill: string, value: number) => {
    saveProfile({
      ...profile,
      skills: { ...profile.skills, [skill]: value }
    });
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    try {
      // Step 1: Evaluate Skills
      const evalRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_skills", payload: profile }),
      });
      const evaluation = await evalRes.json();
      
      const updatedProfile = { 
        ...profile, 
        evaluation, 
        hasCompletedOnboarding: true,
        onboardingCompletedDate: getCurrentDateISO(),
        roadmapStartDate: getCurrentDateISO()
      };
      await saveProfile(updatedProfile);

      // Step 2: Generate Roadmap
      const roadmapRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_roadmap", payload: { profile: updatedProfile, months: 36 } }),
      });
      const roadmap = await roadmapRes.json();
      await saveRoadmap(roadmap);

      router.push("/");
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-jp">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl rotate-3">
          {step}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">
            {step === 1 ? "Basic Profile / 基本プロファイル" : step === 2 ? "Skill Radar / 自己分析" : "Strategy / 成長戦略の構築"}
          </h1>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 w-12 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-8 sm:p-12 animate-fade-in relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/5 blur-[100px] pointer-events-none" />
        
        {step === 1 && (
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-indigo-400" /> 現在の職種・ロール
              </label>
              <input
                type="text"
                placeholder="例: フロントエンドエンジニア, Railsエンジニアなど"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={profile.role}
                onChange={(e) => handleProfileChange("role", e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap size={16} className="text-indigo-400" /> 経験年数
              </label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={profile.experienceYears}
                onChange={(e) => handleProfileChange("experienceYears", parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-indigo-400" /> 今後の目標・ありたい姿
              </label>
              <textarea
                placeholder="例: テックリードになりたい、フルスタックとして活躍したい"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all h-32"
                value={profile.goals}
                onChange={(e) => handleProfileChange("goals", e.target.value)}
              />
            </div>
            <button
              disabled={!profile.role || !profile.goals}
              onClick={() => setStep(2)}
              className="w-full py-5 bg-white text-black hover:bg-slate-200 disabled:opacity-20 rounded-2xl font-black text-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 italic font-jp"
            >
              次へ進む <ArrowRight size={24} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <p className="text-slate-400 font-bold mb-8">現在のスキルを1（未経験）から10（エキスパート）で自己評価してください。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {Object.entries(profile.skills).map(([skill, value]) => (
                <div key={skill} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {skill === 'frontend' ? 'フロントエンド' : 
                       skill === 'backend' ? 'バックエンド' : 
                       skill === 'infrastructure' ? 'インフラ' : 
                       skill === 'systemDesign' ? 'システム設計' : 
                       skill === 'database' ? 'データベース' : 
                       skill === 'security' ? 'セキュリティ' : '開発プロセス'}
                    </label>
                    <span className="text-2xl font-black text-indigo-400 italic">{value}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="w-full accent-indigo-500"
                    value={value}
                    onChange={(e) => handleSkillChange(skill, parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xl transition-all font-jp"
              >
                戻る
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 italic font-jp"
              >
                分析を開始 <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-10">
            <div className="relative">
               <div className="w-32 h-32 bg-indigo-600/20 rounded-full flex items-center justify-center animate-pulse">
                  <Rocket className="text-indigo-400" size={64} />
               </div>
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                  <Sparkles className="text-indigo-600" size={24} />
               </div>
            </div>
            
            <div className="text-center space-y-4">
               <h2 className="text-3xl font-black font-jp">成長戦略を構築しています</h2>
               <p className="text-slate-400 font-bold max-w-sm font-jp">
                  AIマネージャーがあなたのプロフィールを分析し、最適な36ヶ月のロードマップを作成しています。
               </p>
            </div>

            <button
              onClick={generateRoadmap}
              disabled={isGenerating}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 italic disabled:opacity-50 font-jp"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  AIが思考中...
                </>
              ) : (
                <>
                  <CheckCircle2 size={28} />
                  ロードマップを作成して開始
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
