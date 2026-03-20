"use client";

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  Search, 
  Filter, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ChevronRight, 
  Loader2,
  GitPullRequest,
  Globe,
  FileCode,
  Target,
  Activity
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function CodeReviewSection() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get('challengeId');
  const targetIndicesStr = searchParams.get('indices');
  const targetIndices = targetIndicesStr ? targetIndicesStr.split(',').map(Number) : [];

  const { challenges, profile, saveReviewHistory, saveChallenges } = useStore();
  const [activeTab, setActiveTab] = useState<'manual' | 'github'>('manual');
  const [code, setCode] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [isFetchingPr, setIsFetchingPr] = useState(false);
  const [prError, setPrError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  const selectedChallenge = challenges.find(c => c.id === challengeId) || challenges[0];

  const handleFetchPr = async () => {
    if (!prUrl) return;
    setIsFetchingPr(true);
    setPrError('');
    try {
      const res = await fetch('/api/github/fetch-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCode(data.code);
    } catch (err: any) {
      setPrError(err.message || 'PRの取得に失敗しました');
    } finally {
      setIsFetchingPr(false);
    }
  };

  const handleReview = async () => {
    if (!code || !profile) return;
    setIsReviewing(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          acceptanceCriteria: selectedChallenge?.acceptanceCriteria, 
          userProfile: profile,
          taskContext: selectedChallenge,
          targetCriteriaIndices: targetIndices
        }),
      });
      const data = await res.json();
      setReviewResult(data);
      
      // Save review history
      saveReviewHistory({
        id: Date.now().toString(),
        taskId: selectedChallenge?.id || 'manual',
        acceptanceCriteria: targetIndices.length > 0 
          ? targetIndices.map(i => selectedChallenge.acceptanceCriteria[i]).join(', ')
          : (selectedChallenge?.title || 'General Review'),
        result: data,
        timestamp: new Date().toISOString()
      });

      // Update actual challenge status if approved
      if (data.approved && selectedChallenge) {
        const updatedChallenges = challenges.map(c => {
          if (c.id === selectedChallenge.id) {
            const completedCriteria = { ...(c.completedCriteria || {}) };
            if (targetIndices.length > 0) {
              targetIndices.forEach(idx => { completedCriteria[idx] = true; });
            } else {
              c.acceptanceCriteria.forEach((_, idx) => { completedCriteria[idx] = true; });
            }
            
            const allDone = c.acceptanceCriteria.every((_, idx) => completedCriteria[idx]);
            return { ...c, completedCriteria, completed: allDone };
          }
          return c;
        });
        saveChallenges(updatedChallenges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing(false);
    }
  };

  const radarData = useMemo(() => {
    if (!reviewResult) return null;
    return {
      labels: ["設計", "命名", "パフォーマンス", "セキュリティ", "テスト"],
      datasets: [
        {
          label: "今回の評点",
          data: [
            reviewResult.scores.design,
            reviewResult.scores.naming,
            reviewResult.scores.performance,
            reviewResult.scores.security,
            reviewResult.scores.testing
          ],
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
        }
      ]
    };
  }, [reviewResult]);

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-10 animate-fade-in pb-12">
      {/* Target Selector Card */}
      <div className="glass-card p-5 sm:p-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-indigo-500/20">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
             <Target size={14} /> Review Target
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">{selectedChallenge?.title || "General Code Review"}</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold italic line-clamp-1">{selectedChallenge?.description}</p>
        </div>
        <div className="flex flex-col gap-3 min-w-[200px]">
           <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-right px-1">Scope</div>
           <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between group">
              <span className="text-sm font-bold text-slate-300">
                {targetIndices.length > 0 ? `${targetIndices.length}項目のPRレビュー` : "全ての課題を一括"}
              </span>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-400 transition-all" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Side: Input */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-2 italic">
                <FileCode size={14} />
                Manual Paste
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('github')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'github' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-2 italic">
                <GitPullRequest size={14} />
                GitHub PR
              </div>
            </button>
          </div>

          <div className="glass-card p-6 sm:p-8 flex flex-col gap-6">
            {activeTab === 'github' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GitHub Pull Request URL</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="https://github.com/owner/repo/pull/123"
                      value={prUrl}
                      onChange={(e) => setPrUrl(e.target.value)}
                      className="flex-1 p-4 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-bold font-inter"
                    />
                    <button 
                      onClick={handleFetchPr}
                      disabled={isFetchingPr || !prUrl}
                      className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-30"
                    >
                      {isFetchingPr ? <Loader2 className="animate-spin mx-auto" size={18} /> : "FETCH DIFF"}
                    </button>
                  </div>
                  {prError && <p className="text-xs font-bold text-red-400 ml-1">{prError}</p>}
                </div>
                {code && (
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Globe size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-300 uppercase">PR fetched successfully</h4>
                      <p className="text-[10px] font-bold text-slate-500">変更箇所をAIが分析する準備が整いました</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                     <Terminal size={14} className="text-indigo-500" /> Input Source Code
                   </label>
                   <span className="text-[10px] font-bold text-slate-600">Markdown / Diff support</span>
                 </div>
                 <textarea 
                   placeholder="レビューしてほしいコードを貼り付けてください..."
                   className="w-full h-64 sm:h-96 p-5 sm:p-6 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-xs sm:text-sm font-inter leading-relaxed text-slate-300 font-bold"
                   value={code}
                   onChange={(e) => setCode(e.target.value)}
                 />
              </div>
            )}

            <button 
              onClick={handleReview}
              disabled={isReviewing || !code}
              className="w-full py-5 sm:py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-30"
            >
              {isReviewing ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
              {isReviewing ? "AIレビュー実行中..." : "AIにレビューを依頼する"}
            </button>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="flex flex-col gap-8">
          {!reviewResult && !isReviewing && (
             <div className="glass-card p-12 sm:p-20 flex flex-col items-center justify-center text-center gap-6 border-dashed opacity-50">
                <Search size={48} className="text-slate-700" />
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-400">結果がここに表示されます</h3>
                  <p className="text-xs font-bold text-slate-600 max-w-xs mx-auto uppercase tracking-widest">コードを入力してレビューを実行してください</p>
                </div>
             </div>
          )}

          {isReviewing && (
            <div className="glass-card p-12 sm:p-20 flex flex-col items-center justify-center text-center gap-6 animate-pulse">
               <Loader2 size={48} className="text-indigo-500 animate-spin" />
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-indigo-400">エンジニア脳で解析中...</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">アーキテクチャ・命名・可読性を評価しています</p>
               </div>
            </div>
          )}

          {reviewResult && (
            <div className="flex flex-col gap-8 animate-slide-up">
              <div className={`glass-card p-6 sm:p-8 flex flex-col gap-6 sm:flex-row items-center border-[2px] ${reviewResult.approved ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
                <div className="flex flex-col items-center gap-2 sm:border-r border-white/5 sm:pr-8">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg ${reviewResult.approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {reviewResult.score}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Composite Score</span>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                     <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${reviewResult.approved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'}`}>
                       {reviewResult.approved ? 'Approved' : 'Changes Requested'}
                     </span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-slate-200 leading-relaxed italic line-clamp-3">
                    "{reviewResult.summary}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 sm:p-8 flex flex-col gap-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Activity size={14} className="text-indigo-400" /> Metric Breakdown
                  </h4>
                  <div className="w-full h-[250px] sm:h-[300px]">
                    <Radar data={radarData!} options={{
                      scales: {
                        r: {
                          angleLines: { color: "rgba(255, 255, 255, 0.1)" },
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                          pointLabels: { color: "#94a3b8", font: { weight: 'bold', size: 10 } },
                          ticks: { display: false, stepSize: 2 },
                          min: 0,
                          max: 10,
                        },
                      },
                      plugins: { legend: { display: false } },
                      maintainAspectRatio: false,
                    }} />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {Object.entries(reviewResult.categories).map(([cat, detail]) => (
                    <div key={cat} className="glass-card p-4 sm:p-5 hover:bg-white/5 transition-all group">
                       <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 group-hover:text-indigo-300">
                         {cat}
                       </h5>
                       <p className="text-[11px] sm:text-xs font-bold text-slate-400 leading-relaxed italic">
                         {detail as string}
                       </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
