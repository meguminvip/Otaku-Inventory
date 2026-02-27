# Otaku Inventory

このプロジェクトは、**「この素晴らしい世界に祝福を！」関連グッズ情報を整理し、見やすく提供するための個人運営サイト**です。

## サイト方針

- 目的: このすば関連グッズ情報を整理し、見やすい状態で届ける
- 収益化: **行いません**
- 広告掲載: **行いません**
- 運営者: `h_ypi`（個人運営）

## 運用ポリシー（取得・更新）

- スクレイピングは、管理者が手動でツールを実行したときのみ行います
- 常時自動実行の運用は行いません
- 取得対象サイトは、利用規約・robots.txt・運用ポリシーに基づいて見直します

## 対応状況（2026-02時点）

### 自動取得中

- animate
- KADOKAWA STORE
- きゃらON!

### 自動取得停止 / 対象外

- COSPA: 自動取得停止（必要時のみ手動更新）
- amiami: 対象外
- GOOD SMILE COMPANY: 対象外

## 主な機能

- グッズ一覧表示（ページング、検索、フィルタ）
- 在庫状態表示（販売中 / 在庫切れ / 販売終了 / 予約受付中）
- お気に入り機能
- 日本語 / 英語切り替え
- お知らせ一覧と運用ポリシーページ

## 技術スタック

- Frontend: React + Vite + React Router
- Backend: Fastify + better-sqlite3
- Scraper: Python + Selenium + BeautifulSoup4
- DB: SQLite (`goods.db`)

## ディレクトリ構成

- `frontend/` フロントエンド
- `backend/` API / DB処理
- `scraper/` データ取得ツール
- `scraper/output/goods_data.json` 取得結果JSON
- `goods.db` 本体DB

## セットアップ

### 1) 依存インストール

```bash
npm --prefix frontend install
npm --prefix backend install
```

### 2) 環境変数

`backend/.env` を作成してください（値は環境に合わせて設定）。

主な項目:

- `PORT`
- `HOST`
- `CORS_ORIGINS`
- `IMPORT_API_TOKEN`
- `DISCORD_WEBHOOK_URL`
- `IMPORT_ALLOWLIST`

## 開発起動

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## 本番ビルド

```bash
npm --prefix frontend run build
npm --prefix backend run start
```

## データ更新フロー

1. スクレイパー実行で `scraper/output/goods_data.json` を更新
2. Backend の import で JSON -> SQLite 反映
3. Frontend は API 経由で表示

代表コマンド:

```bash
npm --prefix backend run import
npm --prefix backend run recategorize
```

## セキュリティ・注意事項

- 機密情報（`.env` 等）はGit管理しないでください
- APIには入力制限・レート制限・投稿スパム対策を実装しています
- 外部サイト情報の正確性・継続性は保証されません。購入前に必ず販売元で最終確認してください

## ライセンス

`MIT License`（詳細は `LICENSE`）

## Special Thanks
- Yappapurin - 英語翻訳補助
- A.R.O.N.A - ほぼすべてのコードの作成と雑用
