"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { AlertCircle, Clock, Zap, Info, X } from "lucide-react";

export default function ApiStatusBanner() {
  const { apiStatus, checkQuotaStatus, setApiStatus } = useStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!apiStatus.isQuotaExceeded || !apiStatus.retryAfter) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const retryTime = new Date(apiStatus.retryAfter!).getTime();
      const diff = Math.max(0, Math.floor((retryTime - now) / 1000));
      
      setTimeLeft(diff);
      
      if (diff === 0) {
        checkQuotaStatus();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [apiStatus, checkQuotaStatus]);

  // クォータ超過時のバナー (優先表示)
  if (apiStatus.isQuotaExceeded) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
        <div className="bg-amber-500 text-black px-4 py-3 flex items-center justify-center gap-4 shadow-2xl">
          <AlertCircle size={20} className="shrink-0" />
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-center sm:text-left">
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tight">
                AI利用制限中 (Quota Exceeded)
              </span>
              {apiStatus.isDemoMode && (
                <span className="text-[10px] font-black bg-black/10 px-2 py-0.5 rounded mt-0.5 w-fit uppercase">
                  ⚡ Demo Mode Fallback Active
                </span>
              )}
            </div>
            <span className="text-xs font-bold leading-tight opacity-90 max-w-sm">
              APIの無料枠制限に達しました。{apiStatus.isDemoMode ? "現在はデモデータで動作を継続しています。" : "一部の機能が一時的に制限されます。"}
            </span>
          </div>
          <div className="bg-black/10 px-3 py-1 rounded-full flex items-center gap-2 border border-black/10">
            <Clock size={14} />
            <span className="text-xs font-black tabular-nums">
              再開まで: {timeLeft !== null ? `${timeLeft}秒` : "確認中..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // デモモード動作中のバナー (接続エラーなどの場合)
  if (apiStatus.isDemoMode) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down">
        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between gap-4 shadow-lg border-b border-indigo-400/30">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-yellow-400 animate-pulse" />
            <div className="flex flex-col sm:flex-row items-baseline gap-1 sm:gap-3">
              <span className="text-xs font-black uppercase tracking-wider">Demo Mode Active</span>
              <span className="text-[10px] font-bold opacity-80">
                AI接続エラーのため、サンプルデータを表示しています。
              </span>
            </div>
          </div>
          <button 
            onClick={() => setApiStatus(apiStatus.isQuotaExceeded, apiStatus.retryAfter, false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
