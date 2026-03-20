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
    return <div className="text-center mt-20 text-slate-400">先に「スキル診断」を完了してください。</div>;
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><LayoutDashboard size={32} className="text-indigo-400" /> 月次レビュー</h1>
          <p className="text-slate-400">AIマネージャーとの毎月の1on1パフォーマンスレポートです。</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          {isGenerating && <Loader2 className="animate-spin" size={20} />}
          今月のレビューを生成する
        </button>
      </div>

      {monthlyReports.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <Target size={48} className="text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-300 mb-2">レポートがありません</h3>
          <p className="text-slate-500 max-w-md">週次の課題をいくつか完了し、最初の月次レビューを生成してください。</p>
        </div>
      )}

      {isGenerating && (
         <div className="glass-card flex flex-col items-center justify-center p-12 text-center animate-pulse-slow">
           <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
           <h3 className="text-xl font-bold text-slate-200">レビューを作成しています...</h3>
           <p className="text-slate-400">完了したタスクと成長のベロシティを確認しています。</p>
         </div>
      )}

      {monthlyReports.length > 0 && !isGenerating && (
        <div className="flex flex-col gap-8">
          {monthlyReports.map((report: MonthlyReport, i: number) => (
            <div key={i} className="glass-card flex flex-col gap-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between p-6 md:p-8 bg-indigo-500/10 border-b border-white/5 rounded-t-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100">{report.month}</h3>
                  <div className="text-sm font-medium text-indigo-400 mt-1">パフォーマンスレビュー</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-bold text-white">{report.completedChallengesCount}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">完了タスク</div>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-8 flex flex-col gap-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3 text-slate-300"><Users size={18} className="text-cyan-400"/> マネージャーからのコメント</h4>
                  <div className="pl-4 border-l-2 border-indigo-500/50 italic text-slate-300 text-lg leading-relaxed">
                    "{report.managerNarrative}"
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-slate-300"><Target size={18} className="text-green-400"/> 主な成長点</h4>
                    <ul className="flex flex-col gap-3">
                      {report.skillImprovements.map((imp, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0"></div>
                          <span className="text-slate-400">{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-slate-300"><Settings size={18} className="text-orange-400"/> 来月に向けた提案</h4>
                    <ul className="flex flex-col gap-3">
                      {report.recommendations.map((rec, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></div>
                          <span className="text-slate-400">{rec}</span>
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
