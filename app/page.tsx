"use client";

import { useStore } from "@/lib/store";
import { 
  TrendingUp, 
  Map as MapIcon, 
  CheckSquare, 
  Search, 
  ArrowRight, 
  Zap, 
  Target, 
  Sparkles,
  Award,
  Calendar,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import RadarChart from "@/app/components/RadarChart";
import { formatDateJapanese, getCurrentDate } from "@/lib/dateUtils";

export default function Dashboard() {
  const { profile, roadmap, challenges, computedSkills, totalGainedPoints } = useStore();

  if (!profile.hasCompletedOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-24 animate-fade-in px-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 shadow-2xl mb-8">
          <Sparkles className="text-white" size={40} />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-center mb-6 tracking-tighter italic">AIエンジニアマネージャーへようこそ</h2>
        <p className="text-slate-400 text-center mb-10 max-w-lg font-bold">
          まずはあなたのスキルを診断し、パーソナライズされた36ヶ月の成長ロードマップを作成しましょう。
        </p>
        <Link href="/onboarding" className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-xl hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-white/10 uppercase italic flex items-center gap-3">
          診断を開始する <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => !c.completed);
  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter italic">DASHBOARD</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Growth Intelligence System v1.0</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
             <Calendar className="text-indigo-400" size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Date</span>
             <span className="text-sm font-black text-slate-200">{formatDateJapanese(getCurrentDate())}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Analytics & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Skill Radar */}
          <div className="glass-card p-6 sm:p-10 flex flex-col gap-8 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-700" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                   <TrendingUp size={14} /> Intelligence Profile
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">スキルマトリクス</h2>
                <p className="text-sm text-slate-500 font-bold italic line-clamp-1">現在のスキル偏差値と成長ポテンシャル</p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Growth</span>
                    <span className="text-xl font-black text-emerald-400">+{totalGainedPoints}pt</span>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Completed</span>
                    <span className="text-xl font-black text-indigo-400">{completedCount}</span>
                 </div>
              </div>
            </div>

            <div className="w-full max-w-[300px] sm:max-w-[400px] mx-auto h-[250px] sm:h-[350px]">
              <RadarChart data={computedSkills} />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-white/5">
               {Object.entries(computedSkills).slice(0, 4).map(([cat, score]) => (
                 <div key={cat} className="space-y-2">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${score * 10}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{score}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Goals & Focus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="glass-card p-6 sm:p-8 space-y-4 hover:border-indigo-500/30 transition-all border-indigo-500/10">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <Target className="text-indigo-400" size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">現在のフォーカス</h3>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">{profile.goals}</p>
             </div>
             <div className="glass-card p-6 sm:p-8 space-y-4 hover:border-emerald-500/30 transition-all border-emerald-500/10">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Award className="text-emerald-400" size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">AIマネージャーの期待</h3>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">{profile.evaluation?.recommendedFocus || "ロードマップに沿った継続的な学習を期待しています。"}</p>
             </div>
          </div>
        </div>

        {/* Right Column: Mini Challenges & Roadmap */}
        <div className="flex flex-col gap-8">
          {/* Active Challenges Card */}
          <div className="glass-card flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <CheckSquare size={16} className="text-indigo-400" /> Active Tasks
               </h3>
               <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">{activeChallenges.length}</span>
            </div>
            <div className="p-2">
              {activeChallenges.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {activeChallenges.slice(0, 3).map((c) => (
                    <Link key={c.id} href="/challenges" className="p-4 hover:bg-white/5 rounded-xl transition-all group flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                         <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-1">{c.title}</span>
                         <span className="text-[10px] font-black text-slate-600 uppercase">{c.difficulty}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-400 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-2">
                   <p className="text-xs font-black text-slate-600 uppercase">No active tasks</p>
                </div>
              )}
            </div>
            <Link href="/challenges" className="p-4 bg-indigo-600/10 text-indigo-400 text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all border-t border-indigo-500/10">
               課題をもっと見る
            </Link>
          </div>

          {/* Roadmap Snapshot */}
          <div className="glass-card flex flex-col overflow-hidden group">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <MapIcon size={16} className="text-indigo-400" /> Roadmap Milestone
                </h3>
             </div>
             <div className="p-6 space-y-6">
                {roadmap.length > 0 ? (
                  <>
                    <div className="space-y-4">
                       <span className="text-[10px] font-black text-indigo-400 border border-indigo-400/20 px-2 py-1 rounded bg-indigo-400/5 uppercase">{roadmap[0].period}</span>
                       <h4 className="text-lg font-black text-slate-200 line-clamp-2">{roadmap[0].focus}</h4>
                    </div>
                    <ul className="space-y-3">
                       {roadmap[0].milestones.slice(0, 3).map((ms, j) => (
                         <li key={j} className="text-xs font-bold text-slate-500 flex items-center gap-3">
                            <Zap size={12} className="text-indigo-500" /> {ms}
                         </li>
                       ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-xs font-black text-slate-600 text-center py-4">No roadmap generated</p>
                )}
             </div>
             <Link href="/roadmap" className="p-4 bg-indigo-600 text-white text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg shadow-indigo-600/20">
                FULL ROADMAP <ArrowRight size={14} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
