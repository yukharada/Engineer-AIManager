"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Target, Zap, Rocket, CheckCircle2, ChevronRight, Info, AlertTriangle } from "lucide-react";
import { createInitialSkillProgress } from "@/lib/types";
import { getCurrentDateISO } from "@/lib/dateUtils";

// Level definitions for tooltips
const LEVEL_DEFINITIONS: Record<string, Record<number, string>> = {
  frontend: {
    1: 'HTML/CSSの基礎。静的なページが作れる',
    2: 'CSS設計（BEM等）。レスポンス対応',
    3: 'JavaScript基礎。簡単なDOM操作',
    4: 'JSイベント処理。APIからのデータ取得',
    5: 'React/Vue等のフレームワーク経験',
    6: 'SPA開発可能。状態管理の基礎',
    7: 'Redux/Zustand等を用いた複雑な状態管理',
    8: 'パフォーマンス最適化。レンダリング改善',
    9: 'モダンアーキテクチャ設計。Next.js/Nuxt',
    10: 'フロントエンドエキスパート。技術選定'
  },
  backend: {
    1: '基本的なAPI概念。簡単なCRUD操作',
    2: 'DB設計基礎。ER図が書ける',
    3: 'REST API設計。基本的なDB連携',
    4: 'ミドルウェア。バリデーション設計',
    5: '認証・認可（JWT/OAuth）。セキュリティ基礎',
    6: 'パフォーマンス改善。クエリ最適化',
    7: 'マイクロサービス。メッセージキュー',
    8: 'スケーラビリティ設計。分散システム基礎',
    9: '高可用性アーキテクチャ。ドメイン駆動設計',
    10: 'バックエンドエキスパート。言語仕様'
  },
  infrastructure: {
    1: '基本的なサーバー概念。SSH接続',
    2: 'Linux基礎コマンド。ファイル操作',
    3: 'Docker基礎。コンテナ化の経験',
    4: 'Webサーバー設定。Nginx/Apache',
    5: 'CI/CDパイプライン。GitHub Actions',
    6: 'Kubernetes基礎。オーケストレーション',
    7: 'クラウド設計（AWS/GCP）。VPC/IAM',
    8: 'IaC（Terraform/CDK）の実踐的経験',
    9: 'SRE。モニタリング・オートスケーリング',
    10: 'インフラエキスパート。マルチクラウド'
  },
  database: {
    1: 'SQL基礎。SELECT/INSERT/UPDATE',
    2: 'テーブル結合（JOIN）。基本的な抽出',
    3: 'サブクエリ。複雑な検索条件',
    4: 'インデックス。実行計画の確認',
    5: 'パフォーマンスチューニング。正規化設計',
    6: 'トランザクション制御。ACID特性理解',
    7: 'レプリケーション。負荷分散設計',
    8: 'シャーディング。分散データベース運用',
    9: 'NoSQL。用途に応じたデータ選定',
    10: 'DBエキスパート。内部構造・最適化'
  },
  systemDesign: {
    1: '基本的なアーキテクチャパターン。3層構造',
    2: 'クラス設計。SOLID原則の基礎',
    3: 'デザインパターン適用。再利用性意識',
    4: 'モジュール分割。インターフェース設計',
    5: 'マイクロサービス設計。API境界確定',
    6: '分散トランザクション。Sagaパターン',
    7: 'スケーラブルシステム。CAP定理把握',
    8: 'トレードオフ理解。アーキテクチャ比較',
    9: '大規模分散システム。耐障害性設計',
    10: 'システム設計エキスパート。全層技術'
  },
  devProcess: {
    1: 'Git基礎。コミット、プッシュ、ブランチ',
    2: 'プルリクエスト。コンフリクト解消',
    3: 'コードレビュー。品質維持の文化',
    4: 'タスク管理。Scrum/Kanbanの理解',
    5: 'CI/CD自動化。自動テストの導入',
    6: 'DevOps。リリースパイプライン構築',
    7: 'チームプロセス最適化。生産性計測',
    8: 'エンジニア育成。ナレッジ共有文化',
    9: '技術戦略立案。組織課題の技術解決',
    10: 'CTO級。エンジニアリング組織文化'
  },
  security: {
    1: '基本的な脆弱性理解。XSS/SQLi',
    2: 'HTTPS。SSL/TLS証明書の概念',
    3: '認証基礎。パスワードハッシュ化',
    4: 'セキュアコーディング。OWASP Top 10',
    5: 'OAuth/OpenID Connect。ID基盤構築',
    6: '脆弱性診断。静的解析ツールの活用',
    7: 'ペネトレーションテスト。攻撃検知',
    8: 'セキュリティマネジメント。ISMS/PCI',
    9: 'セキュアアーキテクチャ。零トラスト',
    10: 'セキュリティスペシャリスト。インシデント'
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

  const generateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const skills: any = {};
      for (const cat in selectedLevels) {
        skills[cat] = createInitialSkillProgress(selectedLevels[cat] * 10);
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
        setApiStatus(false, null, true);
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
        setApiStatus(false, null, true);
      }

      await saveRoadmap(roadmapData);
      router.push("/");
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
            {step === 1 ? "Profile / 基本プロファイル" : step === 2 ? "Analytic / 自己診断" : "Intelligence / 成長戦略の構築"}
          </h1>
          <div className="flex gap-2 mt-3">
            {[1, 2, 3].map(s => (
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
            <div className="space-y-2">
              <p className="text-slate-200 text-lg font-bold font-jp">現在のレベルを1〜10で選択してください。</p>
              <p className="text-slate-500 text-sm font-bold font-jp italic">ボタンにホバー/タップすると各レベルの定義が表示されます。</p>
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
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                        style={{ width: `${selectedLevels[cat] * 10}%` }}
                      />
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
                onClick={() => setStep(3)}
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
              <button
                id="generate-roadmap-button"
                onClick={generateRoadmap}
                disabled={isGenerating || apiStatus.isQuotaExceeded}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 italic disabled:opacity-50 disabled:bg-slate-800 disabled:shadow-none font-jp"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={28} />
                    AIが戦略を立案中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={28} />
                    ロードマップを作成して開始
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-600 font-bold text-center italic tracking-widest">
                Generating unique nodes for {profile.role}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
