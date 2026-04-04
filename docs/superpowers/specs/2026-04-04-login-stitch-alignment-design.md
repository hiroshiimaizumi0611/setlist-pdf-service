# Login Stitch Alignment Design

## Goal

`/login` を Stitch の `Login and Signup` 画面に寄せ、現在の単体カード型 auth UI から、`左に価値訴求 / 右にログインフォーム` の 2 カラム構成へ作り直す。

## Primary Scope

- 主対象は `/login`
- ただし実装は `/register` にも展開しやすい shared auth shell を前提にする
- 認証ロジック自体は変えない
  - Better Auth の sign-in / sign-up
  - `/events` への遷移
  - pending / error handling

## Problem

現在の `/login` は dark の単体カードで機能上は十分だが、Stitch との差分が大きい。

- Stitch は `editor / archive / pdf preview` と同じ世界観の「production system」感がある
- 現在は中央寄せのフォーム 1 枚だけなので、サービスの文脈や価値が薄い
- ログイン前の第一印象として、プロダクト全体の雰囲気と少し切れて見える

## Design Direction

`SHOWRUNNER / backstage system` の世界観を保ったまま、auth 画面を「入口のコントロールルーム」らしく見せる。

- dark backstage tone を継続
- 余白の多い SaaS ログインではなく、情報密度のある production layout
- 左カラムは単なる説明文ではなく、価値訴求と状態表示を持つ showcase panel
- 右カラムは compact で集中しやすい operator panel
- 下段の補助カードでプロダクト価値を短く補強する

## Layout

### Top Bar

- 画面上部に細い header を置く
- 左に `SHOWRUNNER`
- 右に小さい system label
- auth 専用画面でも app 内の tone と断絶しないようにする

### Main Split Panel

中央に最大幅を持つ 2 カラム panel を置く。

#### Left Panel

- 大きい日本語 headline
- 短い価値訴求
- `無料で本番用PDFまで作成可能` のような無料価値カード
- 薄い巨大 typography watermark を入れてもよい

#### Right Panel

- `LOGIN / BACKSTAGE` の見出し
- 小さい補助ラベル
- email / password fields
- primary CTA
- register 導線
- 小さい system status row

## Component Architecture

### Shared Auth Shell

認証ページ全体のレイアウトは、`AuthForm` に全部抱え込ませず、外側の shell コンポーネントに切り出す。

- shell が担当するもの
  - page background
  - top bar
  - 2 カラム panel
  - left marketing/value panel
  - right form container
  - bottom feature cards
- form component が担当するもの
  - mode ごとの fields
  - submit
  - error
  - alternate link

### Auth Form

`AuthForm` は「フォーム本体」に寄せる。

- 今の sign-in/sign-up behavior は維持
- field, button, error, alternate link を Stitch 風の right panel 内 UI に合わせる
- layout を単体カード前提で持ちすぎないようにする

## Login vs Register

今回は login を主対象にするが、構造は register に流用できる形にする。

- `/login`
  - right panel 見出しは `LOGIN / BACKSTAGE`
  - alternate action は register
- `/register`
  - 同じ shell を使う
  - right panel copy だけ create-account 向けに変える

register は login と完全一致でなくてよいが、少なくとも `同じ family の画面` に見える状態を目指す。

## Visual Notes

- 背景は flat black ではなく subtle gradient
- surface は `#181818` / `#1b1b1b` 系で階層を作る
- accent は yellow
- labels は mono / uppercase / narrow tracking
- CTA は yellow fill の strong button
- secondary action は outline button か border link block

## Non-Goals

- パスワードリセット実装
- OAuth / SNS ログイン
- 価格表の追加
- 認証フローの仕様変更

## Affected Files

- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `components/auth-form.tsx`
- new auth shell / auth marketing component if needed
- auth page tests if present

## Testing

- login / register render testsを更新または追加
- verify:
  - login headline
  - register headline
  - name field is register-only
  - submit labels switch by mode
  - alternate link switches by mode
  - existing auth behavior is preserved
