# PDF Preset Preview Gating Design

## Goal

Free ユーザーでも Pro 向け `PDF出力プリセット` の見た目を preview で体験できるようにしつつ、実際の PDF 出力は Pro 限定に保つ。

## Product Intent

現在の `preview も download も同時に制限` だと、Pro プリセットの価値が伝わりにくい。  
この変更では、

- Free でも Pro プリセットの preview は試せる
- ただしその preset での出力はできない
- 出力直前に upgrade 理由が自然に伝わる

という体験に変える。

## UX Summary

### Free User

- `large-type`
- `compact`
- `venue-copy`

の preview は選択できる。

preview 画面では:

- iframe preview がその preset で更新される
- theme 切替や reload 後もその preset query を保つ
- selected preset は active 表示のまま維持する

ただし `PDF出力` を押した時は直接 download せず、確認モーダルを開く。

### Pro User

- preview
- actual download

の両方で全 preset をそのまま使える。現在の自然な flow を維持する。

## Download Gate

Free ユーザーが Pro preset preview 中に `PDF出力` を押した場合、モーダルを表示する。

モーダル内容:

- title:
  - `このプリセットで出力するにはProが必要です`
- body:
  - `プレビューでは確認できますが、このプリセットでのPDF出力はPro限定です`
- actions:
  - `標準プリセットで出力`
  - `Proにアップグレード`
  - `キャンセル`

## Fallback Behavior

`標準プリセットで出力` を押した場合:

- 現在 theme に対応する無料標準 preset に fallback して出力する
- dark なら `standard-dark`
- light なら `standard-light`

重要なのは、preview の選択状態は勝手に失わないこと。

つまり:

- preview state は Pro preset のまま維持
- actual download だけ free-compatible preset へ fallback

にする。

## State Model

状態は 3 つに分ける。

- `requestedPresetId`
  - preview route query 上でユーザーが見たい preset
- `previewPresetId`
  - iframe preview / document route が使う preset
- `downloadPresetId`
  - 実際の download に使う preset

この変更後の方針:

### Free + Pro preset requested

- `requestedPresetId`
  - Pro preset のまま
- `previewPresetId`
  - Pro preset
- `downloadPresetId`
  - 対応する free standard preset

### Pro user

- `requestedPresetId = previewPresetId = downloadPresetId`

## Rendering Model

preview iframe と actual PDF download は、引き続きそれぞれ単一の preset を受け取って描画する。  
ただし `free + pro preset requested` の時だけ、

- preview route/document route は requested preset
- download route は gated fallback preset

を使う。

これは「同じ action で違う preset が silently 出る」ことを避けるため、必ずモーダルを挟む。

## URL Behavior

preview URL は常に requested preset を保持する。

例:

- `/events/:id/pdf?theme=dark&preset=large-type`

Free でもこの URL を保ってよい。  
ただし `download` は必ず button click で modal を開いて分岐する。  
この spec では、`fallback URL へ直接飛ばす` 方式は採用しない。

## UI Behavior

`PdfPresetSelector`

- Free ユーザーでも Pro preset card を通常 selectable にする
- `Pro` badge は維持する
- 現在の `fallback preview + blocked banner` は廃止する
- blocked ではなく `preview available / export requires Pro` の表現へ変える

`PdfPreviewPage`

- Free + Pro preset active の場合、上部か selector 近辺に小さな notice を出してよい
- ただし主導線は `PDF出力` 押下時の modal に置く
- 現在の `Freeでは現在の standard preset を維持したまま...` という upgrade banner は置き換える
- active 表示は requested preset に対して行い、free でも Pro preset が active のまま見える

## Access Control

サーバー側の gate は維持する。

- preview route / document route
  - Free でも Pro preset preview 可
- download route
  - Free は Pro preset download 不可
  - fallback を返すか、もしくは modal 経由で free preset download に誘導する

API を直接叩いても Pro 出力を bypass できないことは維持する。

サーバー側は、modal を経ずに Pro preset download を直接許可しない。  
`標準プリセットで出力` は、あくまで UI 上の modal 分岐として扱う。

## Testing

- free user can preview pro presets
- free user sees pro preset remain active after reload/theme switch
- free user pressing export on pro preset gets the modal
- free user can choose `標準プリセットで出力`
- free user can choose `Proにアップグレード`
- pro user still previews and downloads every preset directly
- direct route access still cannot bypass Pro-only download restrictions

## Non-Goals

- Free ユーザーへの透かし付き Pro 出力
- preview 中の強制 watermark
- user-custom preset editing
- pricing / plan taxonomy の変更
