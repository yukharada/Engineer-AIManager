"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  Activity,
  ChevronRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

export default function HistoryPage() {
  const { reviewHistory, challenges } = useStore();

  const sortedHistory = [...reviewHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Statistics
  const totalReviews = reviewHistory.length;
  const approvedCount = reviewHistory.filter(r => r.result.status === 'Approved').length;
  const approvedRate = totalReviews > 0 ? Math.round((approvedCount / totalReviews) * 100) : 0;
  
  const avgScores = reviewHistory.reduce((acc, r) => {
    acc.design += r.result.scores.design;
    acc.naming += r.result.scores.naming;
    acc.errorHandling += r.result.scores.errorHandling;
    acc.testing += r.result.scores.testing;
    acc.performance += r.result.scores.performance;
    return acc;
  }, { design: 0, naming: 0, errorHandling: 0, testing: 0, performance: 0 });

  const totalAvgScore = totalReviews > 0 
    ? (Object.values(avgScores).reduce((a, b) => a + b, 0) / (totalReviews * 5)).toFixed(1)
    : "0.0";

  // Chart Data: Score Trends
  const trendHistory = [...reviewHistory].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const lineChartData = {
    labels: trendHistory.map(r => format(new Date(r.timestamp), "MM/dd")),
    datasets: [
      {
        label: "設計",
        data: trendHistory.map(r => r.result.scores.design),
        borderColor: "rgba(139, 92, 246, 1)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        fill: false,
      },
      {
        label: "命名",
        data: trendHistory.map(r => r.result.scores.naming),
        borderColor: "rgba(236, 72, 153, 1)",
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        tension: 0.4,
        fill: false,
      },
      {
        label: "テスト",
        data: trendHistory.map(r => r.result.scores.testing),
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const weaknessCounts: Record<string, number> = {};
  reviewHistory.forEach(r => {
    (r.result.detectedWeaknesses || []).forEach(w => {
      weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
    });
  });

  const sortedWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const barChartData = {
    labels: sortedWeaknesses.map(w => w[0]),
    datasets: [
      {
        label: "指摘回数",
        data: sortedWeaknesses.map(w => w[1]),
        backgroundColor: "rgba(245, 158, 11, 0.6)",
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 10, grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: "#94a3b8", usePointStyle: true, boxWidth: 6, font: { size: 10 } } }
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12 px-1">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
            <Clock size={32} className="text-indigo-400" /> レビュー履歴
          </h1>
          <p className="text-slate-400 font-bold">これまでの挑戦とフィードバックの軌跡。</p>
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card border-dashed">
          <Clock size={48} className="text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-300 mb-2">履歴がまだありません</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-bold">課題をクリアしてAIレビューを受けると、ここに成長の記録が蓄積されます。</p>
        </div>
      ) : (
        <>
          {/* Stats Bar - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-6 flex flex-col gap-1 border-indigo-500/10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">総レビュー数</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-100">{totalReviews}</span>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Reviews</span>
              </div>
            </div>
            <div className="glass-card p-6 flex flex-col gap-1 border-emerald-500/10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Approved 率</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{approvedRate}%</span>
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
            </div>
            <div className="glass-card p-6 flex flex-col gap-1 border-purple-500/10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">平均スコア</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-400">{totalAvgScore}</span>
                <Activity size={24} className="text-purple-500" />
              </div>
            </div>
            <div className="glass-card p-6 flex flex-col gap-1 border-cyan-500/10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">最高 (設計)</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-cyan-400">{Math.max(...reviewHistory.map(r => r.result.scores.design))}</span>
                <Award size={24} className="text-cyan-500" />
              </div>
            </div>
          </div>

          {/* Charts Section - Responsive Stacking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 sm:p-8 min-h-[350px] sm:min-h-[450px] flex flex-col gap-6">
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-3 uppercase tracking-widest">
                <TrendingUp size={16} className="text-indigo-400" /> スコア推移トレンド
              </h3>
              <div className="flex-1 w-full relative">
                <Line data={lineChartData} options={chartOptions as any} />
              </div>
            </div>
            <div className="glass-card p-6 sm:p-8 min-h-[350px] sm:min-h-[450px] flex flex-col gap-6">
              <h3 className="text-sm font-black text-slate-300 flex items-center gap-3 uppercase tracking-widest">
                <AlertCircle size={16} className="text-amber-400" /> 指摘頻出カテゴリ
              </h3>
              <div className="flex-1 w-full relative">
                <Bar 
                  data={barChartData} 
                  options={{
                    ...chartOptions, 
                    scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: undefined } } 
                  } as any} 
                />
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="flex flex-col gap-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-200 flex items-center gap-3">
              <Filter size={24} className="text-slate-500" /> タイムライン
            </h3>
            <div className="relative border-l-2 border-slate-800 ml-2 sm:ml-6 pl-6 sm:pl-10 space-y-10">
              {sortedHistory.map((item, i) => {
                const challenge = challenges.find(c => c.id === item.taskId);
                const isApproved = item.result.status === 'Approved';
                
                return (
                  <div key={item.id} className="relative animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={`absolute w-5 h-5 rounded-full -left-[31px] sm:-left-[51px] top-6 border-4 border-[#0a0a0f] shadow-sm z-10 ${
                      isApproved ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50"
                    }`}></div>
                    
                    <div className="glass-card hover:border-indigo-500/30 transition-all group overflow-hidden">
                      <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                              {format(new Date(item.timestamp), "yyyy/MM/dd HH:mm", { locale: ja })}
                            </span>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                              isApproved 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}>
                              {isApproved ? "APPROVED" : "CHANGES REQUESTED"}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors tracking-tight">
                              {challenge?.title || "不明な課題"}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 line-clamp-1 italic">
                              {item.acceptanceCriteria}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {Object.entries(item.result.scores).map(([key, score]) => (
                              <div key={key} className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 min-w-[70px]">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter opacity-70">
                                  {key === 'errorHandling' ? 'error' : key}
                                </span>
                                <span className="text-sm font-black text-indigo-300">{score as number}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="w-full md:w-72 shrink-0 p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/[0.07] transition-all">
                          <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed line-clamp-4 italic">
                            "{item.result.feedback}"
                          </p>
                          <Link 
                            href={`/review?challengeId=${item.taskId}`}
                            className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                          >
                            レビュー詳細を見る <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
