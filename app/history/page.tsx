"use client";

import { useStore } from "@/lib/store";
import { 
  TrendingUp, 
  Map as MapIcon, 
  Calendar, 
  AlertTriangle, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, formatDateJapanese } from "@/lib/dateUtils";

export default function HistoryPage() {
  const { reviewHistory } = useStore();

  if (reviewHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
        <TrendingUp size={48} className="text-slate-600 mb-4" />
        <h3 className="text-2xl font-bold text-slate-300 mb-2">まだレビュー履歴がありません</h3>
        <p className="text-slate-500 max-w-sm">課題を完了してAIマネージャーにレビューを依頼しましょう。</p>
        <Link href="/challenges" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 font-jp">
          課題一覧へ <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12 px-1">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
          <TrendingUp size={32} className="text-indigo-400" /> レビュー履歴
        </h1>
        <p className="text-slate-400 font-bold">これまでの挑戦とフィードバックの全記録。</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviewHistory.map((item, i) => (
          <div key={item.id || i} className="glass-card p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center hover:border-indigo-500/30 transition-all group">
            <div className="flex flex-col items-center justify-center min-w-[100px] gap-2">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black ${item.result.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {Math.round((Object.values(item.result.scores) as number[]).reduce((a, b) => a + b, 0) / 0.5) / 10}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${item.result.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {item.result.status === 'Approved' ? '合格' : '修正依頼'}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors uppercase">{item.acceptanceCriteria}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Calendar size={12} /> {formatDateJapanese(item.timestamp)}
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                </div>
                <Link 
                  href={`/review?id=${item.id}`}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-xs transition-all flex items-center gap-2 italic uppercase tracking-widest border border-white/5"
                >
                  詳細を見る <ArrowRight size={14} />
                </Link>
              </div>

              <p className="text-slate-400 text-sm font-bold leading-relaxed line-clamp-2 italic">
                &ldquo;{item.result.feedback}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
