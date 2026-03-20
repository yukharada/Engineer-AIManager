"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Compass, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Star } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [skills, setSkills] = useState({
    frontend: 5,
    backend: 5,
    infrastructure: 5,
    systemDesign: 5,
    database: 5,
    security: 5,
    devProcess: 5,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { saveProfile } = useStore();
  const router = useRouter();

  const handleComplete = async () => {
    setIsGenerating(true);
    try {
      const profile = {
        role,
        experienceYears: Number(experience),
        goals,
        skills,
        hasCompletedOnboarding: true,
        currentSystemDate: new Date().toISOString(),
      };

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_skills", payload: profile }),
      });
      const evaluation = await res.json();
      
      saveProfile({ ...profile, evaluation });
      router.push("/");
    } catch (e) {
      console.error(e);
      // Fallback
      saveProfile({
        role,
        experienceYears: Number(experience),
        goals,
        skills,
        hasCompletedOnboarding: true,
        currentSystemDate: new Date().toISOString(),
      });
      router.push("/");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 md:py-10 animate-fade-in px-2 sm:px-4">
      <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-500/20">
          <Compass className="text-white" size={24} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight italic">AIエンジニアマネージャー診断</h1>
      </div>

      <div className="glass-card p-6 sm:p-8 lg:p-10 transition-all">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-slate-500 border border-white/10"}`}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? "text-indigo-400" : "text-slate-600"}`}>
                {s === 1 ? "Role" : s === 2 ? "Skills" : "Review"}
              </span>
            </div>
          ))}
          <div className="absolute h-[2px] bg-white/5 w-[60%] sm:w-[70%] left-[20%] sm:left-[15%] top-[108px] sm:top-[124px] -z-10" />
        </div>

        {step === 1 && (
          <div className="space-y-6 sm:space-y-8 animate-slide-up">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">現在のロールまたは目指している職種</label>
              <input 
                type="text" 
                placeholder="例: Senior Full-stack Engineer, SRE"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 sm:p-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-base sm:text-xl font-bold font-inter"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">エンジニア経験年数</label>
                <input 
                  type="number" 
                  placeholder="3"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full p-4 sm:p-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-base sm:text-xl font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">現在の目標 (短期的)</label>
                <input 
                  type="text" 
                  placeholder="例: AWS設計の習得"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full p-4 sm:p-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-base sm:text-xl font-bold"
                />
              </div>
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={!role || !experience || !goals}
              className="w-full py-4 sm:py-5 bg-white text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-400 hover:text-white transition-all disabled:opacity-30 shadow-xl"
            >
              次へ進む <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-6">
              {Object.keys(skills).map((s) => (
                <div key={s} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-black capitalize text-slate-300">{s.replace(/([A-Z])/g, ' $1')}</label>
                    <span className="text-sm font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md">LEVEL {skills[s as keyof typeof skills]}</span>
                  </div>
                  {/* Custom Slider for better mobile touch */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                       <button
                         key={val}
                         onClick={() => setSkills({ ...skills, [s]: val })}
                         className={`h-10 sm:h-12 rounded-lg font-black text-xs sm:text-sm transition-all border ${
                           skills[s as keyof typeof skills] === val 
                             ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105" 
                             : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                         }`}
                       >
                         {val}
                       </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 sm:py-5 border border-white/10 rounded-2xl font-black text-slate-400 flex items-center justify-center gap-3 hover:bg-white/5">
                <ArrowLeft size={20} /> 戻る
              </button>
              <button onClick={() => setStep(3)} className="flex-[2] py-4 sm:py-5 bg-white text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-400">
                確認画面へ <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slide-up text-center">
            <div className="py-10">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <Star className="text-emerald-400" size={40} />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">AIマネージャーによる分析準備完了</h2>
              <p className="text-slate-400 font-bold max-w-sm mx-auto">
                入力されたスキルに基づき、あなた専用の成長戦略を生成し、ダッシュボードを最適化します。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-4 sm:py-5 border border-white/10 rounded-2xl font-black text-slate-400 flex items-center justify-center gap-3 hover:bg-white/5">
                <ArrowLeft size={20} /> 修正する
              </button>
              <button 
                onClick={handleComplete} 
                disabled={isGenerating}
                className="flex-[2] py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                {isGenerating ? "分析中..." : "診断を開始しダッシュボードへ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
