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
  Legend,
  ChartData
} from 'chart.js';
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  MessageSquare,
  TrendingUp,
  Award,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  FileCode,
  Github,
  Loader2,
  Search
} from 'lucide-react';
import Link from 'next/link';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface CodeReviewSectionProps {
  challengeId?: string;
}

export default function CodeReviewSection({ challengeId }: CodeReviewSectionProps) {
  const { profile, challenges, saveReviewHistory, completeCriteria, apiStatus, setApiStatus } = useStore();
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<number[]>([]);

  const challenge = useMemo(() => 
    challenges.find(c => c.id === challengeId), 
    [challenges, challengeId]
  );

  const toggleCriteria = (index: number) => {
    setSelectedCriteria(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleFetchPr = async () => {
    if (!githubUrl) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetch("/api/github/fetch-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl }),
      });
      const data = await res.json();
      if (data.code) {
        setCode(data.code);
      } else if (data.error) {
        alert("GitHubエラー: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("PRの取得に失敗しました。URLを確認してください。");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleReview = async () => {
    if (!code) return;
    setIsReviewing(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "review_code", 
          payload: { 
            code, 
            challengeContext: challenge,
            targetCriteriaIndices: selectedCriteria.length > 0 ? selectedCriteria : undefined
          } 
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 429 && result.isQuotaExceeded) {
          setApiStatus(true, result.retryAfter);
        }
        throw new Error(result.error || "レビューの取得に失敗しました。");
      }

      // デモモードフラグのチェック
      if (result.isDemo) {
        setApiStatus(result.isQuotaExceeded || false, result.retryAfter || null, true);
      }

      setReviewResult(result);
      
      const reviewItem = {
        id: crypto.randomUUID(),
        taskId: challengeId || 'manual',
        acceptanceCriteria: challenge?.title || '手動レビュー',
        result,
        timestamp: new Date().toISOString()
      };
      
      await saveReviewHistory(reviewItem);

      if (result.status === 'Approved' && challengeId && selectedCriteria.length > 0) {
        await completeCriteria(challengeId, selectedCriteria);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    }
    setIsReviewing(false);
  };

  const chartData: ChartData<'radar'> | null = reviewResult ? {
    labels: ['設計', '命名', 'エラー処理', 'テスト', 'パフォーマンス'],
    datasets: [
      {
        label: '今回のスコア',
        data: [
          reviewResult.scores.design,
          reviewResult.scores.naming,
          reviewResult.scores.errorHandling,
          reviewResult.scores.testing,
          reviewResult.scores.performance
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  } : null;

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10, weight: 'bold' as const } },
        ticks: { display: false, stepSize: 2 },
        suggestedMin: 0,
        suggestedMax: 10
      }
    },
    plugins: { legend: { display: false } }
  };

  if (reviewResult) {
    return (
      <div className="space-y-8 animate-fade-in font-jp">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Result Card */}
          <div className="flex-1 glass-card p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${reviewResult.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {reviewResult.status === 'Approved' ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                   {reviewResult.status === 'Approved' ? '合格 / Approved' : '修正が必要 / Changes Requested'}
                </div>
                <h2 className="text-3xl font-black">査読結果サマリー</h2>
              </div>
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-col items-center min-w-[120px]">
                 <span className="text-[10px] font-black text-slate-500 uppercase italic">総合スコア</span>
                 <span className="text-4xl font-black text-indigo-400">
                    {Math.round((Object.values(reviewResult.scores) as number[]).reduce((a, b) => a + b, 0) / 0.5) / 10}
                 </span>
              </div>
            </div>

            <p className="text-lg text-slate-300 font-bold leading-relaxed border-l-4 border-indigo-500 pl-6 italic">
              &ldquo;{reviewResult.feedback}&rdquo;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5">
               <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest">
                    <Award size={16} /> 強み・評価点
                  </h4>
                  <ul className="space-y-3">
                    {reviewResult.detectedStrengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm font-bold text-slate-400 flex items-start gap-3">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" /> {s}
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
                    <ShieldAlert size={16} /> 改善点・弱点
                  </h4>
                  <ul className="space-y-3">
                    {reviewResult.detectedWeaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-sm font-bold text-slate-400 flex items-start gap-3">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-1" /> {w}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>

          {/* Radar Chart Card */}
          <div className="w-full md:w-[320px] glass-card p-8 flex flex-col items-center justify-center gap-6">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">評価詳細メトリクス</h3>
             <div className="w-full aspect-square">
                {chartData && <Radar data={chartData} options={chartOptions} />}
             </div>
             <div className="grid grid-cols-2 gap-4 w-full">
                {Object.entries(reviewResult.scores).map(([key, val]: any) => (
                  <div key={key} className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-black text-slate-600 uppercase">{
                        key === 'design' ? '設計' : key === 'naming' ? '命名' : key === 'errorHandling' ? 'エラー' : key === 'testing' ? 'テスト' : '性能'
                     }</span>
                     <span className="text-lg font-black text-slate-300">{val}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Deep Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-card p-8 space-y-6">
              <h3 className="flex items-center gap-2 text-sm font-black text-indigo-400 uppercase tracking-widest">
                <HelpCircle size={18} /> 思考を深めるための質問
              </h3>
              <div className="space-y-4">
                {reviewResult.questions.map((q: string, i: number) => (
                  <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex gap-4 group hover:border-indigo-500/30 transition-all">
                    <span className="text-2xl font-black text-indigo-500/30 group-hover:text-indigo-500 transition-colors">0{i+1}</span>
                    <p className="text-sm font-bold text-slate-200 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="glass-card p-8 space-y-6 border-emerald-500/20">
              <h3 className="flex items-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-widest">
                <Lightbulb size={18} /> 次へのステップ案
              </h3>
              <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-4">
                 <p className="text-sm font-bold text-slate-300 leading-relaxed">{reviewResult.nextFocus}</p>
                 <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => setReviewResult(null)}
                      className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all italic"
                    >
                      再レビューを依頼する
                    </button>
                    <Link href="/challenges" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all italic flex items-center gap-2">
                       課題一覧へ <ArrowRight size={14} />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 animate-fade-in pb-12 font-jp">
      <div className="flex flex-col gap-8">
        {challenge && (
          <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5">
             <div className="flex items-center gap-3 text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">
                <Zap size={16} /> 選択中の課題
             </div>
             <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-6">{challenge.title}</h2>
             
             <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">査読対象の達成条件を選択:</p>
                <div className="flex flex-wrap gap-3">
                  {challenge.acceptanceCriteria.map((ac, i) => (
                    <button
                      key={i}
                      onClick={() => toggleCriteria(i)}
                      className={`px-6 py-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-3 ${
                        selectedCriteria.includes(i) 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {selectedCriteria.includes(i) ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                      {ac}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-bold italic">* チェックを入れた条件が「Approved」された場合、自動的に課題が進捗します。</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* GitHub PR Fetch Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Github size={18} /> GitHub Pull Request 連携
                </h3>
              </div>
              <div className="glass-card p-8 space-y-6">
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  PRのURLを入力して「差分を取得」をクリックすると、変更されたコードを自動的に読み込みます。
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo/pull/123"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    onClick={handleFetchPr}
                    disabled={isFetchingUrl || !githubUrl}
                    className="bg-white text-black hover:bg-slate-200 disabled:opacity-50 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic shrink-0"
                  >
                    {isFetchingUrl ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {isFetchingUrl ? '取得中...' : '差分を取得'}
                  </button>
                </div>
              </div>
           </div>

           {/* Manual Input or Label */}
           <div className="space-y-6 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileCode size={18} /> ソースコードの提出
                </h3>
              </div>
              <div className="flex-1 min-h-[400px] glass-card flex flex-col relative group">
                <div className="absolute top-4 right-4 text-[10px] font-black text-slate-700 uppercase tracking-widest group-focus-within:text-indigo-500/50 transition-colors">Editor</div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ここにコードを貼り付けるか、GitHub連携を利用してください..."
                  className="flex-1 bg-transparent p-8 text-sm font-mono leading-relaxed text-slate-300 focus:outline-none scrollbar-hide resize-none"
                />
              </div>

              <button
                onClick={handleReview}
                disabled={isReviewing || !code || apiStatus.isQuotaExceeded}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg tracking-tighter disabled:opacity-30 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 italic font-jp disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
              >
                {isReviewing ? <Loader2 className="animate-spin" size={24} /> : <MessageSquare size={24} />}
                {apiStatus.isQuotaExceeded ? "AI利用制限中" : (isReviewing ? 'AIマネージャーが査読中...' : 'AIレビューを依頼する')}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
