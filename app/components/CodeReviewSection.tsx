'use client';

import { useState } from 'react';
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
import { CheckCircle, AlertCircle, Loader2, Target, HelpCircle, Sparkles, TrendingUp, Github, FileText, Code2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Challenge, ClaudeReviewResult as ReviewResult, ReviewHistoryItem as Review } from '@/lib/types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface CodeReviewSectionProps {
  currentTask: Challenge | null;
}

export default function CodeReviewSection({ 
  currentTask
}: CodeReviewSectionProps) {
  const { profile, saveReviewHistory, updateUserProfile, completeCriteria } = useStore();
  const [activeTab, setActiveTab] = useState<'manual' | 'github'>('manual');
  const [selectedPR, setSelectedPR] = useState('');
  const [code, setCode] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingPr, setIsFetchingPr] = useState(false);
  const [fetchedFiles, setFetchedFiles] = useState<any[]>([]);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  if (!currentTask) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
        <p className="text-gray-400">まず課題を選択してください</p>
      </div>
    );
  }

  const handleFetchPr = async () => {
    if (!prUrl) return;
    setIsFetchingPr(true);
    try {
      const res = await fetch('/api/github/fetch-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prUrl }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setCode(data.code);
        setFetchedFiles(data.files);
      }
    } catch (e) {
      console.error(e);
      alert('PRの取得に失敗しました');
    } finally {
      setIsFetchingPr(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPR || !code) return;

    setLoading(true);
    setReviewResult(null);

    try {
      // Find the index of the selected criteria for auto-completion later
      const criteriaIndex = currentTask.acceptanceCriteria.indexOf(selectedPR);

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          acceptanceCriteria: { title: selectedPR },
          userProfile: {
            skills: profile.skills,
            weaknesses: profile.weaknesses || [],
            strengths: profile.strengths || []
          },
          taskContext: {
            learningGoal: currentTask.description
          }
        })
      });

      const result = await response.json();
      
      if (result.error) {
        alert('レビューに失敗しました: ' + result.error);
        return;
      }

      setReviewResult(result);

      // レビュー履歴を保存
      const review: Review = {
        id: Date.now().toString(),
        taskId: currentTask.id,
        acceptanceCriteria: selectedPR,
        code,
        result,
        timestamp: new Date()
      };

      saveReviewHistory(review);

      // 弱点・強みを集計してプロフィール更新
      updateUserProfile(result.detectedWeaknesses, result.detectedStrengths);

      // Approvedなら自動的に完了状態にする
      if (result.status === 'Approved' && criteriaIndex !== -1) {
        completeCriteria(currentTask.id, [criteriaIndex]);
      }

    } catch (error) {
      console.error('Review error:', error);
      alert('レビューに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const radarData = reviewResult ? {
    labels: ['設計', '命名', 'エラーハンドリング', 'テスト', 'パフォーマンス'],
    datasets: [{
      label: 'スコア',
      data: [
        reviewResult.scores.design,
        reviewResult.scores.naming,
        reviewResult.scores.errorHandling,
        reviewResult.scores.testing,
        reviewResult.scores.performance
      ],
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
    }]
  } : null;

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: '#9CA3AF', display: false },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#D1D5DB', font: { size: 11 } }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full overflow-hidden">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Sparkles className="text-purple-400" size={28} />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Gemini AI コードレビュー
          </span>
        </h2>

        {/* 課題名表示 */}
        <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-white/5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">現在の課題</p>
          <p className="font-bold text-lg text-slate-200">{currentTask.title}</p>
        </div>

        {/* PR選択 */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
            <Target size={16} className="text-indigo-400" /> 受け入れ条件（PR）を選択
          </label>
          <select 
            value={selectedPR}
            onChange={(e) => setSelectedPR(e.target.value)}
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition text-slate-200"
          >
            <option value="">-- 指定するPRを選択してください --</option>
            {currentTask.acceptanceCriteria.map((ac, idx) => {
               const isAlreadyComplete = currentTask.completedCriteria?.[idx];
               return (
                <option key={idx} value={ac} disabled={isAlreadyComplete}>
                  {ac} {isAlreadyComplete ? ' (完了済み)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* タブ切り替え */}
        <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'manual' ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Code2 size={18} />
            コード貼り付け
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'github' ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Github size={18} />
            GitHub PR
          </button>
        </div>

        {activeTab === 'github' ? (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Github size={16} className="text-slate-400" /> Pull Request URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo/pull/123"
                  className="flex-1 p-4 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition text-slate-200"
                />
                <button
                  onClick={handleFetchPr}
                  disabled={!prUrl || isFetchingPr}
                  className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  {isFetchingPr ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                  取得
                </button>
              </div>
            </div>

            {fetchedFiles.length > 0 && (
              <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <FileText size={14} /> 取得したファイル ({fetchedFiles.length})
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {fetchedFiles.map((f, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-white/5">
                      {f.filename}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
              実装したコード
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// こちらにコードを貼り付けてください...&#10;function solveTask() {&#10;  // ...&#10;}"
              className="w-full h-80 p-5 bg-black/40 border border-white/10 rounded-xl font-mono text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition text-slate-300 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* コードプレビュー (GitHub取得時) */}
        {activeTab === 'github' && code && (
           <div className="mb-6">
             <label className="block text-sm font-bold text-gray-400 mb-2">取得したコードのプレビュー</label>
             <div className="w-full h-64 p-5 bg-black/40 border border-white/10 rounded-xl font-mono text-sm overflow-auto text-slate-400 leading-relaxed">
               <pre>{code}</pre>
             </div>
           </div>
        )}

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!selectedPR || !code || loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span className="tracking-widest">レビュー依頼中...</span>
            </>
          ) : (
            <>
              <TrendingUp size={24} />
              <span className="tracking-widest">レビュー依頼を送信</span>
            </>
          )}
        </button>
      </div>

      {/* レビュー結果表示 */}
      {reviewResult && (
        <div className="space-y-6 animate-slide-up pb-10">
          {/* ステータス */}
          <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-all ${
            reviewResult.status === 'Approved' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <div className={`p-3 rounded-full ${reviewResult.status === 'Approved' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
              {reviewResult.status === 'Approved' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <div>
              <p className="font-bold text-2xl tracking-tight">
                {reviewResult.status === 'Approved' ? '承認（Approved）' : '修正依頼（Changes Requested）'}
              </p>
              <p className="text-sm opacity-80 mt-1">
                {reviewResult.status === 'Approved' ? '素晴らしい成果です！自動的に次のステップへ進めます。' : 'いくつかの重要な改善点があります。スタッフエンジニアの視点を確認してください。'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* レーダーチャート */}
            <div className="glass-card p-8 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 w-full">5軸評価スコアリング</h3>
              <div className="w-full max-w-[280px] aspect-square">
                <Radar data={radarData!} options={radarOptions} />
              </div>
            </div>

            {/* フィードバック */}
            <div className="glass-card p-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                フィードバック詳細
              </h3>
              <p className="text-slate-200 text-[15px] leading-relaxed whitespace-pre-wrap">{reviewResult.feedback}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 問いかけ */}
            <div className="glass-card p-8 border-purple-500/10 bg-purple-500/5">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <HelpCircle size={16} /> 思考のトリガー（問いかけ）
              </h3>
              <ul className="space-y-4">
                {reviewResult.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 text-sm leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 次のフォーカス */}
            <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/5 to-pink-500/5">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target size={16} /> 次回の学習フォーカス
              </h3>
              <p className="text-slate-200 font-bold text-lg mb-6">{reviewResult.nextFocus}</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter mb-2">継続すべき強み</p>
                  <div className="flex flex-wrap gap-2">
                    {reviewResult.detectedStrengths.map((s, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter mb-2">重点的な伸び代</p>
                  <div className="flex flex-wrap gap-2">
                    {reviewResult.detectedWeaknesses.map((w, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
