# AIエンジニアマネージャー (AI Manager for Engineers)

エンジニアの「自律的な成長」を支援する、AI駆動型のタスク・ドリブン成長システムです。

## 概要

このアプリは、単なるタスク管理ツールではありません。あなたのスキルをAIが診断し、36ヶ月の長期ロードマップを生成。そのロードマップに基づいた実践的なコーディング課題を毎週提示し、書いたコードをAIマネージャーが査読してフィードバックします。

## 主要機能

### 1. スキルマトリクス診断
- 7つの領域（Frontend, Backend, Infrastructure, System Design, Database, Security, DevProcess）での自己評価とAIからの客観的評価をレーダーチャートで可視化します。

### 2. 36ヶ月成長ロードマップ
- あなたの現在のスキルと目標に基づき、AIが36ヶ月分の習得プランを6ヶ月単位のフェーズで作成します。

### 3. パーソナライズド・ウィークリー課題
- ロードマップと過去のレビュー結果から、あなたの「伸ばすべき弱点」にフォーカスした3つの実践的な課題を毎週生成します。

### 4. AIコードレビュー (GitHub連携)
- 提出したコードをAIが査読します。GitHubのプルリクエストURLを渡すだけで、差分を取得してレビューすることも可能です。
- 設計、命名、エラー処理、テスト、パフォーマンスの5指標でスコアリングされます。

### 5. 月次レビュー & 成長アナリティクス
- 毎月の活動をAIマネージャーが総括し、次の月へのアドバイスを提供します。
- スキルスコアの推移を時系列で分析します。

### 6. データ永続化 (Supabase連携)
- LocalStorageからSupabase (PostgreSQL) への移行機能を備えており、複数のデバイスで成長記録を共有できます。

## 使い方 (ユーザーガイド)

1. **スキル診断を開始**: 
   - 最初のログイン後、`/onboarding` 画面で現在の職種、目標、スキルレベルを入力してください。
2. **課題に取り組む**: 
   - 「週間チャレンジ」画面から「課題を取得」をクリックします。
   - 提示された課題の達成条件を確認し、実装を行います。
3. **レビューを依頼する**:
   - 課題詳細から「レビューを依頼する」画面へ進みます。
   - GitHubのPR URLかコードを直接入力し、AIマネージャーの査読を受けてください。
4. **合格したら進歩**:
   - AIが「Approved（合格）」を出せば、達成条件にチェックが入り、対応するスキルポイントが獲得されます。
5. **マンスリー報告を確認**:
   - 月末に「今月の振り返り」を生成し、自分の成長を実感してください。

## 開発者向けセットアップ

### 環境変数の設定
`.env.local` に以下のキーを設定してください：

```bash
# Gemini API (AIエンジン)
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Supabase (データベース)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# GitHub Token (PR取得用 - Optional)
GITHUB_TOKEN=your_personal_access_token
```

### 起動方法
```bash
npm install
npm run dev
```

## 技術スタック
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **State Management**: Zustand
- **AI**: Google Gemini Pro (via library)
- **Database**: Supabase (PostgreSQL)
- **Components**: Lucide-React, Chart.js
