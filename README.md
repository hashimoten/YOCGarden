# Dividend Garden (YOCGarden)

高配当株投資のポートフォリオを「箱庭」として可視化するアプリケーションです。
取得単価に対する配当利回り（Yield On Cost: YOC）を木の大きさや成長度合いとして表現し、視覚的に資産の成長を楽しむことができます。

## ✨ 主な機能

1.  **箱庭ビュー (Garden View)**
    *   保有銘柄をアイソメトリックな3D風の「木」として表示します。
    *   **YOC（取得単価利回り）** に応じて木が成長します（若木 → 大木 → 伝説の木）。
    *   雪のエフェクトやグラスモーフィズムデザインによるリッチなUI。

2.  **実データ連携**
    *   Pythonバックエンド経由で `yfinance` を使用し、リアルタイムの株価と配当情報を取得します。
    *   最新の配当予想に基づいた年間配当額を自動計算します。

3.  **データ永続化 (Supabase)**
    *   ポートフォリオデータはクラウドデータベース (Supabase) に保存されます。
    *   デバイス間でのデータ同期が可能です（現在は認証機能なしの簡易実装）。

4.  **銘柄追加・管理**
    *   銘柄コードまたは名称からの自動補完検索機能。
    *   保有数や平均取得単価を入力するだけで、YOCを自動計算して庭に追加されます。

5.  **配当履歴確認**
    *   各銘柄の直近の配当履歴（増配・減配など）を確認できます。
    *   ポートフォリオ全体のYOCと目標利回り（Target 5.0%）の達成度をメーターで表示。

## 🛠 技術スタック

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React

### Backend
*   **Language**: Python 3
*   **Framework**: Flask
*   **Libraries**: yfinance (株価取得), flask-cors

### Database
*   **Platform**: Supabase (PostgreSQL)

## 🚀 セットアップと起動方法

### 前提条件
*   Node.js (v18以上推奨)
*   Python (3.8以上推奨)
*   Supabase アカウントとプロジェクト

### 1. 環境変数の設定
プロジェクトルートに `.env` ファイルを作成し、Supabaseの接続情報を記述します。

```bash
cp .env.example .env
```

`.env` の内容:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. データベースの準備
SupabaseのSQLエディタで、以下のスキーマを実行してテーブルを作成してください。
スキーマファイル: [`schema.sql`](./schema.sql) に記載されています。

### 3. バックエンドのセットアップと起動
バックエンドディレクトリ（またはルートでPython環境に応じて）で依存ライブラリをインストールし、サーバーを起動します。

```bash
# 依存関係のインストール
pip install -r backend/requirements.txt

# サーバーの起動
cd backend
python app.py
```
※ バックエンドは `http://localhost:5000` で起動します。

### 4. フロントエンドのセットアップと起動
新しいターミナルを開き、フロントエンドを起動します。

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```
ブラウザで `http://localhost:5173` にアクセスしてください。

## 📁 プロジェクト構造

```
YOCGarden/
├── backend/            # Python Flask バックエンド
│   └── app.py          # APIサーバーのエントリーポイント
├── src/
│   ├── components/     # Reactコンポーネント
│   │   ├── add/        # 銘柄追加フォーム
│   │   ├── garden/     # 箱庭・詳細ビュー
│   │   ├── history/    # 履歴画面（予定）
│   │   ├── layout/     # レイアウト共通パーツ
│   │   └── ui/         # 汎用UIパーツ
│   ├── data/           # モックデータ・静的データ
│   ├── lib/            # Supabaseクライアント設定
│   └── types.ts        # TypeScript型定義
├── .env                # 環境変数（Git対象外）
├── schema.sql          # DBスキーマ定義
└── README.md           # 本ファイル
```
