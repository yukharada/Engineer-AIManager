"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { CheckSquare, Loader2, Zap, Circle, CheckCircle2, GitPullRequest, ArrowRight, TrendingUp } from "lucide-react";

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = { frontend: "フロントエンド", backend: "バックエンド", infrastructure: "インフラ", systemDesign: "システム設計", database: "DB", security: "セキュリティ", devProcess: "開発プロセス" };
  return map[cat] || cat;
};

export default function Challenges() {
  const { profile, challenges, saveChallenges, reviewHistory } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "generate_challenges", 
          payload: { profile, reviewHistory } 
        }),
      });
      const data = await res.json();
      if (Array.isArray(data)) saveChallenges(data);
    } catch (e) {
      console.error(e);
      // Fallback
      saveChallenges([
        { id: "1", title: "カスタムフックの構築", description: "useDebounceフックを作成し、検索入力に統合してください。", acceptanceCriteria: ["フックがデバウンスされた値を返す", "遅延時間が設定可能", "一般的なテキスト入力で使用されている"], difficulty: "Beginner", completed: false },
        { id: "2", title: "コンテキスト再レンダリングの最適化", description: "大きなReact Contextプロバイダーが不要な子コンポーネントの再レンダリングを引き起こしている問題を修正してください。", acceptanceCriteria: ["メモ化（useMemo/memo）を使用する", "状態とディスパッチのコンテキストを分割する"], difficulty: "Intermediate", completed: false },
        { id: "3", title: "レートリミッター・システムの設計", description: "分散レートリミッターの高レベルアーキテクチャドキュメントを作成してください。", acceptanceCriteria: ["Redis等を使用する", "100万リクエスト/秒を処理できる", "トークンバケットアルゴリズムについて記述されている"], difficulty: "Advanced", completed: false }
      ]);
    }
    setIsGenerating(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Intermediate": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Advanced": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400">先に「スキル診断」を完了してください。</div>;
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><CheckSquare size={32} className="text-indigo-400" /> 課題</h1>
          <p className="text-slate-400">あなたの弱点とロードマップに基づいた実践的な課題です。</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="bg-white text-black hover:bg-slate-200 disabled:opacity-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
          {challenges.length > 0 ? "今週の課題を再生成" : "課題を取得する"}
        </button>
      </div>

      {challenges.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <CheckSquare size={48} className="text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-300 mb-2">アクティブな課題はありません</h3>
          <p className="text-slate-500 max-w-md">「課題を取得する」をクリックして、AIマネージャーからコーディング課題を受け取りましょう。</p>
        </div>
      )}

      {challenges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c, i) => (
            <div key={c.id} className={`glass-card p-6 flex flex-col gap-4 transition-all duration-300 ${c.completed ? "opacity-60 grayscale" : "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(99,102,241,0.2)]"}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getDifficultyColor(c.difficulty)}`}>
                  {c.difficulty}
                </span>
                <div className="text-slate-400">
                  {c.completed ? <CheckCircle2 size={28} className="text-indigo-400" /> : <div className="w-7 h-7 border-2 border-slate-700 rounded-full" />}
                </div>
              </div>
              <h3 className={`text-xl font-bold mt-2 ${c.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{c.title}</h3>
              
              {c.gainedSkills && c.gainedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1 mb-1">
                  {c.gainedSkills.map((gs, k) => (
                    <span key={k} className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <TrendingUp size={12} />
                      {getCategoryLabel(gs.category)} +{gs.points}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-slate-400 text-sm flex-grow leading-relaxed">{c.description}</p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center justify-between">
                    <span>受け入れ条件 (PRの分割粒度)</span>
                    <span className="text-[10px] text-indigo-400/70 border border-indigo-400/20 px-1.5 py-0.5 rounded italic">AIレビュー連動</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {c.acceptanceCriteria.map((ac, j) => {
                      const isAcComplete = c.completedCriteria?.[j] || c.completed;
                      return (
                        <li key={j} className="text-sm flex items-start gap-3">
                          <div className={`mt-0.5 shrink-0 ${isAcComplete ? 'text-indigo-400' : 'text-slate-700'}`}>
                            {isAcComplete ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 border border-slate-700 rounded-full" />}
                          </div>
                          <span className={isAcComplete ? 'text-slate-500 line-through' : 'text-slate-300'}>{ac}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {!c.completed && (
                  <Link 
                    href={`/review?challengeId=${c.id}`}
                    className="mt-2 w-full py-2.5 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors group"
                  >
                    <GitPullRequest size={16} />
                    この課題のPRをレビュー依頼する
                    <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
