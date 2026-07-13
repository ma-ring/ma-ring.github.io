# MAHOO LAB Portfolio

静的なポートフォリオサイトです。`Works` に加えて、`Collaborative Prototypes`、`Creative Coding` と `Illustration` を JSON から表示します。

## Structure

- `index.html` / `css/style.css` / `js/script.js`: トップページ本体
- `data/openprocessing.json`: OpenProcessing 作品一覧
- `data/illustrations.json`: Instagram イラスト一覧
- `assets/illustrations/`: Instagram 用サムネイル画像
- `scripts/update-openprocessing.js`: OpenProcessing 更新スクリプト
- `.github/workflows/update-openprocessing.yml`: 定期更新ワークフロー
- `data/protopedia.json`: ProtoPedia 作品一覧
- `scripts/update-protopedia.mjs`: ProtoPedia 更新スクリプト
- `.github/workflows/update-protopedia.yml`: ProtoPedia 定期更新ワークフロー
- `tools/illustration-json-helper.html`: Illustration JSON 作成補助ページ

## Instagram作品の追加方法

1. サムネイル画像を `assets/illustrations/` に追加します。
2. `data/illustrations.json` の先頭に1件追加します。
3. commit / push します。

例:

```json
{
  "title": "うな重の布団",
  "url": "https://www.instagram.com/p/投稿ID/",
  "thumbnail": "./assets/illustrations/unaju-bed.jpg",
  "date": "2026-07-13"
}
```

`title` と `date` は省略できます。最低限 `url` と `thumbnail` があれば表示されます。

JSON ひな形を作るだけなら `tools/illustration-json-helper.html` をブラウザで開くと便利です。

## OpenProcessing更新方法

通常は GitHub Actions の `Update OpenProcessing Works` が 1 日 1 回実行されます。手動更新したい場合も同じワークフローを実行してください。

プロフィール URL の設定場所:

- フロントエンド: [js/script.js](/E:/workspace/ma-ring.github.io/js/script.js)
- Actions: [.github/workflows/update-openprocessing.yml](/E:/workspace/ma-ring.github.io/.github/workflows/update-openprocessing.yml)
- 更新スクリプト: [scripts/update-openprocessing.js](/E:/workspace/ma-ring.github.io/scripts/update-openprocessing.js)

`OPENPROCESSING_PROFILE_URL` を変更すると、別アカウントにも対応できます。

## ProtoPedia更新

通常は GitHub Actions の `Update ProtoPedia Works` が 1 日 1 回実行されます。手動更新したい場合は同じワークフローを実行してください。

API トークンは GitHub Secrets の `PROTOPEDIA_API_V2_TOKEN` に登録してください。

## Notes

- フロントエンドは各 JSON の先頭 5 件だけ表示します。
- JSON が空、または取得に失敗した場合は対象セクションを自動で非表示にします。
- `scripts/update-openprocessing.js` は取得結果が 5 件未満だった場合、既存の `data/openprocessing.json` を上書きしません。
- `data/illustrations.json` の初期データはサンプルです。実際の投稿 URL と画像に置き換えてください。
