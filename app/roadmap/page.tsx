"use client";

import { useStore } from "@/lib/store";
import { Map as MapIcon, ChevronRight, Zap, Target, ArrowRight, Loader2, Sparkles, Layout } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const { profile, roadmap } = useStore();

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400 p-4 font-jp">先に「スキル診断」を完了してください。</div>;
  }

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12 px-1">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
           <MapIcon size={32} className="text-indigo-400" /> 成長ロードマップ
        </h1>
        <p className="text-slate-400 font-bold">あなたの最終目標に向けた36ヶ月の戦略。各フェーズを攻略して次へ進みましょう。</p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-indigo-500/10 to-transparent hidden md:block" />

        <div className="space-y-12 relative">
          {roadmap.length > 0 ? (
            roadmap.map((phase, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 md:gap-16 group">
                {/* Timeline Ball */}
                <div className="hidden md:flex flex-col items-center">
                   <div className="w-16 h-16 rounded-2xl bg-[#0a0a0f] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-500">
                      <span className="text-xs font-black text-indigo-400 leading-tight text-center font-jp">PHASE<br/>0{i+1}</span>
                   </div>
                   <div className="flex-1 w-px bg-white/5 my-2" />
                </div>

                <div className="flex-1 glass-card p-6 sm:p-10 flex flex-col gap-8 relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none group-hover:bg-indigo-600/10 transition-all duration-700" />
                  
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 px-3 py-1.5 rounded-full self-start tracking-widest uppercase font-jp">
                       期間: {phase.period}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-100">{phase.focus}</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                     <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest font-jp">
                           <Layout size={14} /> フェーズ詳細
                        </div>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed">{phase.details}</p>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest font-jp">
                           <Target size={14} /> 主要マイルストーン
                        </div>
                        <ul className="flex flex-col gap-4">
                          {phase.milestones.map((ms, j) => (
                            <li key={j} className="flex items-start gap-4 group/item">
                               <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 group-hover/item:scale-150 transition-transform" />
                               <span className="text-sm font-bold text-slate-300">{ms}</span>
                            </li>
                          ))}
                        </ul>
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(n => (
                             <div key={n} className="w-8 h-8 rounded-full bg-white/5 border border-[#0a0a0f] flex items-center justify-center">
                                <Zap size={12} className="text-slate-600" />
                             </div>
                           ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase italic">3 Tasks Available</span>
                     </div>
                     <Link href="/challenges" className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest font-jp">
                        課題へ進む <ArrowRight size={14} />
                     </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="p-20 text-center glass-card border-dashed">
                <Loader2 className="animate-spin text-slate-700 mx-auto mb-4" size={40} />
                <p className="text-slate-500 font-black uppercase tracking-widest font-jp">ロードマップを生成中...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
