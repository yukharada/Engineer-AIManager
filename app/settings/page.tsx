'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Settings, User, Target, Brain, RotateCcw, Trash2, ChevronRight } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  infrastructure: 'インフラ',
  database: 'データベース',
  systemDesign: 'システム設計',
  devProcess: '開発プロセス',
  security: 'セキュリティ'
};

export default function SettingsPage() {
  const router = useRouter();
  const { profile, updateProfile, resetAll } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDataDeleteConfirm, setShowDataDeleteConfirm] = useState(false);

  if (!profile || !profile.hasCompletedOnboarding) {
    // router.push('/onboarding');
    // return null;
  }

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fade-in pb-12 font-jp">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
          <Settings size={32} className="text-indigo-400" /> 設定 / SETTINGS
        </h1>
        <p className="text-slate-400 font-bold">プロフィールの管理とアプリケーションのカスタマイズ。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="glass-card p-6 sm:p-10 space-y-8 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/5 blur-[50px] pointer-events-none group-hover:bg-indigo-600/10 transition-all duration-700" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                 <User className="text-indigo-400" size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">プロフィール情報</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">現在のロール</p>
                <p className="text-lg font-bold text-white italic">{profile.role || "未設定"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">経験年数</p>
                <p className="text-lg font-bold text-white italic">{profile.experienceYears}年</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">目標</p>
                <p className="text-sm font-bold text-slate-300 leading-relaxed italic">{profile.goals || "未設定"}</p>
              </div>

              {profile.onboardingCompletedDate && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">診断完了日</p>
                  <p className="text-sm font-bold text-slate-400 italic">
                    {new Date(profile.onboardingCompletedDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 sm:p-8 space-y-6 border-red-500/10 bg-red-500/[0.02]">
            <h2 className="text-lg font-black text-red-400 flex items-center gap-3 uppercase tracking-widest">
              <Trash2 size={20} /> Danger Zone
            </h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              データの削除やリセットを行うことができます。これらの操作は取り消せません。
            </p>
            <button
              onClick={() => setShowDataDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-5 
                       bg-red-500/10 border border-red-500/20 rounded-2xl
                       hover:bg-red-500/20 transition-all group"
            >
              <div className="flex flex-col items-start gap-1">
                <p className="font-black text-red-400 text-sm uppercase italic">全データを削除</p>
                <p className="text-[10px] text-slate-600 font-bold italic">
                  アカウント情報をすべて削除して初期状態に戻ります
                </p>
              </div>
              <ChevronRight size={18} className="text-red-500/50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Skill Snapshot */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                 <Brain className="text-indigo-400" size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">現在のスキル・経験値</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Object.entries(profile.skills).map(([category, progress]) => (
                <div key={category} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{CATEGORY_LABELS[category] || category}</span>
                    <span className="text-xl font-black text-white italic">
                      Lv.{progress.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      style={{ width: `${(progress.xp / progress.xpToNext) * 100}%` }}
                    />
                  </div>
                  <div className="text-[9px] font-black text-slate-600 text-right uppercase italic">
                    {progress.xp} / {progress.xpToNext} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-between p-6 
                       bg-white text-black rounded-2xl
                       hover:bg-slate-200 
                       transition-all group shadow-xl shadow-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-700 shadow-lg shadow-indigo-600/30">
                  <RotateCcw className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg italic uppercase leading-none mb-1">スキル診断をやり直す</p>
                  <p className="text-[10px] text-slate-600 font-bold italic">
                    ロール、経験、目標、スキルを再設定します
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.push('/settings/edit-goals')}
              className="w-full flex items-center justify-between p-6 
                       bg-white/5 border border-white/10 rounded-2xl
                       hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Target className="text-indigo-400" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg italic uppercase text-white leading-none mb-1">目標を編集</p>
                  <p className="text-[10px] text-slate-500 font-bold italic tracking-wide">
                    スキルレベルは維持したまま、目標のみを変更します
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Re-diagnosis Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="glass-card border-indigo-500/50 p-8 sm:p-12 max-w-md w-full space-y-8 transition-all scale-100">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto rotate-6 shadow-2xl shadow-indigo-600/40">
               <RotateCcw size={40} className="text-white" />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">スキル診断をやり直しますか？</h3>
              <p className="text-slate-400 font-bold text-sm leading-relaxed italic">
                現在のプロフィールとスキルレベルが初期化されます。再診断後、新しい成長ロードマップが生成されます。
              </p>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                 <p className="text-[10px] font-black text-yellow-500 uppercase flex items-center justify-center gap-2">
                   ⚠️ 課題やレビュー履歴は保持されます
                 </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-sm uppercase italic"
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  await updateProfile({
                    ...profile,
                    hasCompletedOnboarding: false
                  });
                  router.push('/onboarding');
                }}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-600/20 uppercase italic"
              >
                やり直す
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Data Modal */}
      {showDataDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="glass-card border-red-500/50 p-8 sm:p-12 max-w-md w-full space-y-8">
            <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto -rotate-6 shadow-2xl shadow-red-600/40">
               <Trash2 size={40} className="text-white" />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">全てのデータを削除しますか？</h3>
              <p className="text-slate-400 font-bold text-sm leading-relaxed italic">
                この操作は取り消せません。プロフィール、スキル、ロードマップ、課題、履歴を含むすべてのデータが完全に消去されます。
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDataDeleteConfirm(false)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-sm uppercase italic"
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  await resetAll();
                  window.location.href = '/onboarding';
                }}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm shadow-xl shadow-red-600/20 uppercase italic"
              >
                完全に削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
