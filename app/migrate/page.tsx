"use client";

import { useState } from 'react';
import { saveUserProfile, saveChallenges, saveReviewHistory, saveRoadmap, saveMonthlyReports } from '@/lib/db';
import { Database, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Simple UUID v4 generator for legacy conversion
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function isUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export default function MigratePage() {
  const [status, setStatus] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMigrate = async () => {
    setIsLoading(true);
    setStatus('移行を開始しています...');
    
    try {
      // LocalStorageからデータを取得
      const profileStr = localStorage.getItem('egs_profile');
      const roadmapStr = localStorage.getItem('egs_roadmap');
      const challengesStr = localStorage.getItem('egs_challenges');
      const historyStr = localStorage.getItem('egs_review_history');
      const monthlyStr = localStorage.getItem('egs_monthly');
      
      if (!profileStr) {
        setStatus('❌ LocalStorageにデータが見つかりません (egs_profile)');
        setIsLoading(false);
        return;
      }
      
      const profile = JSON.parse(profileStr);
      const roadmap = roadmapStr ? JSON.parse(roadmapStr) : [];
      let challenges = challengesStr ? JSON.parse(challengesStr) : [];
      let history = historyStr ? JSON.parse(historyStr) : [];
      const monthlyReports = monthlyStr ? JSON.parse(monthlyStr) : [];
      
      // Map legacy IDs to new UUIDs to maintain referential integrity
      const idMap = new Map<string, string>();
      
      setStatus(`プロファイルを移行中...`);
      await saveUserProfile(profile);
      
      setStatus(`ロードマップを移行中...`);
      if (roadmap.length > 0) {
        await saveRoadmap(roadmap);
      }

      setStatus(`課題のIDを変換中...`);
      challenges = challenges.map((c: any) => {
        const hasValidCC = c.completedCriteria && typeof c.completedCriteria === 'object';
        const cleanedChallenge = { ...c, completedCriteria: hasValidCC ? c.completedCriteria : {} };

        if (!isUUID(c.id)) {
          const newId = generateUUID();
          idMap.set(c.id, newId);
          return { ...cleanedChallenge, id: newId };
        }
        return cleanedChallenge;
      });

      setStatus(`課題を移行中... (${challenges.length}件)`);
      if (challenges.length > 0) {
        await saveChallenges(challenges);
      }
      
      setStatus(`レビュー履歴のIDを変換中...`);
      history = history.map((h: any) => {
        const mappedId = idMap.get(h.taskId);
        return {
          ...h,
          id: isUUID(h.id) ? h.id : generateUUID(),
          taskId: mappedId || h.taskId
        };
      });

      setStatus(`レビュー履歴を移行中... (${history.length}件)`);
      for (const item of history) {
        if (isUUID(item.taskId) || item.taskId === 'manual') {
          await saveReviewHistory({
            ...item,
            taskId: isUUID(item.taskId) ? item.taskId : 'manual'
          });
        }
      }

      setStatus(`マンスリーレポートを移行中... (${monthlyReports.length}件)`);
      if (monthlyReports.length > 0) {
        await saveMonthlyReports(monthlyReports);
      }
      
      setStatus('✅ 移行完了！ Supabase への同期に成功しました。');
      setIsComplete(true);
      
    } catch (error: any) {
      setStatus(`❌ 移行エラー: ${error.message}`);
      console.error('移行エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 flex items-center justify-center font-jp">
      <div className="max-w-xl w-full glass-card p-10 space-y-8 animate-fade-in border-indigo-500/20">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <Database size={32} className="text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black italic tracking-tight">DATA MIGRATION</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">データ移行: LocalStorage → Supabase</p>
          </div>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={18} />
            <span className="text-sm font-black uppercase tracking-tight">警告</span>
          </div>
          <p className="text-xs font-bold text-slate-400 leading-relaxed">
            この操作はブラウザ（LocalStorage）に保存されている成長データを、Supabase のクラウドデータベースへ同期します。
            移行後は、どのデバイスからアクセスしてもデータが共有されるようになります。
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleMigrate}
            disabled={isComplete || isLoading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-30 flex items-center justify-center gap-3 italic font-jp"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : isComplete ? <CheckCircle2 size={24} /> : <Database size={24} />}
            {isComplete ? '移行完了' : 'SUPABASE へ移行する'}
          </button>
          
          {status && (
            <div className={`p-4 rounded-xl border text-xs font-black uppercase tracking-tight text-center ${
              status.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              status.startsWith('❌') ? 'bg-red-500/10 border-red-500/20 text-red-100' :
              'bg-blue-500/10 border-indigo-500/20 text-indigo-400'
            }`}>
              {status}
            </div>
          )}
        </div>
        
        {isComplete && (
          <div className="pt-4 border-t border-white/5">
            <Link 
              href="/"
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest italic"
            >
              ダッシュボードに戻る <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
