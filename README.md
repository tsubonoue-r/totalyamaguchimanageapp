# Yamaguchi Project Manager

膜構造プロジェクト管理システム - 営業から施工までの一元管理

## 概要

山口県の膜構造（テント・シート構造物）企業向けのプロジェクト管理アプリケーションです。営業・設計・製造・施工の各フェーズを統合管理し、業務効率化を実現します。

### 主な機能

- **営業管理**: 顧客情報、見積作成、商談進捗管理
- **設計管理**: 図面管理、バージョン管理、承認ワークフロー
- **製造管理**: 製造工程管理、材料管理、進捗追跡
- **施工管理**: 施工スケジュール、作業管理、検査記録

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript 5 |
| UI | React 18, Tailwind CSS 3.4 |
| バックエンド | Firebase |
| フォーム | React Hook Form + Zod |
| アイコン | Lucide React |
| 日付処理 | date-fns |

## インストール

### 必要条件

- Node.js 18.x 以上
- npm 9.x 以上
- Firebase プロジェクト

### セットアップ手順

```bash
# リポジトリのクローン
git clone https://github.com/tsubonoue-r/totalyamaguchimanageapp.git
cd totalyamaguchimanageapp

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local を編集して Firebase の設定を追加

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら http://localhost:3000 にアクセスしてください。

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# Lint チェック
npm run lint
```

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # ダッシュボード
│   ├── sales/              # 営業管理
│   ├── design/             # 設計管理
│   ├── manufacturing/      # 製造管理
│   ├── construction/       # 施工管理
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # ホーム（リダイレクト）
├── components/             # 共通コンポーネント
│   ├── Header.tsx          # ヘッダー
│   └── Sidebar.tsx         # サイドバー
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ
│   ├── firebase.ts         # Firebase 設定
│   └── utils.ts            # 共通関数
└── types/                  # 型定義
    └── index.ts            # 全型定義
```

## データモデル

主要なエンティティ:

- **Project**: 案件情報（ステータス、フェーズ、金額、日程）
- **Customer**: 顧客情報
- **Estimate**: 見積書（明細、バージョン管理）
- **Drawing**: 図面（承認ワークフロー付き）
- **ProductionProcess**: 製造工程
- **Material**: 材料管理
- **ConstructionSchedule**: 施工スケジュール
- **Inspection**: 検査記録

詳細は [docs/API.md](./docs/API.md) を参照してください。

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照してください。

---

Autonomous development powered by [Miyabi](https://github.com/miyabi-dev/miyabi) - Agentic OS
