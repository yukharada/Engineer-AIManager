"use client";

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
import { SkillScores } from "@/lib/types";

ChartJS.register(
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend
);

interface RadarChartProps {
  data: SkillScores;
}

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

export default function RadarChart({ data }: RadarChartProps) {
  const radarData = {
    labels: Object.keys(data).map(getCategoryLabel),
    datasets: [
      {
        label: "スキルレベル",
        data: Object.values(data),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointHoverBackgroundColor: "#fff",
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

  return <Radar data={radarData} options={radarOptions as any} />;
}
