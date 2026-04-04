# App Global Navigation Design

## Goal

`/templates` への導線と、各 app 画面からの戻り先を共通化するため、`archive / templates / billing` を並べた上位ナビゲーションを app 全体のヘッダーに追加する。

## Primary Scope

- app 内の共通ヘッダーに 3 項目のナビを追加する
  - `アーカイブ`
  - `テンプレート`
  - `請求`
- 適用対象
  - `/events`
  - `/events/[eventId]`
  - `/templates`
  - `/settings/billing`
  - `/account`
- `UserMenu` はそのまま右端に残す
- 既存の server action や page 構成は変えない

## Problem

現状は app 内のページ間遷移が一部だけに偏っている。

- `/templates` へ行く visible な導線がほぼない
- `/events/[eventId]` からは `アーカイブ` へ戻れるが、他の主要ページには同等の導線がない
- `/settings/billing` と `/account` が単独ページとして見えやすく、app 全体の回遊性が弱い
- `UserMenu` に app 内の主要遷移まで入れると、頻度の高い導線としては深すぎる

## Design Direction

`UserMenu` は個人操作、`global nav` は app 内移動、という責務分離にする。

- 左側: ブランド + グローバルナビ
- 右側: 既存の page-specific actions + `UserMenu`
- Stitch に寄せた dark backstage トーンを維持
- active 項目だけ黄アクセントで現在地を明確にする

## Navigation Model

### Items

- `アーカイブ`
  - href: `/events`
- `テンプレート`
  - href: `/templates`
- `請求`
  - href: `/settings/billing`

### Active State

- `/events` と `/events/[eventId]` では `アーカイブ` を active
- `/templates` では `テンプレート` を active
- `/settings/billing` では `請求` を active
- `/account` では active を持たせないか、近い導線を強調しない
  - account は確認用の補助ページで、グローバルナビの主系統とは分ける

## Layout

### DashboardShell

`DashboardShell` のヘッダーに共通ナビスロットを追加する。

- ブランド名の右
- 現在の `LIVE VIEW / CURRENT SHOW` メタの近く
- デスクトップでは横並び
- 狭い画面では折り返しても壊れない compact pills にする

### Billing / Account

`DashboardShell` を使っていないページにも、同じ見た目の global nav を置く。

- `billing` の sticky top bar
- `account` の sticky top bar

完全共通レイアウト化は今回の目的ではないため、まずはナビコンポーネントを共通化し、各 header に差し込む。

## Component Architecture

### New Component

`AppGlobalNav`

- props
  - `activeItem`
- responsibilities
  - nav items rendering
  - active / inactive styles
  - shared copy and href management

### Integration

- `DashboardShell`
  - optional `globalNav` or `activeNavItem` props を追加
- `billing/page.tsx`
  - header に `AppGlobalNav` を追加
- `account/page.tsx`
  - header に `AppGlobalNav` を追加

## Visual Notes

- dark theme 基準
- active
  - yellow border or yellow text
  - stronger background than inactive
- inactive
  - muted text + subtle border
- button 群ではなく `compact navigation tabs` として見せる
- `UserMenu` と競合しないよう、右側の action 群よりやや軽く見せる

## Non-Goals

- `UserMenu` への app navigation 追加
- mobile 専用 drawer の新設
- `/account` を settings nav に統合する大規模再設計
- breadcrumb の追加
- light theme の作り込み

## Affected Files

- `components/dashboard-shell.tsx`
- new `components/app-global-nav.tsx`
- `app/(app)/settings/billing/page.tsx`
- `app/(app)/account/page.tsx`
- route/component tests around events, billing, account

## Testing

- verify `/events` and `/events/[eventId]` show `テンプレート` link in shared header
- verify `/templates` and `/settings/billing` expose links back to archive
- verify active state is correct on archive / templates / billing
- verify `/account` still shows the nav and does not regress `UserMenu`
