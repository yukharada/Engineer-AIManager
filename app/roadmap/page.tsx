"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { RoadmapPhase } from "@/lib/types";
import { Calendar, Loader2, PlayCircle, PlusCircle, Clock } from "lucide-react";

export default function Roadmap() {
  const { profile, roadmap, saveRoadmap } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [months, setMonths] = useState<number>(36);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_roadmap", payload: { profile, months } }),
      });
      const data = await res.json();
      if (Array.isArray(data)) saveRoadmap(data);
    } catch (e) {
      console.error(e);
      // Fallback
      saveRoadmap([
        { period: "1〜3ヶ月目", focus: "フロントエンド基礎の強化", milestones: ["React hooksをマスターする", "状態管理パターンを学ぶ", "複雑なUIコンポーネントを2つ構築する"], details: "Reactの公式ドキュメントを読み込み、カスタムフックの作成に挑戦してください。" },
        { period: "4〜6ヶ月目", focus: "アーキテクチャとパフォーマンス", milestones: ["コード分割の実装", "Lighthouseスコア90以上", "Next.js App Routerの深耕"], details: "Next.jsのレンダリング手法（SSR/SSG/ISR）の違いを理解し、適切な場面で使い分けられるようにしてください。" }
      ]);
    }
    setIsGenerating(false);
  };

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400">先に「スキル診断」を完了してください。</div>;
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><Calendar size={32} className="text-indigo-400" /> AI成長ロードマップ</h1>
          <p className="text-slate-400">あなた専用のスキルアップ計画ラインナップです。</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
            <Clock size={16} className="text-slate-400" />
            <select 
              value={months} 
              onChange={(e) => setMonths(Number(e.target.value))}
              disabled={isGenerating}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value={1}>1ヶ月</option>
              <option value={3}>3ヶ月</option>
              <option value={6}>6ヶ月</option>
              <option value={12}>1年（12ヶ月）</option>
              <option value={24}>2年（24ヶ月）</option>
              <option value={36}>3年（36ヶ月）</option>
            </select>
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shrink-0"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <PlayCircle size={20} />}
            {roadmap.length > 0 ? "再生成する" : "ロードマップ生成"}
          </button>
        </div>
      </div>

      {roadmap.length === 0 && !isGenerating ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-300 mb-2">まだロードマップがありません</h3>
          <p className="text-slate-500 max-w-md">「生成」ボタンをクリックして、AIマネージャーに期間分の成長計画を作成してもらいましょう。</p>
        </div>
      ) : null}

      {roadmap.length > 0 && !isGenerating && (
        <div className="relative border-l-2 border-indigo-500/30 ml-4 md:ml-8 pl-8 md:pl-12 flex flex-col gap-12 mt-4">
          {roadmap.map((phase: RoadmapPhase, i: number) => (
            <div key={i} className="relative glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="absolute w-6 h-6 bg-indigo-500 rounded-full -left-[45px] top-8 md:-left-[61px] border-4 border-[#0a0a0f] shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
              <div className="text-sm font-bold text-indigo-400 tracking-wider uppercase mb-2">{phase.period}</div>
              <h3 className="text-2xl font-bold mb-4 text-slate-100">{phase.focus}</h3>
              
              {phase.details && (
                <div className="mb-6 bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-slate-300 leading-relaxed text-sm">{phase.details}</p>
                </div>
              )}

              <ul className="flex flex-col gap-3">
                {phase.milestones.map((m, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <PlusCircle size={20} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 leading-relaxed font-medium">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
