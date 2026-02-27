# Otaku Inventory

「この素晴らしい世界に祝福を！」関連グッズを整理して表示する個人運営プロジェクトです。

## 概要

- 収益化なし / 広告なし
- 運営者: `h_ypi`
- 対応言語: 日本語 / 英語

## 取得運用

- 更新頻度: 不定期（管理者の手動実行時のみ）
- 常時自動実行はしません
- User-Agent: `... megumin.vip/1.0 (+https://megumin.vip)`
- 取得対象は利用規約・robots.txt などを確認して見直します

### 現在の対応状況

- 自動取得中: animate / KADOKAWA STORE / きゃらON!
- 自動取得停止: COSPA（必要時のみ手動更新）
- 対象外: amiami / GOOD SMILE COMPANY

## 主な機能

- 一覧表示（検索 / フィルタ / ページング）
- 在庫状態表示（available / sold_out / ended / preorder）
- お気に入り
- お知らせ・運用ポリシー表示

## 技術スタック

- Frontend: React + Vite + React Router
- Backend: Fastify + better-sqlite3
- DB: SQLite (`goods.db`)

## ディレクトリ

- `frontend/` フロントエンド
- `backend/` API / DB

## セットアップ

```bash
npm --prefix frontend install
npm --prefix backend install
```

`backend/.env` を作成し、必要値を設定してください。

主な環境変数:

- `PORT`
- `HOST`
- `CORS_ORIGINS`
- `IMPORT_API_TOKEN`
- `DISCORD_WEBHOOK_URL`
- `IMPORT_ALLOWLIST`
- `TRUST_PROXY`

## 開発起動

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

代表コマンド:

```bash
npm --prefix backend run import
npm --prefix backend run recategorize
```

## 注意

- `.env` や認証情報は Git に含めないでください
- 価格・在庫は必ず販売元ページで最終確認してください

## License

MIT（`LICENSE`）

## Special Thanks

- Yappapurin - 英語翻訳補助
- A.R.O.N.A - ほぼすべてのコードの作成と雑用
