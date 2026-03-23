"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Target, Zap, Rocket, CheckCircle2, ChevronRight, Info, AlertTriangle } from "lucide-react";
import { createInitialSkillProgress } from "@/lib/types";
import { getCurrentDateISO } from "@/lib/dateUtils";
import { mapExperienceToLevel, initializeSkillProgress, getStageLabel } from "@/lib/levelMapping";

// Level definitions for tooltips
const LEVEL_DEFINITIONS: Record<string, Record<number, string>> = {
  frontend: {
    1: 'HTML/CSS基礎。構造とスタイルの理解',
    2: '標準的な静的ページの作成経験',
    3: 'JS基礎。DOM操作や基本的なイベント処理',
    4: 'フレームワーク初学者。基礎チュートリアル完了',
    5: 'フレームワークでの小規模コンポーネント開発',
    6: '実務レベルのSPA開発。状態管理の初歩',
    7: '複雑な状態管理やルーティング。実務経験2-3年',
    8: 'パフォーマンス最適化やビルドパイプライン',
    9: '大規模アーキテクチャ設計。Next.js/TS',
    10: 'フロントエンドエキスパート。組織横断的な技術選定'
  },
  backend: {
    1: '学習中。APIの基本概念を理解',
    2: '簡単なCRUD操作ができる',
    3: 'REST API基礎。フレームワーク経験1年未満',
    4: 'データベース連携。実務経験1-2年',
    5: '認証・認可の実装。実務経験2-3年',
    6: 'マイクロサービス設計の理解',
    7: 'パフォーマンス最適化。実務経験5年+',
    8: 'アーキテクチャ設計。分散システム',
    9: 'スケーラブルシステム設計のエキスパート',
    10: '大規模システムの設計・運用のマスター'
  },
  infrastructure: {
    1: '基本概念。SSH接続やコマンド操作',
    2: 'クラウドコンソールでの手動構築',
    3: 'Docker基礎。Dockerfileの作成',
    4: 'IaC基礎（Terraform等）。CI/CD初歩',
    5: 'クラウド設計。実務でのインフラ構築',
    6: 'Kubernetes等のコンテナ管理・運用',
    7: 'SLI/SLOに基づくSRE。監視設計',
    8: 'マルチクラウドアーキテクチャ設計',
    9: '大規模インフラの信頼性向上エキスパート',
    10: 'プラットフォームエンジニアリングの熟達者'
  },
  database: {
    1: 'SQL基礎。CRUDや基本的なJOIN',
    2: '簡単なテーブル設計と制約の理解',
    3: 'インデックス基礎。実行計画の初歩',
    4: '正規化・非正規化。複雑な抽出クエリ',
    5: 'クエリ最適化。実務でのパフォーマンス管理',
    6: 'レプリケーション。可用性設計の理解',
    7: 'シャーディング、分散DBの運用管理',
    8: '大規模データ基盤設計。分析基盤',
    9: 'データベース内部構造に精通。設計マスター',
    10: 'DBスペシャリスト。DB自体の開発・貢献レベル'
  },
  systemDesign: {
    1: '3層アーキテクチャ等の基本理解',
    2: 'SOLID原則の概念的な理解',
    3: 'デザインパターンの基礎適用',
    4: 'モジュール結合度と凝集度の意識',
    5: 'マイクロサービス等の分散設計の初歩',
    6: '分散トランザクション・イベント駆動設計',
    7: 'トレードオフの定量的判断。実務5年+',
    8: '複雑なエンタープライズ設計の主導',
    9: '業界標準のアーキテクチャ設計エキスパート',
    10: '最高技術責任者レベルの設計洞察'
  },
  devProcess: {
    1: 'Git基本操作。ブランチ、プルリク',
    2: 'コードレビューの受領・基本的な指摘',
    3: 'アジャイル・スクラムの基本用語理解',
    4: 'CI自動化に向けたテストコード記述',
    5: 'DevOpsの実践。デプロイ自動化主導',
    6: 'スクラムマスター等のチーム開発リード',
    7: '生産性指標の計測とプロセス改善',
    8: '組織横断的な開発文化の醸成',
    9: 'エンジニアリングマネジメントの熟達者',
    10: 'エンジニアリング組織全体を率いるマスター'
  },
  security: {
    1: '脆弱性の基本概念（XSS, SQLi）',
    2: 'HTTPSや暗号化の基礎知識',
    3: '認証・認可の標準的な実装',
    4: 'OWASP Top 10に基づく対策',
    5: 'セキュリティ診断ツールの導入・運用',
    6: 'ID基盤（OAuth等）の設計・構築',
    7: 'インシデントレスポンス。リスクアセスメント',
    8: 'ゼロトラスト等のセキュア設計実践',
    9: 'セキュリティアーキテクト。監査経験',
    10: 'セキュリティスペシャリスト。研究家レベル'
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  infrastructure: 'インフラ',
  database: 'データベース',
  systemDesign: 'システム設計',
  devProcess: '開発プロセス',
  security: 'セキュリティ'
};

export default function Onboarding() {
  const { profile, saveProfile, saveRoadmap, apiStatus, setApiStatus } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState<{cat: string, lvl: number} | null>(null);

  // Temporary flat levels for selection (converted to XP objects on finish)
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({
    frontend: 1,
    backend: 1,
    infrastructure: 1,
    systemDesign: 1,
    database: 1,
    security: 1,
    devProcess: 1,
  });

  // Pre-fill skills if profile exists (re-diagnosis)
  useEffect(() => {
    if (profile && !profile.hasCompletedOnboarding && profile.role) {
      const skills: Record<string, number> = {};
      for (const cat in profile.skills) {
        if (cat in CATEGORY_LABELS) {
          const lvl = profile.skills[cat as keyof typeof profile.skills].level;
          // Convert 100-scale level back to 1-10 scale for onboarding UI
          skills[cat] = Math.max(1, Math.min(10, Math.floor(lvl / 10)));
        }
      }
      if (Object.keys(skills).length > 0) {
        setSelectedLevels(skills);
      }
    }
  }, [profile]);

  const handleProfileChange = (field: string, value: any) => {
    saveProfile({ ...profile, [field]: value });
  };

  const handleFinishOnboarding = async (updatedProfile: any) => {
    await saveProfile(updatedProfile);
    setStep(4); // Show summary screen
  };

  const generateRoadmap = async () => {
    setStep(3);
    setIsGenerating(true);
    try {
      const skills: any = {};
      for (const cat in selectedLevels) {
        skills[cat] = initializeSkillProgress(selectedLevels[cat]);
      }

      const currentProfile = { ...profile, skills };

      // Step 1: Evaluate Skills
      const evalRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_skills", payload: currentProfile }),
      });
      const evalData = await evalRes.json();
      
      if (!evalRes.ok) {
        if (evalRes.status === 429 && evalData.isQuotaExceeded) {
          setApiStatus(true, evalData.retryAfter);
        }
        throw new Error(evalData.error || "スキル評価に失敗しました。");
      }

      // デモモードフラグのチェック
      if (evalData.isDemo) {
        setApiStatus(evalData.isQuotaExceeded || false, evalData.retryAfter || null, true);
      }
      
      const updatedProfile = { 
        ...currentProfile, 
        evaluation: evalData, 
        hasCompletedOnboarding: true,
        onboardingCompletedDate: getCurrentDateISO(),
        roadmapStartDate: getCurrentDateISO()
      };
      await saveProfile(updatedProfile);

      // Step 2: Generate Roadmap
      const roadmapRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_roadmap", payload: { profile: updatedProfile, months: 36 } }),
      });
      const roadmapData = await roadmapRes.json();

      if (!roadmapRes.ok) {
        if (roadmapRes.status === 429 && roadmapData.isQuotaExceeded) {
          setApiStatus(true, roadmapData.retryAfter);
        }
        throw new Error(roadmapData.error || "ロードマップ生成に失敗しました。");
      }

      // ロードマップデータ内にもisDemoがあるかチェック
      if (Array.isArray(roadmapData) && roadmapData.some((p: any) => p.isDemo)) {
        setApiStatus(roadmapData[0]?.isQuotaExceeded || false, roadmapData[0]?.retryAfter || null, true);
      }

      await saveRoadmap(roadmapData);
      handleFinishOnboarding(updatedProfile);
    } catch (e: any) {
      console.error("[Onboarding] Fatal Error:", e);
      alert("エラーが発生しました: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-jp pb-24">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl rotate-3 shadow-xl shadow-indigo-600/20">
          {step}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter italic uppercase text-white/90">
            {step === 1 ? "Profile / 基本プロファイル" : step === 2 ? "Analytic / 自己診断" : step === 3 ? "Intelligence / 戦略構築" : "Summary / 診断結果"}
          </h1>
          <div className="flex gap-2 mt-3">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-12 animate-fade-in relative overflow-hidden min-h-[600px] flex flex-col">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/5 blur-[100px] pointer-events-none" />
        
        {step === 1 && (
          <div className="space-y-10 flex flex-col h-full animate-slide-up">
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-indigo-400" /> 現在のロール・目指している職種
              </label>
              <input
                type="text"
                placeholder="例: Senior Full-stack Engineer, Tech Lead"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={profile.role}
                onChange={(e) => handleProfileChange("role", e.target.value)}
              />
              <p className="text-[10px] text-slate-500 font-bold italic">💡 ヒント: 具体的に書くと、より適切なロードマップが生成されます</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={16} className="text-indigo-400" /> エンジニア経験年数
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white italic">{profile.experienceYears}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">Years</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={profile.experienceYears || 1}
                  onChange={(e) => handleProfileChange("experienceYears", parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                   <span>Junior (1y)</span>
                   <span>Mid (5y)</span>
                   <span>Senior (10y)</span>
                   <span>Principal (20y)</span>
                   <span>Legend (30y)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-indigo-500/[0.03] border border-indigo-500/10 p-6 rounded-3xl mt-4">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                🎯 あなたの目標（短期〜中期）
              </label>
              <textarea
                placeholder="例: マイクロサービスアーキテクチャの習得、AWS上でのIaC自動化の実践。また、チーム開発での技術的負債の解消を主導できるようになりたい。"
                className="w-full h-32 bg-transparent text-lg font-bold text-white focus:outline-none transition-all resize-none scrollbar-hide"
                value={profile.goals}
                onChange={(e) => handleProfileChange("goals", e.target.value)}
              />
              <p className="text-[10px] text-slate-600 font-bold italic">💡 ヒント: 複数の目標を書いてOKです。具体的であるほどAIの精度が上がります</p>
            </div>

            <div className="mt-auto pt-10">
              <button
                disabled={!profile.role || !profile.goals || profile.experienceYears === 0}
                onClick={() => setStep(2)}
                className="w-full py-5 bg-white text-black hover:bg-slate-200 disabled:opacity-20 rounded-2xl font-black text-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 italic font-jp"
              >
                自己診断へ進む <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-slide-up">
            <div className="space-y-4">
              <h2 className="text-2xl font-black italic text-white font-jp uppercase">現在の経験度を選択してください</h2>
              <p className="text-slate-400 font-bold font-jp leading-relaxed">
                各技術の実務経験や習熟度を1-10で評価してください。<br />
                これを元に、あなたに最適なレベルからスタートします。
              </p>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 mb-8">
               <div className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">
                  <Info size={16} /> 経験度の目安
               </div>
               <div className="space-y-3 text-sm font-bold text-slate-400 leading-relaxed">
                  <p>1-3: 学習中・入門レベル → <span className="text-indigo-300">Lv.1-30</span> からスタート</p>
                  <p>4-7: 実務経験あり・中級 → <span className="text-indigo-300">Lv.31-70</span> からスタート</p>
                  <p>8-10: エキスパート・上級 → <span className="text-indigo-300">Lv.71-95</span> からスタート</p>
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/10 rounded-xl">
                      <p className="text-xs text-purple-300 font-black tracking-tighter italic uppercase">🎯 Lv.100は全員の目標です！</p>
                  </div>
               </div>
            </div>

            <div className="space-y-16">
              {Object.keys(selectedLevels).map((cat) => (
                <div key={cat} className="space-y-6">
                   <div className="flex justify-between items-end">
                      <h3 className="text-xl font-black text-white flex items-center gap-2 border-b-2 border-indigo-500 pb-1">
                        {CATEGORY_LABELS[cat]}
                      </h3>
                      <div className="text-right">
                         <div className="text-3xl font-black text-indigo-400 italic">Lv.{selectedLevels[cat]}</div>
                         <div className="text-[10px] font-black text-slate-500 max-w-[200px] line-clamp-1 italic">{LEVEL_DEFINITIONS[cat][selectedLevels[cat]]}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-5 md:grid-cols-10 gap-2 relative">
                      {/* Tooltip Overlay */}
                      {hoveredLevel && hoveredLevel.cat === cat && (
                        <div className="absolute -top-14 left-0 right-0 z-10 animate-fade-in pointer-events-none flex justify-center">
                           <div className="bg-[#0a0a0f] border border-indigo-500/50 rounded-xl px-4 py-2 shadow-2xl flex items-center gap-3">
                              <Info size={14} className="text-indigo-400" />
                              <span className="text-xs font-bold text-slate-200">
                                 Lv.{hoveredLevel.lvl}: {LEVEL_DEFINITIONS[cat][hoveredLevel.lvl]}
                              </span>
                           </div>
                        </div>
                      )}

                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setSelectedLevels(prev => ({ ...prev, [cat]: lvl }))}
                          onMouseEnter={() => setHoveredLevel({ cat, lvl })}
                          onMouseLeave={() => setHoveredLevel(null)}
                          className={`h-14 rounded-xl font-black text-sm transition-all border ${
                            selectedLevels[cat] === lvl 
                              ? 'bg-indigo-600 text-white border-indigo-400 scale-105 z-1 shadow-lg shadow-indigo-600/30' 
                              : selectedLevels[cat] > lvl
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/10'
                              : 'bg-white/5 text-slate-600 border-white/5 hover:bg-white/10 hover:text-slate-400'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                   </div>
                   
                    {/* Visual Bar */}
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                       <div 
                         className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                         style={{ width: `${selectedLevels[cat] * 10}%` }}
                       />
                    </div>
                    
                    {/* Preview Label */}
                    <div className="text-center">
                       <p className="text-[10px] font-bold text-slate-500 italic">
                         この経験度で、ゲーム内レベル <span className="text-indigo-400 font-black uppercase tracking-tighter">Lv.{mapExperienceToLevel(selectedLevels[cat])}</span> からスタートします
                       </p>
                    </div>
                 </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xl transition-all font-jp"
              >
                戻る
              </button>
              <button 
                onClick={generateRoadmap}
                className="flex-[2] py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 italic font-jp"
              >
                分析を開始 <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-slide-up">
            <div className="relative">
               <div className="w-40 h-40 bg-indigo-600/10 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center blur-sm absolute" />
                  <Rocket className="text-indigo-400 relative z-10" size={80} />
               </div>
               <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                  <Sparkles className="text-indigo-600" size={32} />
               </div>
            </div>
            
            <div className="text-center space-y-4 max-w-sm">
               <h2 className="text-3xl font-black font-jp tracking-tight">成長戦略を構築しています</h2>
               <p className="text-slate-500 font-bold leading-relaxed font-jp">
                  AIマネージャーがあなたのプロフィールを分析領域ごとにマッピングし、最適な36ヶ月のロードマップを個別生成しています。
               </p>
            </div>

            {apiStatus.isQuotaExceeded && (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl w-full text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs">
                  <AlertTriangle size={16} /> API利用制限中です
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  現在、AIの利用制限がかかっているため、新しいロードマップの作成ができません。上部のバナーのカウントダウン終了後に再度お試しください。
                </p>
              </div>
            )}

            <div className="w-full space-y-4">
              {isGenerating ? (
                <div className="w-full py-6 bg-indigo-600/20 text-indigo-400 rounded-2xl font-black text-xl flex items-center justify-center gap-4 italic border border-indigo-500/30 font-jp">
                  <Loader2 className="animate-spin" size={28} />
                  AIが戦略を立案中...
                </div>
              ) : (
                <button
                  id="generate-roadmap-button"
                  onClick={generateRoadmap}
                  disabled={apiStatus.isQuotaExceeded}
                  className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 italic disabled:opacity-50 disabled:bg-slate-800 disabled:shadow-none font-jp"
                >
                  <CheckCircle2 size={28} />
                  ロードマップを再生成
                </button>
              )}
              <p className="text-[10px] text-slate-600 font-bold text-center italic tracking-widest">
                Generating unique nodes for {profile.role}...
              </p>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-slide-up py-6">
             <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 rounded-3xl p-8 sm:p-12 text-center w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <Rocket size={48} className="text-indigo-400 mx-auto mb-6 animate-bounce" />
                <h2 className="text-3xl font-black italic mb-2">DIAGNOSIS COMPLETE</h2>
                <p className="text-slate-500 font-bold mb-10">あなたのスタートレベルが決定しました</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                   {Object.entries(profile.skills).map(([cat, progress]) => (
                     <div key={cat} className="glass-card p-4 flex flex-col items-center gap-1 border-white/5 bg-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{CATEGORY_LABELS[cat]}</span>
                        <div className="text-2xl font-black text-indigo-400 italic">Lv.{progress.level}</div>
                        <span className={`text-[10px] font-black ${getStageLabel(progress.level).color} uppercase tracking-widest`}>
                           {getStageLabel(progress.level).label}
                        </span>
                     </div>
                   ))}
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 mb-10 text-left space-y-4">
                   <p className="text-sm font-bold text-slate-300 flex items-start gap-4">
                     <Target className="text-indigo-400 shrink-0 mt-1" size={18} />
                     <span>
                        <strong>目標:</strong> すべてのスキルを <span className="text-white">Lv.100</span> にすることが最終目標です！<br />
                        日々の課題をクリアして経験値を獲得し、成長を可視化しましょう。
                     </span>
                   </p>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="w-full py-6 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4 italic font-jp"
                >
                  ダッシュボードへ <ArrowRight size={24} />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
