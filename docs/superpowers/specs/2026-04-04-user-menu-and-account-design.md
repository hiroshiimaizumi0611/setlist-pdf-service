# User Menu And Account Design

## Goal

`archive / editor / templates / billing` の共通ヘッダーに、ユーザーアイコン経由の account menu を追加し、既存の単独 `ログアウト` ボタンを `ユーザー情報 + マイページ + プラン管理 + ログアウト` に置き換える。

あわせて、最小構成の `/account` ページを追加し、名前・メール・現在プランを確認できるようにする。

## Primary Scope

- 主対象は app 内の共通ヘッダー
  - `/events`
  - `/events/[eventId]`
  - `/templates`
  - `/settings/billing`
- 新規追加ページは `/account`
- auth / billing のロジック自体は変えない
  - Better Auth の session 取得
  - Stripe 導線
  - sign out behavior

## Problem

現在は app 内の画面ごとに `ログアウト` ボタンを単体で出しているため、ヘッダーの完成度と統一感が少し弱い。

- Stitch 寄せした shell に対して、ログアウトだけが露出した action に見える
- ユーザー本人の情報や現在地が見えない
- 今後 `マイページ` や `設定` を増やす拡張先がない
- billing などではヘッダー action がやや説明不足に見える

## Design Direction

`production system` のトーンを崩さず、ヘッダー右上を `operator identity` として扱う。

- 丸いアバターに頭文字 1 文字を表示
- クリックで compact dropdown を開く
- 単なる logout 容器ではなく、`誰が使っているか` と `どこへ行けるか` を短く示す
- dark / light のどちらでも shell に自然に溶けるようにする

## Header User Menu

### Trigger

- 共通ヘッダー右上に丸い avatar button を置く
- 表示は最初、`display name` か `email` の先頭 1 文字
- 既存の `LogoutButton` 露出は廃止し、この trigger に集約する

### Dropdown Content

メニューは 3 ブロック構成にする。

#### Identity Block

- 表示名
- メールアドレス
- 小さい plan label

#### Navigation Block

- `マイページ`
- `プラン管理`

#### Session Block

- `ログアウト`

### Interaction

- trigger クリックで開閉
- メニュー外クリックで閉じる
- `Esc` で閉じる
- keyboard focus で到達できる
- route 遷移後は閉じる

## My Page

`/account` は最初は軽い account summary page とする。

- 名前
- メール
- 現在プラン
- 補助説明

この段階では編集フォームは持たない。

- account settings の full page は将来拡張
- 今回は `確認できる場所を作る` ことが目的

## Routing

- `マイページ` → `/account`
- `プラン管理` → `/settings/billing`
- `ログアウト` → 既存 sign out のまま `/login` へ戻る

## Component Architecture

### Shared User Menu Component

app 内の複数 route で同じ挙動にしたいので、独立した client component にする。

- avatar trigger
- dropdown state
- close behavior
- sign out action

server component 側は session 情報と current plan だけ渡す。

### Header Composition

`DashboardShell` は `headerActions` をそのまま維持してよいが、各 page では `LogoutButton` ではなく `UserMenu` を渡す。

この変更で、archive / editor / templates / billing のヘッダー action を統一する。

### Account Page Component

`/account` は billing ほど重い layout にはせず、現在の shell family に入る簡潔な summary page とする。

- shell は既存 tone を再利用
- card は 1〜2 枚で十分
- `プラン管理へ` の導線は置く

## Visual Notes

- avatar は単色 circle ではなく、theme に応じて subtle surface を使う
- dark は `#222 / #f6c453` 系、light は紙面系トーンに寄せる
- dropdown は小さすぎず、menu item を row button として扱う
- destructive の主張は logout でだけ軽く出す
- `マイページ` は billing より静かで、identity を読むことを優先する

## Non-Goals

- アカウント情報編集
- パスワード変更
- アバター画像アップロード
- 多段 settings menu
- 権限管理

## Affected Files

- `components/dashboard-shell.tsx`
- `components/logout-button.tsx` or replacement path
- new `components/user-menu.tsx`
- `app/(app)/events/page.tsx`
- `app/(app)/events/[eventId]/page.tsx`
- `app/(app)/templates/page.tsx`
- `app/(app)/settings/billing/page.tsx`
- new `app/(app)/account/page.tsx`
- tests for shell/header/account route

## Testing

- user menu render test
- open / close interaction test
- menu items route to `/account` and `/settings/billing`
- logout action remains wired
- account page render test
- app pages still render with shared header action intact
