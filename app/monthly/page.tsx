"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { MonthlyReport } from "@/lib/types";
import { Loader2, LayoutDashboard, Target, Users, Settings } from "lucide-react";

export default function MonthlyReviewPage() {
  const { profile, challenges, monthlyReports, saveMonthlyReports } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const completedCount = challenges.filter(c => c.completed).length;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "monthly_review", payload: { profile, completedCount } }),
      });
      const data = await res.json();
      if (data.month) {
        saveMonthlyReports([data, ...monthlyReports]);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      saveMonthlyReports([
        {
          month: new Date().toLocaleDateString("ja-JP", { month: "long", year: "numeric" }),
          completedChallengesCount: completedCount,
          skillImprovements: ["ドキュメントが整ったクリーンなコードを一貫して提供できるようになった", "React Server Componentsの基礎を習得した"],
          managerNarrative: "今月は本当によく頑張りましたね！中級〜上級の課題にもコンスタントに取り組めていました。アーキテクチャの議論でも自信を持って発言できるようになっているのを感じます。来月はぜひインフラ領域にもフォーカスしてみましょう。",
          recommendations: ["『データ指向アプリケーションデザイン』を読む", "DockerとAWS ECSを使って小さなアプリをデプロイする"]
        },
        ...monthlyReports
      ]);
    }
    setIsGenerating(false);
  };

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400 font-jp">先に「スキル診断」を完了してください。</div>;
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20 font-jp">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
            <LayoutDashboard size={32} className="text-indigo-400" /> 月次レビュー
          </h1>
          <p className="text-slate-400 font-bold">AIマネージャーとの毎月の1on1パフォーマンスレポート。</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] italic"
        >
          {isGenerating && <Loader2 className="animate-spin" size={24} />}
          今月のレビューを生成する
        </button>
      </div>

      {monthlyReports.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <Target size={48} className="text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-300 mb-2">レポートがまだありません</h3>
          <p className="text-slate-500 max-w-sm">週間課題をいくつか完了し、最初の月次レビューを生成してください。</p>
        </div>
      )}

      {isGenerating && (
         <div className="glass-card flex flex-col items-center justify-center p-12 text-center animate-pulse">
           <Loader2 className="animate-spin text-indigo-500 mb-6" size={48} />
           <h3 className="text-2xl font-black text-slate-200">レビューを作成しています...</h3>
           <p className="text-slate-400 font-bold mt-2">完了したタスクと成長のベロシティを分析中。</p>
         </div>
      )}

      {monthlyReports.length > 0 && !isGenerating && (
        <div className="flex flex-col gap-8">
          {monthlyReports.map((report: MonthlyReport, i: number) => (
            <div key={i} className="glass-card flex flex-col gap-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between p-6 md:p-10 bg-indigo-500/[0.03] border-b border-white/5 rounded-t-2xl">
                <div>
                  <h3 className="text-3xl font-black text-slate-100">{report.month}</h3>
                  <div className="text-xs font-black text-indigo-400 mt-2 uppercase tracking-widest italic">Performance Intelligence / 月次総括</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-4xl font-black text-white italic">{report.completedChallengesCount}</div>
                  <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Tasks Completed</div>
                </div>
              </div>

              <div className="px-6 md:px-10 pb-10 flex flex-col gap-10">
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest italic">
                    <Users size={18} /> AIマネージャーからのフィードバック
                  </h4>
                  <div className="pl-6 border-l-4 border-indigo-500 italic text-slate-300 text-lg sm:text-xl font-bold leading-relaxed">
                    &ldquo;{report.managerNarrative}&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h4 className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest italic">
                        <Target size={18} /> 主な成長ポイント
                      </h4>
                      <ul className="flex flex-col gap-4">
                        {report.skillImprovements.map((imp, j) => (
                          <li key={j} className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-300 leading-relaxed">{imp}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="space-y-6">
                      <h4 className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest italic">
                        <Settings size={18} /> 次月への戦略的アドバイス
                      </h4>
                      <ul className="flex flex-col gap-4">
                        {report.recommendations.map((rec, j) => (
                          <li key={j} className="flex items-start gap-4 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-300 leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
