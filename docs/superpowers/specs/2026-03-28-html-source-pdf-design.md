# HTML Source PDF Rendering Design

**Date:** 2026-03-28

## Goal

現在のセットリスト PDF 体験は、preview 画面が React/Tailwind の紙面再現、download が `pdf-lib` の別レンダラになっており、見た目が一致しない。  
今回の目的は、`preview で見えている紙面` と `実際にダウンロードされる PDF` を完全に一致させること。そのために、HTML/CSS の紙面ドキュメントを唯一の source of truth にし、preview でも PDF 出力でも同じ document を使う。

## Scope

今回の対象:

- preview 用の紙面 source を React 再現ではなく実 HTML document に切り替える
- preview page 左カラムに実 document を埋め込み表示する
- download API が同じ document から PDF を生成するよう変更する
- Cloudflare Browser Rendering 前提の PDF 生成基盤を導入する
- preview / download / theme 切替の一致性を担保する
- 内部用署名 token または同等の仕組みで document access を安全にする

今回の対象外:

- セットリスト編集画面の追加レイアウト刷新
- B5 / モバイルなど追加用紙サイズの実装
- 右パネル inspector の機能拡張
- Stripe / billing フローの変更

## User Flow

### 1. 編集画面

編集画面の `PDF出力` はこれまで通り preview page へ遷移する。

- `/events/[eventId]/pdf?theme=light|dark`

### 2. Preview page

preview page は既存の dark workspace shell を維持しつつ、左カラムは `iframe` または同等の埋め込みで実 document を表示する。

- preview shell: app UI
- embedded document: 実際に PDF 化される HTML

これにより「preview 用に似せて描いた紙面」ではなく、「そのまま PDF になる紙面」を見せる。

### 3. Download

preview page 上の `PDF出力` は、同じ theme の document を Browser Rendering で PDF 化したレスポンスを返す。

結果として:

- preview で見える document
- PDF 生成に使う document

の 2 つが同一になる。

## Architecture

### Single Source Of Truth

紙面の source of truth は `HTML document` に一本化する。

構成は次の 3 層にする。

1. `document data builder`
   event と item から、document に必要な表示データを作る

2. `print document renderer`
   表示データをもとに、紙面専用の HTML/CSS を描画する

3. `PDF generation runtime`
   同じ document URL を headless browser で開き、`page.pdf()` で PDF 化する

これにより、preview 用 React 再現と PDF renderer の二重実装をやめる。

### Why This Replaces The Current Design

現状のズレの根本原因は以下。

- preview: React/Tailwind の別描画
- download: `pdf-lib` の別描画

共通の layout 情報を持っていても、描画 engine が違えば文字組み、余白、線、改ページ、行高がずれる。  
今回の設計では `描画結果そのもの` を共通化するため、ズレを構造的に潰せる。

## Route Design

### Preview shell route

既存:

- `app/(app)/events/[eventId]/pdf/page.tsx`

責務:

- 認証済み user の event を取得
- theme を解決
- inspector 用データを構成
- 左カラムに document route を埋め込む
- 右カラムに theme 切替 / warning を表示する

### New print document route

新規:

- `app/(app)/events/[eventId]/pdf/document/page.tsx`

責務:

- 紙面そのものだけを返す
- app shell を含めない
- 実PDFになる HTML/CSS を描画する
- 通常 session または内部署名 token のどちらかでアクセスを許可する

この route は preview iframe の `src` と PDF 生成の両方で使う。

### Existing download API

既存:

- `app/api/events/[eventId]/pdf/route.ts`

責務:

- user と event の access を確認
- theme を解決
- 内部 document URL を生成
- Browser Rendering で document を開いて `page.pdf()` する
- attachment レスポンスを返す

## Rendering Strategy

### Preview rendering

preview page の左カラムは、React で紙面を再現しない。  
代わりに次のようにする。

- `iframe` または `object` で document route を埋め込む
- shell 側では viewport, border, shadow, scaling だけ担当する
- 紙面中身は document route に完全に委譲する

これで preview と PDF の DOM/CSS が一致する。

### PDF rendering

PDF 出力は `pdf-lib` 直描画ではなく、headless browser に document route を開かせて PDF 化する。

想定 runtime:

- Production: Cloudflare Browser Rendering
- Local/Test: Playwright/Chromium ベースの fallback

補足:

- local でも別 renderer へ戻さず、同じ HTML source を使う
- そうしないと local preview と local PDF でも再びズレる

## Document Design

source of truth は「今の preview に近い見た目」とする。  
つまり PDF 側が preview に寄るのではなく、preview で成立している紙面そのものを PDF にする。

紙面の visual rules:

- Stitch dark preview の backstage 感をベースにする
- light / dark で紙の見え方が明確に変わる
- header band / cue column / 曲名の強いジャンプ率を維持する
- `MC`, `転換`, `見出し` の special row 表現を維持する
- decorative copy は引き続き除去する

引き続き入れないもの:

- `CONFIDENTIAL / INTERNAL USE`
- MD5 などダミー技術情報
- product chrome 的な飾り文言

残すもの:

- 公演名
- 必要最小限のサブ情報
- 更新日時
- ページ番号

## CSS / Print Rules

document route の CSS は `screen` と `print` の両方を前提に組む。

要件:

- screen では preview iframe 内で自然に見える
- print / PDF では同じレイアウトのままページ出力される
- `@page` と print 向け margin を明示する
- A4 サイズを first-class に扱う
- 改ページ制御は CSS で行う

注意点:

- 余計な responsive UI は document 側に持ち込まない
- document は 1 枚の紙を縦積みする純粋な print surface とする
- 右パネルや app shell の CSS と切り離す

## Data Model

`build-layout.ts` の役割は残すが、責務は「最終描画命令」ではなく「document 用表示データの構成」に寄せ直す。

残す責務:

- 行順序
- cue label
- row variant
- warning
- page grouping

弱める責務:

- `pdf-lib` 前提の描画都合に寄った数値計算
- renderer 固有の text fitting

移行後は:

- document renderer が HTML/CSS で描画
- PDF 出力は browser engine が文字組みを決定

になる。

## Auth And Internal Access

### Preview access

preview iframe で document route を表示する場合は、通常のログイン session でアクセスさせる。

### PDF generation access

download API が Browser Rendering を使うときは、user cookie をそのまま headless browser に流すのではなく、内部専用の短寿命 token を付けた URL を生成して document route を開かせる。

要件:

- token は eventId, theme, 有効期限を含む
- server-side secret で署名する
- 短寿命で使い捨てに近い扱いにする
- session がなくても token が正しければ document route を内部閲覧可にする

これで:

- preview は通常 auth
- PDF 生成は内部 token

の 2 系統を安全に両立できる。

## Cloudflare Runtime Design

### Browser Rendering

本番 PDF 生成は Cloudflare Browser Rendering を使う。

必要事項:

- `wrangler.jsonc` に browser binding を追加
- Worker 側で Browser Rendering client を初期化する
- API route から document URL を開いて PDF bytes を取得する

### Constraints

- Browser Rendering は `pdf-lib` より遅くなる
- 無料枠 / 従量課金の制約がある
- そのため document route は「紙面を返すだけ」の軽い構造に保つ

### Local development

ローカルでは Cloudflare binding の代わりに Playwright/Chromium などで同じ document route を PDF 化する fallback を持つ。

方針:

- source of truth は常に HTML document
- production と local で source を変えない
- runtime だけ差し替える

## Components And File Boundaries

想定する責務分割:

- `app/(app)/events/[eventId]/pdf/page.tsx`
  - preview shell

- `app/(app)/events/[eventId]/pdf/document/page.tsx`
  - print document route

- `components/pdf-preview-page.tsx`
  - preview shell 全体

- `components/pdf-preview-inspector.tsx`
  - 右パネル

- `components/pdf-document.tsx`
  - 紙面 source of truth

- `lib/pdf/build-layout.ts`
  - document 用表示データと warnings

- `lib/pdf/render-setlist-pdf.ts`
  - 段階的に縮小または廃止対象

- `app/api/events/[eventId]/pdf/route.ts`
  - Browser Rendering 経由の download API

- `lib/pdf/document-token.ts`
  - 内部 access token の生成/検証

- `lib/pdf/generate-pdf-from-document.ts`
  - local/prod runtime 差し替えの facade

## Migration Plan

段階的に移行する。

### Phase 1

- document route を追加
- 現 preview の紙面を `pdf-document` コンポーネントへ移す

### Phase 2

- preview 左カラムを React 再描画から iframe 埋め込みへ差し替える

### Phase 3

- download API を Browser Rendering 化する

### Phase 4

- 旧 `pdf-lib` renderer の役割を整理し、不要部分を削除する

この順序なら途中でも preview / download の責務が明確で、差分確認しやすい。

## Error Handling

- event が存在しない / 所有権がない場合は既存ポリシーに従う
- theme query が不正な場合は `light` にフォールバック
- token が不正または期限切れなら document route は 404 または unauthorized 扱いにする
- Browser Rendering が失敗した場合は 5xx を返し、原因をログに残す
- local fallback browser が使えない場合は、明確な設定エラーを返す

## Testing Strategy

### Unit / integration

- document token が正しく署名 / 検証できること
- theme query が preview/document/download で一致すること
- build-layout が document 用 warnings を返すこと

### Component tests

- preview page が iframe/object で document route を向くこと
- theme 切替で iframe src と download URL が一致して変わること
- inspector が warnings を表示できること

### Route tests

- document route が session ありで表示できること
- document route が valid token でも表示できること
- invalid token では拒否されること
- download API が theme を保った document URL を使うこと

### E2E

- editor -> preview -> download の flow が成立すること
- preview で選んだ theme と download の theme が一致すること
- preview iframe の document URL が期待どおりであること

### Visual verification

- 同一 event / 同一 theme で preview iframe に表示された document と出力PDFの見た目差が実質なくなること
- 少なくとも header, row spacing, transition row, footer, page count が一致すること

## Success Criteria

- preview に表示される紙面と download PDF が同じ source から生成される
- preview と PDF の見た目差が実質なくなる
- 現在の preview に近いデザインの PDF を実際に出力できる
- preview shell の theme 切替と inspector は維持される
- Cloudflare Workers 上で PDF 出力が成立する
- local でも同じ source を使った PDF 確認ができる
