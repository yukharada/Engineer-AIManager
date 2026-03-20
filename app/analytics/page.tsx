"use client";

import { useStore } from "@/lib/store";
import { LineChart, LineChart as ChartIcon } from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from "chart.js";
import { Radar, Line } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

export default function AnalyticsPage() {
  const { profile, challenges, computedSkills } = useStore();

  const labels = [
    "フロントエンド", "バックエンド", "インフラ", "システム設計", "DB", "セキュリティ", "開発プロセス"
  ];
  
  const completedCount = challenges.filter(c => c.completed).length;
  
  const currentSkills = [
    computedSkills.frontend,
    computedSkills.backend,
    computedSkills.infrastructure,
    computedSkills.systemDesign,
    computedSkills.database,
    computedSkills.security,
    computedSkills.devProcess
  ];

  const radarData = {
    labels,
    datasets: [
      {
        label: "現在のスキルレベル",
        data: currentSkills,
        backgroundColor: "rgba(124, 58, 237, 0.2)",
        borderColor: "rgba(124, 58, 237, 1)",
        pointBackgroundColor: "rgba(6, 182, 212, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 2,
      }
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: "rgba(255, 255, 255, 0.1)" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        pointLabels: { color: "rgba(255, 255, 255, 0.7)", font: { size: 12, family: "Inter" } },
        min: 0,
        max: 10,
        ticks: { display: false, stepSize: 2 }
      }
    },
    plugins: {
      legend: { labels: { color: "rgba(255, 255, 255, 0.8)", font: { family: "Inter" } } }
    }
  };

  // Generate dynamic week labels based on currentSystemDate
  const today = new Date(profile.currentSystemDate || "2026-03-15");
  const getWeekLabel = (weeksAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (weeksAgo * 7));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const lineData = {
    labels: [getWeekLabel(3), getWeekLabel(2), getWeekLabel(1), getWeekLabel(0)],
    datasets: [
      {
        label: "完了したタスク数",
        data: [
          Math.max(0, completedCount - 2), 
          Math.max(0, completedCount - 1), 
          Math.max(1, completedCount), 
          completedCount
        ],
        borderColor: "rgba(6, 182, 212, 1)",
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const lineOptions = {
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(255,255,255,0.7)" } },
      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(255,255,255,0.7)", stepSize: 1, min: 0 } }
    },
    plugins: {
      legend: { labels: { color: "white" } }
    }
  };

  if (!profile.hasCompletedOnboarding) {
    return <div className="text-center mt-20 text-slate-400">先に「スキル診断」を完了してください。</div>;
  }

  const skillEntries = labels.map((label, idx) => ({ label, score: currentSkills[idx] }));
  skillEntries.sort((a, b) => b.score - a.score);
  const strongest = skillEntries.slice(0, 2).map(e => e.label).join(" / ");
  const weakest = skillEntries.slice(-2).reverse().map(e => e.label).join(" / ");
  const showPraise = completedCount >= 3;

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex flex-col border-b border-white/10 pb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><ChartIcon size={32} className="text-indigo-400" /> 成長分析</h1>
        <p className="text-slate-400">スキルの進捗と学習の一貫性を可視化します。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-6 w-full mt-2 ml-4">スキルチャート</h3>
          <div className="w-full max-w-md aspect-square">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-6 w-full mt-2 ml-4">ベロシティ (直近4週間)</h3>
          <div className="w-full h-full min-h-[300px] flex items-center justify-center">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6 md:p-8 mt-4">
        <h3 className="text-xl font-bold mb-4">マネージャーからのインサイト</h3>
        <div className="text-slate-300 leading-relaxed text-lg flex flex-col gap-3">
          <p>
            レーダーチャートに基づくと、現在の最も強力な領域は<strong className="text-indigo-400">{strongest}</strong>です。
            しかし、<strong className="text-orange-400">{weakest}</strong>のスキルが少し不足しています。
            直近の課題やロードマップではこの領域の学習を優先するように調整することをお勧めします。
          </p>
          <p>
            {completedCount === 0 
              ? "まだ完了した課題がありません。まずは最初の課題に取り組んでベロシティを上げていきましょう！" 
              : showPraise 
                ? `すでに${completedCount}個の課題を完了しており、非常に良いベロシティを維持できています。素晴らしいペースです！`
                : `${completedCount}個の課題を完了しました。着実に成長しています。引き続き学習を継続していきましょう！`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
