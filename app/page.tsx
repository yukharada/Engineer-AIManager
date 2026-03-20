"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { isLoaded, profile, challenges, totalGainedPoints } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Optional: Auto redirect to onboarding if missing profile
  }, [profile, router]);

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const isNewUser = !profile.hasCompletedOnboarding;
  const completedCount = challenges?.filter((c: any) => c.completed).length || 0;

  if (isNewUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white mb-8 shadow-[0_0_40px_rgba(99,102,241,0.5)]">
          <Sparkles size={40} />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text text-glow">AIエンジニアリングマネージャー</span>へようこそ
        </h1>
        <p className="text-xl text-slate-400 mb-12 leading-relaxed">
          あなたに最適化された成長ロードマップ、毎週の課題、AIによる詳細なコードレビューで、エンジニアとしてのキャリアを加速させましょう。
        </p>
        <Link
          href="/onboarding"
          className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl text-lg hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          スキル診断を始める
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 ring-offset-2 ring-offset-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </Link>
      </div>
    );
  }

  // Active Dashboard
  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20">
      <header className="relative mb-8 pb-8 border-b border-white/10">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">Welcome Back,</span> 
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 text-glow">
            Engineer
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          {new Date(profile.currentSystemDate).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })} のエンジニアリングインサイト。
          目標達成に向けた現在の進捗を確認しましょう。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Target className="text-indigo-400" size={24} />
            </div>
            <h3 className="font-bold text-slate-300 tracking-wide text-sm uppercase">現在のロール</h3>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white mb-2">{profile.role || "ソフトウェアエンジニア"}</div>
            <div className="text-sm font-medium text-indigo-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              経験 {profile.experienceYears} 年
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
              <Zap className="text-yellow-400" size={24} />
            </div>
            <h3 className="font-bold text-slate-300 tracking-wide text-sm uppercase">次の目標</h3>
          </div>
          <div className="flex-grow flex items-center">
            <div className="text-xl font-bold leading-relaxed text-slate-100">{profile.goals || "シニアエンジニア・テックリードを目指す"}</div>
          </div>
        </div>
        
        <div className="glass-card p-8 flex flex-col justify-center items-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 cursor-pointer" onClick={() => router.push("/challenges")}>
           <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <ArrowRight className="text-indigo-400 w-12 h-12 mb-2 group-hover:translate-x-2 transition-transform" />
           <div className="text-lg font-bold text-white">今週の課題を見る</div>
           <p className="text-sm text-slate-400 text-center">スキルアップのためのタスクが待っています</p>
        </div>
      </div>
      
      {/* Quick Access or recent activity section can go here in the future */}
      <div className="mt-8 glass-panel p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3"><TrendingUp className="text-cyan-400" size={24}/> キャリアハイライト</h2>
        </div>
        
        {completedCount === 0 || !totalGainedPoints ? (
          <div className="text-slate-400 text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
            <p className="text-lg">課題を完了すると、ここに成長の記録がハイライトされます。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="glass-card bg-indigo-500/10 border-indigo-500/20 p-8 flex flex-col justify-center items-center text-center gap-4 hover:bg-indigo-500/20 transition-colors">
              <div className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={16} /> 獲得した総スキルポイント
              </div>
              <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-indigo-500 drop-shadow-lg">
                +{totalGainedPoints.toFixed(1)}
              </div>
              <p className="text-slate-400 mt-2">これまでの努力が確実な成長に繋がっています！</p>
            </div>
            
            <div className="glass-card bg-emerald-500/10 border-emerald-500/20 p-8 flex flex-col justify-center items-center text-center gap-4 hover:bg-emerald-500/20 transition-colors">
              <div className="text-sm font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                <Target size={16} /> 達成した課題
              </div>
              <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-teal-500 drop-shadow-lg">
                {completedCount}
              </div>
              <p className="text-slate-400 mt-2">着実に新しい技術を習得しています。</p>
            </div>
          </div>
        )}

        {(profile.strengths?.length || 0) > 0 || (profile.weaknesses?.length || 0) > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-slide-up">
            <div className="glass-card border-emerald-500/20 p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} /> AI が分析した強み
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.strengths?.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-card border-amber-500/20 p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} /> 今後の伸び代（弱点）
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.weaknesses?.map((w, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
