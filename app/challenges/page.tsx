"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { CheckSquare, Loader2, Zap, CheckCircle2, GitPullRequest, ArrowRight, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { getCurrentDateISO, getChallengeDeadline, formatRelativeTime, isOverdue } from "@/lib/dateUtils";

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = { frontend: "フロントエンド", backend: "バックエンド", infrastructure: "インフラ", systemDesign: "システム設計", database: "DB", security: "セキュリティ", devProcess: "開発プロセス" };
  return map[cat] || cat;
};

// Simple UUID v4 generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function Challenges() {
  const { profile, challenges, saveChallenges, reviewHistory, apiStatus, setApiStatus } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "generate_challenges", 
          payload: { profile, reviewHistory } 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.isQuotaExceeded) {
          setApiStatus(true, data.retryAfter);
        }
        throw new Error(data.error || "課題の生成に失敗しました。");
      }

      // デモモードフラグのチェック
      if (data.isDemo || (Array.isArray(data) && data.some((c: any) => c.isDemo))) {
        setApiStatus(apiStatus.isQuotaExceeded, apiStatus.retryAfter, true);
      }

      if (Array.isArray(data)) {
        const now = getCurrentDateISO();
        const challengesWithDates = data.map((c: any) => ({
          ...c,
          id: generateUUID(),
          createdAt: now,
          deadline: getChallengeDeadline(now, 7),
        }));
        saveChallenges(challengesWithDates);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    }
    setIsGenerating(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Intermediate": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Advanced": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "Beginner": return "初級";
      case "Intermediate": return "中級";
      case "Advanced": return "上級";
      default: return diff;
    }
  };

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400 p-4 font-jp">先に「スキル診断」を完了してください。</div>;
  }

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12 px-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
             <CheckSquare size={32} className="text-indigo-400" /> 週間チャレンジ
          </h1>
          <p className="text-slate-400 font-bold">あなたの弱点とロードマップに基づいた実践課題。</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || apiStatus.isQuotaExceeded}
          className="w-full md:w-auto bg-white text-black hover:bg-slate-200 disabled:opacity-50 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] font-jp disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
          {apiStatus.isQuotaExceeded ? "制限中" : (challenges.length > 0 ? "課題を再生成" : "課題を取得")}
        </button>
      </div>

      {challenges.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <CheckSquare size={48} className="text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-300 mb-2">アクティブな課題はありません</h3>
          <p className="text-slate-500 max-w-sm">「課題を取得」をクリックして、新しいコーディングチャレンジを始めましょう。</p>
        </div>
      )}

      {challenges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {challenges.map((c, i) => {
            const overdue = c.deadline && !c.completed && isOverdue(c.deadline);
            return (
              <div key={c.id} className={`glass-card p-6 sm:p-8 flex flex-col gap-6 transition-all duration-300 ${c.completed ? "opacity-60 grayscale" : "hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)]"} ${overdue ? 'border-red-500/30' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${getDifficultyColor(c.difficulty)} font-jp`}>
                    {getDifficultyLabel(c.difficulty)}
                  </span>
                  <div className="text-slate-400">
                    {c.completed ? <CheckCircle2 size={28} className="text-indigo-400" /> : <div className="w-7 h-7 border-2 border-slate-800 rounded-full" />}
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${c.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{c.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {c.gainedSkills && c.gainedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {c.gainedSkills.map((gs, k) => (
                          <span key={k} className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-tighter font-jp">
                            <TrendingUp size={12} />
                            {getCategoryLabel(gs.category)} +{gs.points}
                          </span>
                        ))}
                      </div>
                    )}
                    {c.deadline && !c.completed && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 uppercase tracking-tighter font-jp ${overdue ? 'text-red-400 border-red-500/30 bg-red-500/5' : 'text-slate-400'}`}>
                        {overdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                        期限: {formatRelativeTime(c.deadline)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 text-sm font-bold leading-relaxed flex-grow">{c.description}</p>
                
                <div className="pt-6 border-t border-white/5 flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between font-jp">
                      <span>達成条件 / PR分割</span>
                      <span className="text-indigo-400/70 italic uppercase">Auto-Sync</span>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {c.acceptanceCriteria.map((ac, j) => {
                         const isAcComplete = c.completedCriteria?.[j] || c.completed;
                        return (
                          <li key={j} className="text-sm flex items-start gap-4 group/item">
                            <div className={`mt-0.5 shrink-0 transition-colors ${isAcComplete ? 'text-indigo-400' : 'text-slate-700 group-hover/item:text-slate-500'}`}>
                              {isAcComplete ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] border-2 border-slate-800 rounded-full group-hover/item:border-slate-700" />}
                            </div>
                            <span className={`font-bold transition-colors ${isAcComplete ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{ac}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  {!c.completed && (
                    <Link 
                      href={apiStatus.isQuotaExceeded ? "#" : `/review?challengeId=${c.id}`}
                      className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-sm font-black transition-all group border font-jp ${
                        apiStatus.isQuotaExceeded 
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50' 
                        : overdue 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                        : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      <GitPullRequest size={18} />
                      {apiStatus.isQuotaExceeded ? "制限中" : "レビューを依頼する"}
                      <ArrowRight size={18} className={`transition-all font-jp ${apiStatus.isQuotaExceeded ? 'hidden' : 'opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0'}`} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
