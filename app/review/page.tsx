"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Code, Loader2, CheckSquare, Sparkles } from "lucide-react";
import CodeReviewSection from "@/app/components/CodeReviewSection";

function ReviewContent() {
  const { challenges } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchChallengeId = searchParams.get("challengeId");

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(searchChallengeId || "none");

  useEffect(() => {
    if (searchChallengeId) {
      setSelectedChallengeId(searchChallengeId);
    }
  }, [searchChallengeId]);

  const handleChallengeChange = (id: string) => {
    setSelectedChallengeId(id);
    const params = new URLSearchParams(searchParams);
    if (id !== "none") {
      params.set("challengeId", id);
    } else {
      params.delete("challengeId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeChallenges = challenges.filter(c => !c.completed);

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20 px-1">
      <div className="flex flex-col border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
          <Code size={32} className="text-indigo-400" /> AIコードレビュー
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Gemini 2.0 Flash</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-bold">シニアエンジニアによる高精度レビューと対話型の問いかけ。</p>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div className="glass-card p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
              <CheckSquare size={14} /> Review Scope
            </label>
            <select 
              value={selectedChallengeId}
              onChange={(e) => handleChallengeChange(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-200 font-bold text-sm sm:text-base cursor-pointer appearance-none"
            >
              <option value="none">-- 課題を選択してください --</option>
              {activeChallenges.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
              {selectedChallengeId !== "none" && !activeChallenges.find(c => c.id === selectedChallengeId) && (
                 <option value={selectedChallengeId}>選択中の課題</option>
              )}
            </select>
          </div>
        </div>

        {selectedChallengeId !== "none" ? (
          <CodeReviewSection />
        ) : (
          <div className="glass-card p-12 sm:p-20 flex flex-col items-center justify-center text-center border-dashed gap-6 opacity-60">
            <Sparkles size={48} className="text-slate-700" />
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-400">課題を選択してください</h3>
              <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto uppercase tracking-widest">AIのレビューを受けるには、まず対象となる課題を選択してください。</p>
            </div>
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
