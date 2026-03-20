"use client";

import { useStore } from "@/lib/store";
import { 
  Calendar, 
  Map, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  TrendingUp,
  Zap,
  Target
} from "lucide-react";

export default function Roadmap() {
  const { roadmap, profile } = useStore();

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400 p-4">先に「スキル診断」を完了してください。</div>;
  }

  if (roadmap.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
        <Map size={48} className="text-slate-600 mb-4" />
        <h3 className="text-2xl font-bold text-slate-300 mb-2">まだロードマップがありません</h3>
        <p className="text-slate-500 max-w-sm mx-auto">AIマネージャーがあなたの診断結果に基づいて、最適なロードマップを作成します。</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
            <Calendar size={32} className="text-indigo-400" /> 成長ロードマップ
          </h1>
          <p className="text-slate-400 font-bold flex items-center gap-2 text-sm sm:text-base">
             <TrendingUp size={18} className="text-indigo-500" /> {profile.role} への最短ルート
          </p>
        </div>
      </div>

      <div className="relative border-l-2 border-indigo-500/20 ml-2 sm:ml-6 pl-6 sm:pl-10 space-y-12">
        {roadmap.map((phase, i) => (
          <div key={i} className="relative group">
            {/* Dot */}
            <div className="absolute -left-[31px] sm: -left-[49px] top-0 w-6 h-6 rounded-full bg-[#0a0a0f] border-4 border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-10 transition-transform group-hover:scale-125" />
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 font-black text-indigo-400 uppercase tracking-widest text-xs">
                <span className="bg-indigo-600/10 px-3 py-1 rounded-full border border-indigo-500/20">{phase.period}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-200">{phase.focus}</span>
              </div>
              
              <div className="glass-card p-6 sm:p-8 hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white mb-4 flex items-center gap-2">
                         <Target size={20} className="text-indigo-500" /> マイルストーン
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {phase.milestones.map((ms, j) => (
                          <div key={j} className="flex items-center gap-3 text-sm font-bold bg-black/40 p-4 rounded-xl border border-white/5 group/ms">
                            <CheckCircle2 size={18} className="text-indigo-500 shrink-0" />
                            <span className="text-slate-200 group-hover/ms:text-indigo-400 transition-colors">{ms}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-80 shrink-0">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 transition-all group-hover:bg-white/[0.07]">
                       <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Zap size={14} className="text-yellow-500" /> 詳細アドバイス
                       </h4>
                       <p className="text-sm text-slate-400 leading-relaxed font-bold">
                         {phase.details}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-bold transition-all text-sm group">
          ロードマップを更新する <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
