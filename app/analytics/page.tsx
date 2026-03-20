"use client";

import { useStore } from "@/lib/store";
import { Radar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from "chart.js";
import { 
  LineChart, 
  TrendingUp, 
  Target, 
  Award, 
  Activity, 
  AlertCircle,
  Zap
} from "lucide-react";

ChartJS.register(
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend
);

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = { 
    frontend: "フロント", 
    backend: "バック", 
    infrastructure: "インフラ", 
    systemDesign: "設計", 
    database: "DB", 
    security: "セキュリティ", 
    devProcess: "プロセス" 
  };
  return map[cat] || cat;
};

export default function Analytics() {
  const { profile, reviewHistory } = useStore();

  const radarData = {
    labels: Object.keys(profile.skills).map(getCategoryLabel),
    datasets: [
      {
        label: "現在",
        data: Object.values(profile.skills),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
      }
    ],
  };

  const radarOptions = {
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
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const weaknesses = profile.evaluation?.areasForImprovement || [];
  const strengths = profile.evaluation?.strengths || [];

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
          <TrendingUp size={32} className="text-indigo-400" /> 成長アナリティクス
        </h1>
        <p className="text-slate-400 font-bold">AIによる多角的スキル評価とキャリア分析。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Graph */}
        <div className="glass-card p-6 sm:p-8 flex flex-col gap-6 items-center">
          <div className="w-full flex items-center justify-between mb-2">
             <h3 className="text-lg font-black flex items-center gap-3">
              <Activity className="text-indigo-500" /> スキル分布マップ
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Profile</span>
          </div>
          <div className="w-full h-[300px] sm:h-[400px]">
             <Radar data={radarData} options={radarOptions as any} />
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="flex flex-col gap-8">
          <div className="glass-card p-6 sm:p-8 border-indigo-500/10">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
              <Award className="text-yellow-500" /> AI総評
            </h3>
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
               <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-bold italic">
                 "{profile.evaluation?.summary}"
               </p>
            </div>
            <div className="mt-8">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">注力項目</h4>
               <div className="text-lg sm:text-xl font-black text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 p-4 rounded-xl flex items-center gap-3">
                  <Zap size={24} className="text-yellow-500" />
                  {profile.evaluation?.recommendedFocus}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-6 border-emerald-500/10 hover:border-emerald-500/30 transition-all">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Strengths</h4>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="text-xs sm:text-sm font-bold text-slate-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-6 border-red-500/10 hover:border-red-500/30 transition-all">
              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Weaknesses</h4>
              <ul className="space-y-3">
                {weaknesses.map((w, i) => (
                  <li key={i} className="text-xs sm:text-sm font-bold text-slate-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
