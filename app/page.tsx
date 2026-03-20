"use client";

import { useStore } from "@/lib/store";
import { 
  BarChart3, 
  Target, 
  Trophy, 
  ArrowUpRight, 
  Zap, 
  ChevronRight,
  PlusCircle,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import RadarChart from "./components/RadarChart";

const getRoleIcon = (role: string) => {
  if (role.includes("Frontend")) return "⚛️";
  if (role.includes("Backend")) return "⚙️";
  if (role.includes("Mobile")) return "📱";
  if (role.includes("Infra")) return "☁️";
  return "🚀";
};

export default function Home() {
  const { profile, challenges } = useStore();

  if (!profile.hasCompletedOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fade-in px-4">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
          <LayoutDashboard size={40} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">エンジニア成長支援システム</h1>
          <p className="text-slate-400 max-w-sm mx-auto">あなたのスキルをAIが診断し、最適な成長ロードマップを提案します。</p>
        </div>
        <Link 
          href="/onboarding"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-indigo-500/30"
        >
          スキル診断を始める <ChevronRight size={20} />
        </Link>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => !c.completed);
  const completedChallenges = challenges.filter(c => c.completed);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in">
      {/* Header Info */}
      <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-4xl sm:text-6xl">{getRoleIcon(profile.role)}</div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{profile.role}</h1>
              <span className="hidden sm:inline px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-black uppercase tracking-widest">
                Level {Math.floor((profile.skills.frontend + profile.skills.backend + profile.skills.infrastructure) / 3)}
              </span>
            </div>
            <p className="text-slate-400 font-bold flex items-center gap-2 text-sm sm:text-base">
              <Target size={18} className="text-indigo-500" /> 目標: {profile.goals}
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none glass-card px-4 sm:px-6 py-3 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">EXP Points</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-400">1,240</span>
          </div>
          <div className="flex-1 md:flex-none glass-card px-4 sm:px-6 py-3 flex flex-col items-center border-emerald-500/20">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Rank</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">#42</span>
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Radar and Skills */}
        <div className="space-y-8">
          <div className="glass-card p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-3">
                <BarChart3 className="text-indigo-500" /> 現在のスキルグラフ
              </h3>
              <Link href="/analytics" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <ArrowUpRight size={20} />
              </Link>
            </div>
            <div className="w-full max-w-[300px] sm:max-w-[400px] mx-auto h-[250px] sm:h-[350px]">
              <RadarChart data={profile.skills} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-6 border-indigo-500/10">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">主要な強み</h4>
              <div className="flex flex-col gap-3">
                {profile.evaluation?.strengths.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                    <Trophy size={16} className="text-yellow-500" /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 border-red-500/10">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">強化すべき点</h4>
              <div className="flex flex-col gap-3">
                {profile.evaluation?.areasForImprovement.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                    <Zap size={16} className="text-red-400" /> {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Challenges */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3">
              <Zap className="text-yellow-500" /> 進行中の課題
            </h3>
            <span className="text-sm font-bold text-slate-500">{activeChallenges.length}件</span>
          </div>

          {activeChallenges.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed">
              <PlusCircle size={40} className="text-slate-600" />
              <p className="text-slate-400 font-bold">新しい課題を受け取りましょう</p>
              <Link href="/challenges" className="text-indigo-400 text-sm font-bold hover:underline">課題一覧へ</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeChallenges.map((c) => (
                <Link key={c.id} href="/challenges" className="glass-card p-5 group hover:border-indigo-500/30 transition-all flex items-center gap-5">
                  <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:bg-indigo-600/10 transition-colors`}>
                    {c.difficulty === "Advanced" ? "🔥" : c.difficulty === "Intermediate" ? "⚔️" : "🌱"}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-slate-100 group-hover:text-indigo-400 transition-colors text-sm sm:text-base">{c.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold line-clamp-1 mt-0.5">{c.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-700 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          )}

          {/* Activity Mini Log */}
          <div className="mt-4">
             <h3 className="text-lg font-black mb-4 flex items-center gap-3 px-2">最近の成果</h3>
             <div className="glass-card overflow-hidden">
                {completedChallenges.slice(0, 3).map((c, i) => (
                  <div key={c.id} className={`p-4 flex items-center gap-4 ${i !== 0 ? 'border-t border-white/5' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Trophy size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs sm:text-sm font-bold text-slate-300">{c.title}を達成</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completed</span>
                  </div>
                ))}
                {completedChallenges.length === 0 && <p className="p-8 text-center text-slate-600 text-sm italic">まだ完了した課題はありません</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
