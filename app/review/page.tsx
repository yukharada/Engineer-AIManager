"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Code, Loader2, CheckSquare, Sparkles } from "lucide-react";
import CodeReviewSection from "@/app/components/CodeReviewSection";

function ReviewContent() {
  const { challenges } = useStore();
  const searchParams = useSearchParams();
  const searchChallengeId = searchParams.get("challengeId");

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(searchChallengeId || "none");

  useEffect(() => {
    if (searchChallengeId) {
      setSelectedChallengeId(searchChallengeId);
    }
  }, [searchChallengeId]);

  const activeChallenges = challenges.filter(c => !c.completed);

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex flex-col border-b border-white/10 pb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Code size={32} className="text-indigo-400" /> AIコードレビュー
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Gemini 2.0 Flash</span>
        </h1>
        <p className="text-slate-400">提出したコードに対し、シニアスタッフエンジニアが高精度なレビューと対話型の問いかけを行います。</p>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div className="glass-card p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <CheckSquare size={16} /> 紐づける課題
            </label>
            <select 
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors text-slate-200"
            >
              <option value="none">-- 課題を選択してください --</option>
              {activeChallenges.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedChallengeId !== "none" ? (
          <CodeReviewSection currentTask={challenges.find(c => c.id === selectedChallengeId)!} />
        ) : (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center border-dashed gap-4">
            <Sparkles size={48} className="text-slate-600 mb-2" />
            <h3 className="text-xl font-bold text-slate-300">課題を選択してください</h3>
            <p className="text-slate-500 max-w-sm">Geminiによる高度なレビューを受けるには、まず対象となる課題を選択してください。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
