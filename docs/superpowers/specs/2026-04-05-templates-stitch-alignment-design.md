# Templates Stitch Alignment Design

## Goal

`/templates` を、現在の「大きめの管理カード群」から、Stitch の `Templates` 画面に近い `専用の再利用ワークスペース` に再構成する。

機能は現状のまま維持しつつ、`上段: 過去公演から保存`、`下段: 保存済みテンプレート一覧` の 2 段構成を、より実務的で素早く操作できる情報密度へ寄せる。

## Primary Scope

- 主対象は `/templates`
- 2 段構成は維持する
  - 上段: 既存公演からテンプレート保存
  - 下段: 保存済みテンプレート一覧
- テンプレート保存/公演作成の server action は変えない
- currentTheme は引き続き dark を主対象にする

## Problem

現状の `/templates` は機能上は成立しているが、Stitch の他画面と比べると以下の差がある。

- editor / archive / billing ほど `専用画面感` がない
- 各ブロックが大きめの card として分離しており、密度が少し低い
- `保存` と `再利用` という主要操作に対して、視線移動がやや多い
- 保存済みテンプレート一覧が「操作用の row」より「説明用カード」に寄っている

## Design Direction

`template operations bay` のような、再利用と量産のための作業卓として見せる。

- dark backstage / production system tone を維持
- card 感は減らし、`flat row + strip + panel` の構成へ寄せる
- archive 画面と同じ family に置きつつ、一覧の意味は `保存資産` に切り替える
- ユーザーが「何を保存できるか」「何から公演を作れるか」を一瞬で判断できるようにする

## Layout

### Top Header

- 既存の page title は維持するが、`Template Operations` に近い専用見出しへ寄せる
- 右上 action は
  - `テンプレート保存`
  - `UserMenu`
- editor / archive と同じ world の header family に揃える

### Upper Section: Save From Existing Event

上段は `保存対象の公演をすばやく選び、その場でテンプレート化する` strip/list にする。

- section heading
- 説明文
- 対象公演の row list

各 row には最低限この情報を置く。

- 公演名
- 会場 / 日付
- 項目数
- 保存フォーム
  - テンプレート名
  - 補足メモ
  - 保存 action

今より card っぽさを減らし、`selectable production row` に近づける。

### Lower Section: Saved Templates

下段は `archive に近い table-like rows` にする。

- 完全な HTML table に縛られなくてよい
- ただし視線の流れは table に近づける

各 row の情報はこの順を基本にする。

- テンプレート名
- 項目数
- 説明 / 補足
- 主 action: `このテンプレートで公演作成`

必要なら secondary な小ラベルとして:

- template asset
- ready to reuse
- saved structure

のような状態ラベルを置いてよいが、情報過多にはしない。

## Empty States

### No Source Events

上段の empty state は、単なるメッセージだけでなく `先に公演作成へ進む理由` が伝わる copy にする。

- まだ保存対象の公演がない
- 先に公演を作るとここからテンプレート化できる

### No Templates

下段の empty state は `Pro の価値訴求` を含んでもよいが、広告っぽくしすぎない。

- まだ保存済みテンプレートがない
- 公演内容を保存すると次回から使い回せる

## Visual Notes

- panel は `billing` と `archive` の中間
- section 見出しは mono + uppercase
- row は `border + muted surface + compact vertical rhythm`
- action button は yellow 主役を保ちつつ、1 画面内で主従を整理する
- row hover で少しだけ面が持ち上がるのは許容
- テンプレート一覧は `カードの縦積み` より `整列した row collection` を優先する

## Component Architecture

### Page Composition

`/templates` page 本体は、現在の 1 file 集中から少し責務を分ける余地がある。

- page
  - session / data loading
  - page-level composition
- source-events save section
  - 既存公演から保存する list
- saved-templates section
  - 下段の template rows

ただし分割は最小限に留める。複雑な抽象化は不要。

### Existing Components

- `TemplateList` はかなり見た目責務が変わる見込み
- 必要なら `template-list` を row-based に再構成する
- `TemplateSaveButton` は現状のまま使えるなら維持

## Non-Goals

- light theme の作り込み
- テンプレート削除
- テンプレート編集機能
- 並び替えやタグ付け
- 検索/フィルタ追加

## Affected Files

- `app/(app)/templates/page.tsx`
- `components/template-list.tsx`
- 必要なら new template row / section component
- `tests/components/templates-page.test.tsx`

## Testing

- `/templates` route render test を更新
- verify:
  - header actions are still present
  - upper section is row/list oriented
  - saved template section renders row-based actions
  - empty states still render meaningful copy
  - existing instantiate/save actions remain wired
