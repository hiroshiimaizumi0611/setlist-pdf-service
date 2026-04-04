# Billing Stitch Alignment Design

## Goal

`/settings/billing` を、現在の単体 billing ページから、Stitch の `Billing / Plan` 画面に近い `settings + subscription` 画面へ再構成する。

## Primary Scope

- 主対象は `/settings/billing`
- 見た目と画面構成の Stitch 寄せを優先する
- 既存の billing logic は変えない
  - current plan 表示
  - upgrade CTA
  - billing portal 導線
  - Stripe 未設定時の safe fallback

## Design Direction

editor / archive / login と同じ dark backstage world の中に、`subscription management` 画面を置く。

- 左に settings sidebar
- 上に薄い top bar
- 本文に current plan hero
- その下に plan comparison
- 下段に payment method と billing history

今の `1ページ完結カード` ではなく、`設定セクションの中の subscription 画面` として見せる。

## Layout

### Settings Sidebar

左の固定 sidebar を追加する。

- `BACKSTAGE PRO` の小さな brand
- settings nav items
  - Account
  - Billing
  - Subscription
  - Security
  - Integrations
- 今回は `Subscription` を active state にする

他項目はナビゲーション見た目を持つだけでもよい。実リンクが未実装なら、active 以外は inert / placeholder でもよい。

### Top Bar

- `Subscription Management` の細い header
- 右側に、将来ユーザーアイコンメニューを置けるスペースを残す
- いまの `LogoutButton` をそのまま露出するより、ここは一時的に小さな icon/action area に寄せる余地を持たせる

## Main Content

### Current Plan Hero

最上段に `Current Plan` block を置く。

- current plan 名を大きく表示
- current badge / plan state を添える
- 右側に primary CTA
- free/pro どちらでも価値が一目で分かるようにする

### Plan Comparison

`UpgradeCard` に閉じている情報の一部を、比較テーブルに分解して見せる。

- feature 列
- free 列
- pro 列
- pro 側は淡い yellow emphasis

比較項目は現仕様の範囲にとどめる。

- 公演作成 / 基本設定
- 曲順編集 / 基本運用
- PDF 出力
- 過去公演複製
- テンプレート保存
- 今後の時短機能追加（先行アクセス）

## Payment Area

### Payment Method

payment method block は Stitch の見せ方に寄せる。

- 現在の linked payment method card
- stripe 未設定なら placeholder state
- billing portal が使える場合は `update payment method` 相当の導線

### Billing History

現状データが無くても、empty state として block を出す。

- 請求履歴はありません
- 将来 invoice list が入る前提の器にする

## Component Strategy

### Keep Logic, Recompose Presentation

既存ロジックは極力再利用する。

- `BillingPageContent` は page composition を持つ
- `UpgradeCard` は必要なら責務を縮小するか、current hero / CTA 部分へ吸収する
- settings sidebar は small dedicated component に切ってよい

### Future User Menu Compatibility

この画面は、あとで `ユーザーアイコン + menu` を top bar に置ける構造にしておく。

- 今回はフル実装しない
- ただし top-right action area を作っておく
- 現在の logout は将来そのメニューへ移しやすいように、独立 action として扱う

## Non-Goals

- 本格的な account settings 実装
- security/integrations の実画面実装
- 請求履歴データのバックエンド実装
- ユーザーアイコンメニューの本実装

## Affected Files

- `app/(app)/settings/billing/page.tsx`
- `components/upgrade-card.tsx`
- new billing/settings sidebar component if needed
- billing page tests

## Testing

- current plan / CTA behavior must stay covered
- billing page render tests should confirm:
  - settings sidebar exists
  - subscription top bar exists
  - current plan hero exists
  - comparison section exists
  - payment method block exists
  - billing history block exists
- Stripe configured / non-configured / unauthenticated states remain safe
