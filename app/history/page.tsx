"use client";

import { useStore } from "@/lib/store";
import { formatRelativeTime, formatDateJapanese } from "@/lib/dateUtils";
import { History, TrendingUp, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReviewHistory() {
  const { reviewHistory } = useStore();

  const sortedHistory = [...reviewHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const stats = {
    total: reviewHistory.length,
    approved: reviewHistory.filter(h => h.result.status === 'Approved').length,
    avgScore: reviewHistory.length > 0 
      ? Math.round(reviewHistory.reduce((acc, h) => {
          const avg = (Object.values(h.result.scores) as number[]).reduce((a, b) => a + b, 0) / 5;
          return acc + avg;
        }, 0) / reviewHistory.length * 10) / 10
      : 0
  };

  if (reviewHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
        <History size={48} className="text-slate-600 mb-4" />
        <h3 className="text-2xl font-bold text-slate-300 mb-2">まだレビュー履歴がありません</h3>
        <p className="text-slate-500 max-w-sm mx-auto">課題を提出してAIのレビューを受けると、ここに成長の記録が蓄積されます。</p>
        <Link href="/challenges" className="mt-6 text-indigo-400 font-bold flex items-center gap-2 hover:text-indigo-300 transition-colors">
          最初の課題を見る <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12 px-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
            <History size={32} className="text-indigo-400" /> レビュー履歴
          </h1>
          <p className="text-slate-400 font-bold">過去のフィードバックから成長の軌跡を振り返る。</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
            <span className="text-2xl font-black text-slate-200">{stats.total}</span>
          </div>
          <div className="glass-card px-6 py-4 flex flex-col items-center border-emerald-500/20">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Approved</span>
            <span className="text-2xl font-black text-emerald-400">{stats.approved}</span>
          </div>
          <div className="glass-card px-6 py-4 flex flex-col items-center border-indigo-500/20">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg</span>
            <span className="text-2xl font-black text-indigo-400">{stats.avgScore}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedHistory.map((item, i) => (
          <div key={item.id} className="glass-card p-6 sm:p-8 hover:bg-white/[0.03] transition-all group flex flex-col lg:flex-row gap-8 items-start animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex flex-col items-center gap-2 min-w-[100px] lg:border-r border-white/5 lg:pr-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black ${item.result.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {Math.round((Object.values(item.result.scores) as number[]).reduce((a, b) => a + b, 0) / 0.5) / 10}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                <span className={`text-[10px] font-black uppercase mt-1 ${item.result.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.result.status}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {item.acceptanceCriteria}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Calendar size={12} className="text-indigo-500" />
                  <span>{formatRelativeTime(item.timestamp)}</span>
                  <span className="text-slate-700">|</span>
                  <span>{formatDateJapanese(item.timestamp)}</span>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-400 leading-relaxed italic line-clamp-2 uppercase tracking-tighter">
                "{item.result.feedback}"
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                {item.result.detectedStrengths.slice(0, 2).map((s, j) => (
                  <div key={j} className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-lg border border-emerald-400/10">
                    <TrendingUp size={12} /> {s}
                  </div>
                ))}
                {item.result.detectedWeaknesses.slice(0, 2).map((w, j) => (
                  <div key={j} className="flex items-center gap-2 text-[10px] font-black text-amber-400 bg-amber-400/5 px-3 py-1.5 rounded-lg border border-amber-400/10">
                    <AlertTriangle size={12} /> {w}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-48 flex lg:flex-col justify-end gap-2 w-full pt-4 lg:pt-0">
               <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Focus</span>
                  <span className="text-[10px] font-black text-indigo-400 line-clamp-1">{item.result.nextFocus}</span>
               </div>
               <button className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all flex items-center justify-center">
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
