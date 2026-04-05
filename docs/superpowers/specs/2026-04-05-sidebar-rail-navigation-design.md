# Sidebar Rail Navigation Design

## Goal

Stitch の画面構成に合わせて、app 全体の主要導線を上ヘッダーではなく左ペインに集約する。`archive / templates / billing / account` をアイコン付きで共通表示し、左ペインを通常幅とアイコンのみの細いレールに切り替えられるようにする。

## Primary Scope

- 共通導線を上ヘッダーから左ペイン上部へ移す
- 項目
  - `アーカイブ`
  - `テンプレート`
  - `請求`
  - `マイページ`
- 各項目は `アイコン + ラベル`
- 左ペインは desktop で `expanded / collapsed` を切り替え可能にする
- collapsed 時はアイコンのみ表示する
- `ログアウト` は左ペイン下部へ固定する
- 適用対象
  - `/events`
  - `/events/[eventId]`
  - `/templates`
  - `/settings/billing`
  - `/account`

## Problem

上ヘッダー型の共通ナビは機能としては足りるが、Stitch の画面印象から外れて見える。

- Stitch では主要導線が左ペインに集約されている
- app 内の共通移動は、右上の `UserMenu` や上部 pill nav より左レールのほうが自然
- 現状の sidebar は各画面固有情報が中心で、app 全体の情報設計が弱い
- `ログアウト` も右上や個別ページに散るより、左下の utility action に寄せたほうが整理される

## Design Direction

左ペインを `global rail + page-specific sidebar + utility footer` の3層構成にする。

- 上部
  - ブランド
  - rail collapse toggle
- 中央上
  - app 全体の共通導線
- 中央下
  - 既存のページ固有 sidebar 内容
  - 公演一覧
  - settings links
  - templates 補足など
- 下部固定
  - `ログアウト`

これにより、`どこへ行くか` と `その画面で何を扱うか` を左側で一貫して理解できるようにする。

## Navigation Model

### Items

- `アーカイブ`
  - href: `/events`
- `テンプレート`
  - href: `/templates`
- `請求`
  - href: `/settings/billing`
- `マイページ`
  - href: `/account`

### Active State

- `/events` と `/events/[eventId]` は `アーカイブ`
- `/templates` は `テンプレート`
- `/settings/billing` は `請求`
- `/account` は `マイページ`

## Sidebar Layout

### Expanded

- 現在の sidebar 幅に近い広さを保つ
- icon + label + current state が読める
- page-specific sidebar をその下に通常表示する

### Collapsed

- 細い rail に縮小する
- 共通導線はアイコンのみ
- active は黄アクセントで視認性を保つ
- `aria-label` や `title` でラベルが失われないようにする
- page-specific sidebar の詳細は隠し、必要最小限だけ残すか閉じる

今回は desktop での usability を主対象にし、mobile 専用 drawer までは広げない。

## Header Responsibility

上ヘッダーから共通ナビは外す。

- ヘッダーは以下に責務を限定する
  - ブランド補助情報
  - theme toggle
  - PDF 出力
  - page-specific actions
  - `UserMenu`

`UserMenu` はユーザー情報とアカウント操作、左ペインは app 内回遊、という役割分担にする。

## Component Architecture

### New / Updated Shared Components

`AppGlobalNav`

- top nav ではなく sidebar rail nav として再設計する
- props
  - `activeItem`
  - `collapsed`
- responsibilities
  - icon rendering
  - label rendering
  - active/inactive styles
  - a11y labels

`SidebarRail`

- brand
- collapse toggle
- global nav
- page-specific content slot
- footer utility slot

`LogoutButton`

- 既存機能は維持
- 左ペイン footer で自然に見える見た目へ寄せる

### DashboardShell

`DashboardShell` は left rail を共通化する。

- 現在の `sidebar` prop を page-specific content slot として扱う
- global nav を header ではなく sidebar 内へ移す
- collapse state を shell 側で持つ

### Non-Dashboard Pages

`/templates` `/settings/billing` `/account` でも同じ rail 構造を使う。

- 完全共通 shell へ寄せられるなら寄せる
- もし難しければ、まずは rail component の共通化を優先する

## Visual Notes

- dark theme 基準
- Stitch の left rail に近い `matte black + yellow active` を維持
- expanded 時は `icon + label + optional meta`
- collapsed 時は `icon only`
- `ログアウト` は destructive 色だが悪目立ちしすぎない
- collapse toggle は header ではなく rail 上部

## State Persistence

collapse 状態は初期実装では client-side local state で十分。

- page 遷移をまたいで維持できるなら localStorage を検討
- ただし今回の主目的は情報設計と見た目なので、 persistence は軽量実装でよい

## Non-Goals

- mobile 専用 drawer の追加
- keyboard shortcut による sidebar toggle
- settings 情報構造そのものの再設計
- user profile 詳細機能の追加
- light theme の本格調整

## Affected Files

- `components/app-global-nav.tsx`
- `components/dashboard-shell.tsx`
- app page shells around:
  - `app/(app)/templates/page.tsx`
  - `app/(app)/settings/billing/page.tsx`
  - `app/(app)/account/page.tsx`
- `components/logout-button.tsx`
- page/component tests around events, templates, billing, account

## Testing

- verify shared navigation appears in left rail across archive, editor, templates, billing, account
- verify active item is correct on each page
- verify collapsed rail still exposes accessible nav names
- verify logout remains reachable from left rail footer
- verify previous page-specific sidebar content still appears in expanded mode
