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
  ChevronRight,
  Settings
} from "lucide-react";
import Link from "next/link";
import RadarChart from "@/app/components/RadarChart";
import { formatDateJapanese, getCurrentDate } from "@/lib/dateUtils";
import { getStageLabel } from "@/lib/levelMapping";

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  infrastructure: 'インフラ',
  systemDesign: 'システム設計',
  database: 'データベース',
  security: 'セキュリティ',
  devProcess: '開発プロセス'
};

export default function Dashboard() {
  const { profile, roadmap, challenges, computedSkills, totalGainedXp } = useStore();

  if (!profile.hasCompletedOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-24 animate-fade-in px-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 shadow-2xl mb-8">
          <Sparkles className="text-white" size={40} />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-center mb-6 tracking-tighter italic font-jp">AIエンジニアマネージャーへようこそ</h2>
        <p className="text-slate-400 text-center mb-10 max-w-lg font-bold font-jp">
          まずはあなたのスキルを診断し、パーソナライズされた36ヶ月の成長ロードマップを作成しましょう。
        </p>
        <Link href="/onboarding" className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-xl hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-white/10 uppercase italic flex items-center gap-3 font-jp">
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
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter italic">DASHBOARD / ダッシュボード</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">成長インテリジェンス・システム v1.2 (RPG Edition)</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
             <Calendar className="text-indigo-400" size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">現在のシステム日付</span>
             <span className="text-sm font-black text-slate-200">{formatDateJapanese(getCurrentDate())}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Analytics & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main XP Skills Display */}
          <div className="glass-card p-6 sm:p-10 flex flex-col gap-10 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-700" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                   <TrendingUp size={14} /> スキル推移エクスプローラー
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">現在のスキルレベル & 経験値</h2>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center flex-1 sm:min-w-[120px]">
                    <span className="text-[10px] font-black text-slate-500 uppercase italic">Total Gained XP</span>
                    <span className="text-2xl font-black text-emerald-400">+{totalGainedXp}</span>
                 </div>
              </div>
            </div>

            <Link
              href="/settings"
              className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 font-jp"
            >
              <Settings size={14} /> プロフィールを編集
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
               {Object.entries(computedSkills).map(([cat, progress]) => (
                 <div key={cat} className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{CATEGORY_LABELS[cat] || cat}</span>
                       <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                             <div className="text-2xl font-black text-white italic leading-none">Lv.{progress.level}</div>
                             <span className={`text-[8px] font-black ${getStageLabel(progress.level).color} uppercase tracking-tighter`}>
                                {getStageLabel(progress.level).label}
                             </span>
                          </div>
                          <div className="text-[10px] font-black text-slate-600 mt-1 uppercase italic">{progress.xp} / {progress.xpToNext} XP</div>
                       </div>
                    </div>
                    <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 group/bar">
                       <div 
                         className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 group-hover/bar:from-indigo-500 group-hover/bar:to-purple-400 transition-all duration-1000"
                         style={{ width: `${(progress.xp / progress.xpToNext) * 100}%` }}
                       />
                       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
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
                <h3 className="text-lg font-black uppercase tracking-tight">現在のフォーカス目標</h3>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">{profile.goals}</p>
             </div>
             <div className="glass-card p-6 sm:p-8 space-y-4 hover:border-emerald-500/30 transition-all border-emerald-500/10">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Award className="text-emerald-400" size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">AIマネージャーの推薦</h3>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">{profile.evaluation?.recommendedFocus || "ロードマップに沿った継続的な学習を推奨します。"}</p>
             </div>
          </div>
        </div>

        {/* Right Column: Mini Challenges & Roadmap */}
        <div className="flex flex-col gap-8">
          {/* Active Challenges Card */}
          <div className="glass-card flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <CheckSquare size={16} className="text-indigo-400" /> 進行中の課題
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
                         <span className="text-[10px] font-black text-slate-600 uppercase">難易度: {c.difficulty === 'Beginner' ? '初級' : c.difficulty === 'Intermediate' ? '中級' : '上級'}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-400 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-2">
                   <p className="text-xs font-black text-slate-600 uppercase">課題はありません</p>
                </div>
              )}
            </div>
            <Link href="/challenges" className="p-4 bg-indigo-600/10 text-indigo-400 text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all border-t border-indigo-500/10">
               課題一覧を見る
            </Link>
          </div>

          {/* Roadmap Snapshot */}
          <div className="glass-card flex flex-col overflow-hidden group">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <MapIcon size={16} className="text-indigo-400" /> 直近のマイルストーン
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
                  <p className="text-xs font-black text-slate-600 text-center py-4">ロードマップがありません</p>
                )}
             </div>
             <Link href="/roadmap" className="p-4 bg-indigo-600 text-white text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg shadow-indigo-600/20 font-jp">
                全ロードマップを表示 <ArrowRight size={14} />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
