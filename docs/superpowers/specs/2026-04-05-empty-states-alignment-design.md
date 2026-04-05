# Empty States Alignment Design

## Goal

実アプリ側に散っている empty state と loading state を、Stitch の `Empty States` 画面で見えていた補助状態の雰囲気に寄せて統一する。

対象は専用 showcase ページではなく、日常的に出る実画面上の状態そのものにする。

## Primary Scope

- `/events`
  - アーカイブに公演がまだない
  - 検索結果に一致する公演がない
- `/templates`
  - テンプレート保存元になる公演がない
  - 保存済みテンプレートがない
- `/settings/billing`
  - 支払い方法がまだない
  - 請求履歴がまだない
- loading shells
  - `EditorLoadingShell`
  - `TemplatesLoadingShell`
  - `PdfPreviewLoadingShell`

## Problem

現状の補助状態は機能上は成立しているが、画面ごとに以下の差がある。

- 単なるテキストだけで終わる箇所がある
- `次に何をすればいいか` が弱い
- empty と loading の visual language が揃っていない
- editor / archive / billing / templates の Stitch 寄せに比べると、補助状態だけ密度と質感が一段弱い

## Design Direction

`status panel` として整理する。

- 小さな mono ラベル
- 明確な見出し
- 補足文
- 1〜2個の次アクション

これを dark backstage tone で統一する。

空状態でも「止まっている」感じではなく、「次の一手が見えている」状態にする。

## Archive Empty States

### No Saved Events

`/events` に公演が 0 件のときは、単なる文言ではなく archive 本文内の status panel を表示する。

含めるもの:

- status label
- 見出し
  - まだ保存済みの公演がない
- 補足
  - 最初の公演を作ると、ここから編集・複製・PDF確認へつながる
- 主 action
  - `新規公演作成`

### No Search Results

filter/search が有効で 0 件のときは、`空の archive` と明確に別扱いにする。

含めるもの:

- status label
- 見出し
  - 条件に一致する公演がない
- 補足
  - 検索語や会場・テーマ・日付範囲を見直すと見つかる可能性がある
- 主 action
  - `フィルタをリセット`

## Templates Empty States

### No Source Events

上段の `既存公演から保存` に対象公演がないときは、`まず公演を作る` 導線が伝わる panel にする。

含めるもの:

- status label
- 見出し
  - まだ保存対象の公演がない
- 補足
  - 公演を作成すると、この画面からテンプレートへ保存できる
- 主 action
  - `アーカイブへ移動`

### No Templates

下段の保存済みテンプレートが空のときは、使い回しの価値が伝わる panel にする。

含めるもの:

- status label
- 見出し
  - まだ保存済みテンプレートがない
- 補足
  - 一度公演を保存すると、次回以降の公演立ち上げが速くなる
- 必要なら secondary action
  - `保存元の公演を確認`

広告っぽい upsell は避け、作業導線として自然に見せる。

## Billing Empty States

### No Payment Method

payment method セクションでは、`未登録` を placeholder ではなく settings の正式な状態として見せる。

含めるもの:

- status label
- 見出し
  - 支払い方法はまだ登録されていない
- 補足
  - 無料プランのまま公演作成とPDF出力は使える
  - Pro を有効化するときに支払い方法を追加する

### No Billing History

請求履歴が空のときも、空テーブルではなく compact panel にする。

含めるもの:

- status label
- 見出し
  - 請求履歴はまだない
- 補足
  - 初回の支払い完了後にここへ表示される

## Loading States

### Shared Principles

- empty state と同じ tone を使う
- ただし skeleton は過剰に派手にしない
- `何を読み込んでいるか` が見出しでわかるようにする

### Editor Loading

現在の skeleton を維持しつつ、上部と本文に `production workspace loading` のまとまりを出す。

- section 間のリズムを整理
- side rail / metadata strip / setlist rows の骨格を揃える
- header action skeleton も現行より少し compact にする

### Templates Loading

`/templates` の 2 段構成に対応した loading にする。

- 上段: source events strip/list
- 下段: saved templates row collection

今の単純な rows より、ページ構造が読み取りやすい見せ方にする。

### PDF Preview Loading

全画面 overlay は維持する。

- 見出し
- 補足
- 紙面 preview を連想できる skeleton

を保ちつつ、editor / templates の loading と同じ family に寄せる。

## Visual Notes

- dark theme を基準
- surface は `panelMuted` / `panel` をベースにする
- 見出しは mono + black weight
- 補足文は muted
- action は最大 1〜2 個
- dashed border, thin separators, yellow accent を部分的に使う

## Component Architecture

必要なら small reusable component を追加してよい。

候補:

- `StatusPanel`
- `StatusActionRow`
- `EmptyStateCard`

ただし抽象化しすぎず、まずは archive/templates/billing/loading を揃えるための最小単位に留める。

## Non-Goals

- showcase 専用ページの作成
- 新しい機能追加
- billing の実ロジック変更
- auth フロー変更
- light theme の作り込み

## Affected Files

- `components/performance-archive-page-content.tsx`
- `components/template-list.tsx`
- `app/(app)/templates/page.tsx`
- `components/billing-payment-section.tsx`
- `components/loading-shells.tsx`
- 必要なら new shared status component
- 関連 component tests

## Testing

- archive:
  - no events
  - no filtered results
- templates:
  - no source events
  - no saved templates
- billing:
  - no payment method
  - no billing history
- loading shells:
  - headings and status copy still render
  - page structure remains recognizable
