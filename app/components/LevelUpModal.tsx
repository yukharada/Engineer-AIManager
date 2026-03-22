"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Sparkles } from 'lucide-react';

export default function LevelUpModal() {
  const { levelUpInfo, setLevelUpInfo } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (levelUpInfo) {
      setIsVisible(true);
    }
  }, [levelUpInfo]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setLevelUpInfo(null);
    }, 500);
  };

  if (!levelUpInfo && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className={`relative glass-card p-10 max-w-sm w-full text-center space-y-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        <div className="relative">
           <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center rotate-12 mx-auto animate-bounce shadow-2xl shadow-indigo-600/50">
              <Sparkles className="text-white" size={48} />
           </div>
           <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 -z-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase font-jp">レベルアップ！</h2>
          <p className="text-slate-400 font-bold font-jp">あなたのスキルが進化しました</p>
        </div>

        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-1">
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] font-jp">{levelUpInfo?.skill}</span>
           <div className="text-5xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
             Lv.{levelUpInfo?.newLevel}
           </div>
        </div>

        <button 
          onClick={handleClose}
          className="w-full py-4 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all italic font-jp"
        >
          素晴らしい！
        </button>
      </div>
      
      {/* Celebration sparkles (simplified CSS animation) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
