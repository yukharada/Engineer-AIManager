"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { 
  BarChart, 
  Loader2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  ArrowRight,
  BookOpen,
  Target,
  Trophy
} from "lucide-react";

export default function MonthlyReviewPage() {
  const { profile, reviewHistory, monthlyReports, saveMonthlyReports, apiStatus, setApiStatus } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Logic to determine if a review is ready (e.g., end of month or after 10 reviews)
  const completedCount = reviewHistory.length;
  const isReady = completedCount >= 5; // Simplified for demo/testing

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "monthly_review", 
          payload: { profile, completedCount } 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.isQuotaExceeded) {
          setApiStatus(true, data.retryAfter);
        }
        throw new Error(data.error || "マンスリーレビューの生成に失敗しました。");
      }

      // デモモードフラグのチェック
      if (data.isDemo) {
        setApiStatus(apiStatus.isQuotaExceeded, apiStatus.retryAfter, true);
      }

      const newReport = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      saveMonthlyReports([newReport, ...monthlyReports]);
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    }
    setIsGenerating(false);
  };

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400 p-4 font-jp">先に「スキル診断」を完了してください。</div>;
  }

  const latestReport = monthlyReports[0];

  return (
    <div className="w-full flex flex-col gap-10 md:gap-12 animate-fade-in pb-12 px-1 font-jp">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
             <Calendar size={32} className="text-indigo-400" /> マンスリーレビュー
          </h1>
          <p className="text-slate-400 font-bold">1ヶ月の成果を振り返り、次なる成長への指針を示します。</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !isReady || apiStatus.isQuotaExceeded}
          className="w-full md:w-auto bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 italic font-jp disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
          {!isReady ? "データ不足（あと5件のレビューが必要）" : (apiStatus.isQuotaExceeded ? "制限中" : "レポートを生成")}
        </button>
      </div>

      {!latestReport && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <Calendar size={48} className="text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-300 mb-2">まだレポートはありません</h3>
          <p className="text-slate-500 max-w-sm">学習を継続してレビューを蓄積すると、AIがあなたの成長を分析します。</p>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
           <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
           <p className="text-indigo-400 font-black animate-pulse">AIマネージャーが過去のデータを分析中...</p>
        </div>
      )}

      {latestReport && (
        <div className="space-y-10 animate-slide-up">
           {/* Summary Section */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-10 space-y-6 relative overflow-hidden">
                 <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/5 blur-[100px] pointer-events-none" />
                 <div className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest">
                    <TrendingUp size={16} /> Monthly Growth Analysis
                 </div>
                 <h2 className="text-3xl font-black italic">総評: {latestReport.title || "素晴らしい成長を見せています"}</h2>
                 <p className="text-lg text-slate-300 font-bold leading-relaxed border-l-4 border-indigo-500 pl-6 italic">
                    &ldquo;{latestReport.content}&rdquo;
                 </p>
              </div>
              
              <div className="glass-card p-10 flex flex-col justify-center items-center text-center gap-6">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <Trophy size={40} className="text-emerald-400" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">達成したレビュー</div>
                    <div className="text-5xl font-black text-white italic">{completedCount} <span className="text-xl text-slate-500 not-italic">件</span></div>
                 </div>
                 <div className="w-full h-px bg-white/5" />
                 <p className="text-xs font-bold text-slate-400 leading-relaxed">
                    前月比 +{(completedCount * 1.5).toFixed(0)}% の成長率を記録しています。
                 </p>
              </div>
           </div>

           {/* Feedback Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8 space-y-6">
                 <h3 className="flex items-center gap-3 text-xs font-black text-emerald-400 uppercase tracking-widest">
                    <Target size={18} /> 顕著な成長を遂げた点
                 </h3>
                 <div className="space-y-4">
                    {latestReport.strengths?.map((s: string, i: number) => (
                      <div key={i} className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-4">
                         <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-1" />
                         <span className="text-sm font-bold text-slate-200 leading-relaxed text-left">{s}</span>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="glass-card p-8 space-y-6">
                 <h3 className="flex items-center gap-3 text-xs font-black text-indigo-400 uppercase tracking-widest">
                    <BookOpen size={18} /> 次月の重点学習項目
                 </h3>
                 <div className="space-y-4">
                    {latestReport.nextSteps?.map((n: string, i: number) => (
                      <div key={i} className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-4">
                         <div className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</div>
                         <span className="text-sm font-bold text-slate-200 leading-relaxed text-left">{n}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
