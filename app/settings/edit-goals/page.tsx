'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Target, Save, ArrowLeft, Sparkles } from 'lucide-react';

export default function EditGoalsPage() {
  const router = useRouter();
  const { profile, updateProfile } = useStore();
  const [goals, setGoals] = useState(profile?.goals || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await updateProfile({
        ...profile,
        goals
      });
      router.push('/settings');
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 animate-fade-in font-jp">
      <div className="flex flex-col gap-10">
        <button 
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-colors w-fit group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 戻る
        </button>

        <div className="border-b border-white/10 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
            <Target size={32} className="text-indigo-400" /> 目標を編集
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">成長エンジンの再アライメント</p>
        </div>

        <div className="glass-card p-8 sm:p-12 space-y-8 relative overflow-hidden flex flex-col min-h-[500px]">
           <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/5 blur-[100px] pointer-events-none" />
           
           <div className="space-y-4 flex-1 flex flex-col">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                🎯 あなたの目標（短期〜中期）
              </label>
              <div className="bg-indigo-500/[0.03] border border-indigo-500/10 p-6 rounded-3xl flex-1 flex">
                 <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="例: AWS設計の習得、マイクロサービスアーキテクチャの理解。また、チーム開発での技術的負債の解消を主導できるようになりたい。"
                    className="w-full bg-transparent text-lg font-bold text-white focus:outline-none transition-all resize-none scrollbar-hide"
                 />
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                 <Sparkles className="text-indigo-400 shrink-0 mt-0.5" size={14} />
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                   目標を変更すると、AIマネージャーが次回の週間チャレンジを生成する際の判断基準として反映されます。
                 </p>
              </div>
           </div>

           <div className="pt-10 flex gap-4">
              <button
                onClick={() => router.push('/settings')}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xl transition-all italic"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !goals}
                className="flex-[2] py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 italic disabled:opacity-30"
              >
                <Save size={24} />
                {saving ? '保存中...' : '設定を保存'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
