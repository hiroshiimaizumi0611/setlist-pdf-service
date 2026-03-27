# Stitch PDF Redesign Design

**Date:** 2026-03-27

## Goal

セットリストPDFの体験を、現在の「編集画面から直接ダウンロード」中心の導線から、Stitch の PDF Preview 画面を基準にした `プレビュー確認 -> ダウンロード` フローへ置き換える。  
あわせて、実際にダウンロードされる PDF 自体も Stitch の PDF プレビューをほぼそのまま基準に再設計し、ライト/ダーク両テーマで現場可読性の高い紙面へ寄せる。

## Scope

今回の対象は以下に限定する。

- `PDF出力` 導線を preview page 遷移型に変更する
- Stitch 準拠の PDF preview page を追加する
- 実PDFレンダラを Stitch preview の紙面構造へ寄せる
- 右パネルでは `テーマ切替` と `レイアウト警告` のみ実動にする
- ダウンロードされる PDF と preview page の見た目が同じ設計言語になるよう、共通のレイアウトモデルを使う

今回の対象外:

- B5 やモバイル向けなどの用紙サイズ切替
- PDF への注釈、透かし、複数バリエーションの高度な設定
- PDF preview page の右パネルにあるその他の inspector 機能
- セットリスト編集画面そのものの追加改修

## User Flow

### 1. 編集画面からの遷移

編集画面の `PDF出力` ボタンは直接 `/api/events/[eventId]/pdf` を開かず、`/events/[eventId]/pdf` の preview page に遷移する。

### 2. Preview page

preview page は 2 カラム構成にする。

- 左: 紙面プレビュー
- 右: inspector panel

左カラムは Stitch の PDF Preview を基準にした「紙面シミュレーション」を表示する。  
右カラムは次の 2 機能だけを実動させる。

- PDFテーマ切替
- レイアウト警告表示

### 3. Download

preview page 上の `ダウンロード` アクションから `/api/events/[eventId]/pdf?theme=...` を呼び出し、現在の preview と同じテーマで PDF を取得する。

## Architecture

### Shared PDF presentation model

preview page と実PDFの見た目が乖離しないよう、両者は同じ layout/model を使う。

構成は次の 3 層に分ける。

1. `layout builder`
イベント情報とセットリスト項目から、ページ構成、各行の種別、タイトル、番号、警告候補を計算する

2. `preview presenter`
layout builder の結果を受け取り、React/Tailwind で Stitch 風 preview を描画する

3. `pdf renderer`
同じ layout builder の結果を受け取り、pdf-lib で実際の PDF バイト列を描画する

これにより、preview 側だけ見た目が更新されて PDF 側が古いまま残る状態を避ける。

## Route Design

### New app route

新規 route を追加する。

- `app/(app)/events/[eventId]/pdf/page.tsx`

責務:

- 認証済みユーザーの event を取得する
- query からテーマを解決する
- shared layout/model を生成する
- preview page を描画する

### Existing API route

既存 route は継続利用する。

- `app/api/events/[eventId]/pdf/route.ts`

責務:

- 認証と所有権確認
- query からテーマを解決
- shared layout/model ベースの renderer を呼ぶ
- attachment レスポンスを返す

## PDF Visual Design

### Light theme

Stitch light preview を基準に、白紙ベースの紙面にする。

- 白背景
- 上部に強いタイトル帯
- 曲番号は左に大きく表示
- 曲名は大きく、太く、余白を広めに取る
- `MC` は `[ MC ]`
- `転換` は中央寄せの区切り行
- `見出し` は `EN` などのセクションブレイク行として強調
- footer は `更新日時 / ページ番号` を中心に簡潔化する

### Dark theme

Stitch dark preview を基準に、黒地 + 黄系アクセントの backstage 感を再現する。

- 黒背景
- タイトル帯と罫線は黄系アクセント
- 曲番号も黄系で強調
- ライトと同じ構造だが、コントラスト重視で視認性を保つ
- 装飾は抑え、読みやすさ優先

### Removed decorative copy

Stitch preview 内の演出要素のうち、実運用上の意味が薄いものは PDF には入れない。

- `CONFIDENTIAL / INTERNAL USE`
- MD5 のようなダミー技術情報
- 実データと関係のない system copy

代わりに残すのは以下だけにする。

- 公演名
- 必要最小限のサブ情報
- 更新日時
- ページ番号

## Preview Page Design

preview page 自体も Stitch を基準にする。

### Left canvas

- 紙面プレビューを中央寄せ
- preview は PDF と同じ行構造を React で表現
- ライト/ダーク切替時に紙面の見た目が即時更新される

### Right inspector

実動するのは次の 2 つのみ。

1. `PDFテーマ切替`
- light / dark の切替
- preview と download URL の両方に反映

2. `ページ継続確認 / layout warnings`
- 長い曲名が圧縮される、または狭い領域に収まらない場合に警告を表示
- 初回版は `長い曲名` 警告だけを扱う
- 将来的に `ページ跨ぎ` や `見出し直後の改ページ` に拡張しやすいデータ構造にする

### Download CTA

preview page 上の主CTAは `ダウンロード` または `PDFをダウンロード` とし、現在選択中テーマの PDF を取得する。

## Layout Rules

### Shared row semantics

各 item type は preview / PDF の両方で同じ意味づけを持つ。

- `song`: `M01`, `M02` のように連番付きで大きく表示
- `mc`: 番号なし、`[ MC ]` 表現
- `transition`: 中央寄せの区切り行
- `heading`: `EN` などのセクションブレイク行

### Title handling

長いタイトルは次の優先順で扱う。

1. まず preview / PDF の両方で許容幅を計測する
2. 1行に収まらない場合は圧縮または折り返しのルールを適用する
3. その結果、視認性リスクがある場合だけ warning を出す

初回版では「警告を出す」ことを優先し、複雑な自動最適化は広げない。

## Components and File Boundaries

想定する主な責務分割:

- `lib/pdf/build-layout.ts`
  - shared layout/model を構築
  - warning 候補もここで計算

- `lib/pdf/render-setlist-pdf.ts`
  - shared layout/model を描画
  - Stitch 基準の紙面ルールを反映

- `app/(app)/events/[eventId]/pdf/page.tsx`
  - preview page route

- `components/pdf-preview-page.tsx`
  - preview page 全体構成

- `components/pdf-sheet-preview.tsx`
  - 左側の紙面描画

- `components/pdf-preview-inspector.tsx`
  - 右側の inspector

- `app/api/events/[eventId]/pdf/route.ts`
  - download 導線は継続、theme query を受けて renderer 呼び出し

- `components/export-pdf-button.tsx`
  - 編集画面から preview route へ遷移するよう更新

必要に応じて preview 専用の小コンポーネントへ分割してよいが、責務は上記に従う。

## Error Handling

- event が存在しない、または所有権がない場合は preview page/API ともに既存ポリシーに従う
- theme query が不正な場合は `light` へフォールバック
- warning 計算に失敗しても preview / PDF 自体は生成できるようにする

## Testing Strategy

### Unit / integration

- layout builder が Stitch 想定の row semantics を返すこと
- heading / mc / transition / song で異なるレイアウト結果になること
- warning 計算が長いタイトルを検出できること
- API route が preview と同じ theme を使ってダウンロードできること

### Component tests

- preview page が Stitch 風の主要文言と構造を持つこと
- テーマ切替が preview と download URL に反映されること
- warning が必要なときだけ表示されること

### E2E

- 編集画面の `PDF出力` から preview page へ遷移すること
- preview page 上で light/dark を切り替えられること
- download アクションで PDF を取得できること

## Success Criteria

- 編集画面の `PDF出力` は direct download ではなく preview page へ遷移する
- preview page の左側紙面が Stitch PDF Preview にかなり近い見た目になる
- ダウンロードされる PDF が Stitch preview の紙面構造へ寄る
- light / dark が明確に異なる見た目で成立する
- 右パネルは `テーマ切替` と `レイアウト警告` が実動する
- 既存の認証、所有権チェック、PDFダウンロード自体の安定性は維持される
