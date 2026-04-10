# Loading Text Shimmer Design

## Goal

ログイン中や読み込み中の文言に、文字そのものが軽く動いているような shimmer 表現を入れて、`いま処理中` の体感を自然に伝える。

## Product Intent

現在の pending / loading 表示は文言自体は十分だが、

- 反応はあるものの少し静的
- `今まさに処理中` のニュアンスが弱い

場面がある。

今回の変更では、文言の意味は変えずに

- ボタン内 pending text
- loading shell の見出し text

へ共通の文字 shimmer を加え、サービス全体の loading language を揃える。

## UX Summary

- 文言は固定のまま表示する
- テキスト全体の上を、淡いハイライトが左から右へ流れる
- 幅や文字数は変わらない
- `...` を増減させる方式ではない
- 実務ツールとして落ち着いた動きに留める

## Animation Style

採用するのは `text shimmer`。

- 文字本体は通常の可読色
- その上を細い光が流れる
- ハイライト色は黄アクセント寄り
- 速度は遅すぎず速すぎず、待ち時間に対してくどくない程度

避けるもの:

- 文字の点滅
- 文字位置の移動
- 1文字ずつのタイプ風アニメ
- ボタン全体の脈動

## Visual Tone

### Dark UI

- ハイライトは `#f6c453` 系のニュアンス
- 文字全体を白飛びさせず、薄い光沢に留める

### Light UI

- 光は dark より抑えめ
- 紙面感を壊さないよう、過度なグラデーションにはしない

## Shared Component

新しく共通の loading text component を作る。

想定責務:

- 子として受け取った文字列を shimmer 表示する
- animation を text のみに閉じる
- reduced-motion 時は通常テキストへフォールバックする
- inline / block のどちらでも扱いやすい

この component は loading state 自体を持たない。  
あくまで `処理中と決まった文字列の見せ方` のみ担当する。

## API Boundaries

### DashboardShell

`EditorLoadingShell` の `読み込み中...` は `DashboardShell.title` を通って表示され、現在は:

- header 内の `CURRENT SHOW: {title}`
- page section の `<h1>{title}</h1>`

の 2 箇所で再利用されている。

この spec では、`DashboardShell.title` と `DashboardShell.description` を `ReactNode` で受けられるように広げ、loading shell では shimmer text をそのまま渡す前提にする。  
つまり `読み込み中...` が 2 箇所で shimmer するのは意図した挙動とする。

通常ページの title/description は既存どおり string を渡せばよい。

### FormPendingButton

`FormPendingButton` の `pendingLabel` は API を広げない。

- `pendingLabel` は引き続き `string`
- component 内で pending 時だけ `AnimatedLoadingText` を使って包む

これにより call site の churn を最小限に保つ。

## Placement

### Auth

- `ログイン中...`
- `アカウントを作成中...`

### Form Pending Buttons

- `作成中...`
- `複製中...`
- `公演作成中...`

など `FormPendingButton` を通る pending label 全般。

### Billing Upgrade

- `チェックアウトを準備中...`

### PDF Flow

- `PDFプレビューを準備中...`

### Loading Shells

- `読み込み中...`
- `PDFプレビューを準備中...`

## Layout Rules

- shimmer は文字の上だけで完結する
- pending button の横幅を広げない
- loading shell の行高や余白は変えない
- 既存の spinner がある箇所では共存してよい

## Accessibility

- `prefers-reduced-motion` では animation を止める
- animation を止めても文字はそのまま読める
- screen reader 向け文言は変えない
- `role="status"` や `aria-label` など既存の loading semantics は保持する

## Technical Shape

- 新規 component:
  - `components/animated-loading-text.tsx`
- `DashboardShell.title` / `description` は `ReactNode` を受けられるようにする
- `FormPendingButton.pendingLabel` は string のまま維持し、内部で shimmer component を使う
- 必要なら global style または component 内 class で shimmer effect を定義する

## Testing

- pending button が pending 時に shimmer component を使う
- auth submit 中に shimmer text が出る
- loading shell 見出しが shimmer text を使う
- `DashboardShell` 経由の loading title が shimmer で表示される
- `UpgradeCard` の `チェックアウトを準備中...` が shimmer で表示される
- `ExportPdfButton` overlay の `PDFプレビューを準備中...` が shimmer で表示される
- reduced-motion 用の class hook が存在する
- 既存の loading / pending 文言は変わらない

## Non-Goals

- 新しい spinner デザイン
- skeleton layout の全面変更
- ボタンや panel 全体のアニメーション
- loading 文言そのものの再設計
