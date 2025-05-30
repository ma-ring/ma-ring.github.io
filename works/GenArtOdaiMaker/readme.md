# Generative Art Prompt Generator

このウェブアプリケーションは、ジェネラティブアートを作成するためのプロンプト（お題）を生成するツールです。

## 機能

- **5色のカラーパレット生成**: 色彩理論に基づいた調和の取れた5色のパレットを自動生成します
- **テーマワード生成**: 3つのカテゴリ（概念、形容詞、技法）からランダムに選ばれた3つのテーマワードを提供します
- **作成時間設定**: 作品の制作にかける時間を指定できます
- **プロンプトのコピー**: 生成されたプロンプトをクリップボードにコピーできます

## 使い方

1. ウェブブラウザで `index.html` を開きます
2. 「新しいパレット」ボタンをクリックして、カラーパレットを生成します
3. 「新しいワード」ボタンをクリックして、テーマワードを生成します
4. 作成時間を時間と分で設定します
5. 「すべて生成」ボタンをクリックすると、すべての要素を一度に生成できます
6. 「プロンプトをコピー」ボタンをクリックして、生成されたプロンプトをコピーします

## 技術的詳細

- 純粋な HTML, CSS, JavaScript で構築されています
- 外部ライブラリやフレームワークを使用していないため、インターネット接続なしでも動作します
- レスポンシブデザインにより、モバイルデバイスでも使用可能です

## カラーパレット生成について

このアプリケーションは色彩理論に基づいて調和の取れたカラーパレットを生成します：

- ベースカラー（ランダム）
- 補色（色相環の反対側）
- 類似色（色相環の隣接）
- 三角配色（色相環の120度）
- 明度バリエーション

## テーマワード

テーマワードは以下の3つのカテゴリから選ばれます：

1. 概念（自然、都市、宇宙など）
2. 形容詞（明るい、鮮やかな、幾何学的なな）
3. 技法（ピクセルアート、水彩画、フラクタルアートなど）

## ライセンス

MIT