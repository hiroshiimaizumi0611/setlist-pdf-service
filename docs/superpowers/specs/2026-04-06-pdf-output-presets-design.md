# PDF Output Presets Design

## Goal

PDF の `見た目テーマ` と `実用プリセット` をまとめて `PDF出力プリセット` として扱い、無料版でも本番利用可能な標準出力は維持しつつ、Pro で現場用途に応じた追加選択肢を提供する。

## Product Intent

この機能は単なるスキン追加ではなく、`現場での使い分け` を価値にする。

- 無料でも標準 PDF は十分に本番利用できる
- Pro では `読みやすさ` `収まり方` `共有用途` の違いに応じた出力を選べる
- 「色が違うだけ」ではなく、「この現場ならこれを選ぶ理由」があることを重視する

## Preset Model

`theme` とは別に、`output preset` を追加する。

- `theme`
  - light / dark のベース色調
- `output preset`
  - 文字サイズ
  - 行密度
  - 情報の強調バランス
  - 余白感
  - 用途ごとのレイアウト調整

つまり最終的な PDF は、

- base theme
- output preset

の 2 軸で決まる。

## Initial Presets

### Free

- `standard-light`
  - 標準ライト
- `standard-dark`
  - 標準ダーク

無料版ではこの 2 つを本番利用可能なまま残す。

### Pro

- `large-type`
  - 曲数が少なめのときに、文字を大きくして足元でも読みやすくする
- `compact`
  - 曲数が多めでも、読みやすさを保ちながら 1〜複数ページに自然に収める
- `venue-copy`
  - 会場共有や貼り出し向けで、整理感と視認性を少し高める

## UX Placement

プリセット選択は `編集画面` ではなく `PDF preview` 画面に置く。

理由:

- 編集画面では `曲順を作る` ことが主目的
- PDF の見た目選択は出力文脈で行う方が理解しやすい
- preview と同じ場所なら差分確認もしやすい

## Preview Experience

`/events/[eventId]/pdf` にプリセット選択 UI を置く。

表示方針:

- 現在の preview workspace 内で選べる
- 各 preset はカードや segmented control ではなく、`用途がわかる compact preset selector` にする
- 少なくとも以下を表示する
  - preset 名
  - short description
  - free / pro
  - current selection

## Access Model

### Free User

- free presets は選択可
- pro presets は一覧上に見せる
- ただし選択しようとすると upgrade 導線を出す
- 完全に隠さず、価値が伝わる状態にする

### Pro User

- 全 presets を選択可
- selection 後は preview が即時反映される
- download もその preset で行われる

## Upgrade Positioning

upgrade copy は `デザイン違い` ではなく `出力用途の違い` を伝える。

例:

- `Large Type で足元でも読みやすく`
- `Compact で曲数が多い公演にも対応`
- `Venue Copy で共有しやすい紙面に`

## Rendering Model

新しい preset は HTML-source PDF の現在構成に乗せる。

つまり:

- preview
- actual download

は必ず同一 preset を使って描画する。

preview と download の乖離は作らない。

## Layout Behavior

既存の density-aware ロジックは維持しつつ、preset ごとに基準値を変える。

イメージ:

- `standard-*`
  - 現在の標準
- `large-type`
  - relaxed 側に寄せる
- `compact`
  - compact 側に寄せる
- `venue-copy`
  - standard をベースに、見出しや余白の整理感を変える

## Data / Domain Direction

初期実装では、preset 定義は codebase 内の定数として持つ。

最低限必要な情報:

- id
- label
- description
- requiredPlan
- baseTheme compatibility
- density tuning values

DB 保存が必要かは後で判断するが、最初は query param または preview state で十分。

## Non-Goals

- ユーザー独自テーマ作成
- 任意の色カスタマイズ
- 1px 単位の詳細レイアウト編集
- 共有テンプレートマーケット
- プリセットごとの別 PDF エンジン

## Affected Areas

- `PDF preview` route / page
- PDF document rendering
- density preset logic
- plan / upgrade copy
- tests for preview/download parity and plan gating

## Testing

- free user can use `standard-light` / `standard-dark`
- free user sees pro presets but cannot activate them
- pro user can activate all presets
- preview updates per preset
- download uses the same selected preset
- preset-specific rendering differences are covered by focused tests
