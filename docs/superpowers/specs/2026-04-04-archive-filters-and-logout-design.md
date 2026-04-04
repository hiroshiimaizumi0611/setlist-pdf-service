# Archive Filters And Logout Design

## Summary

`/events` の公演アーカイブ画面で、現在ダミー表示の `Date Range` `Venue` `Theme` フィルターを実動化する。あわせて、archive と editor の両方から使える `ログアウト` 導線を共通ヘッダーへ追加する。

今回の目的は「Stitch 由来の見た目だけある UI」を減らし、archive 画面を実運用に耐える検索・絞り込み画面へ近づけること。サーバー側検索や URL 同期までは入れず、まずはクライアント側で十分に使える一次実装にする。

## Goals

- `ARCHIVE SEARCH` に加えて `Venue / Theme / Date Range` が実際に絞り込みへ効く
- `RESET FILTERS` で全文検索と全フィルターが一括で初期状態へ戻る
- `Total Shows` や archive rail の総件数は、フィルター中でも総数のまま維持する
- `ログアウト` を archive / editor / templates / billing で共通に使える
- dark 基調の Stitch/backstage トーンを崩さない

## Non-Goals

- サーバーサイドフィルタリング
- URL クエリとの同期
- 複合検索の保存やプリセット
- 会場マスタやタグ管理

## User Experience

### Archive Filters

archive 画面は次の 4 軸で絞り込める。

- `ARCHIVE SEARCH`
  - 既存どおりタイトルと会場名への部分一致
- `Venue`
  - 現在の公演一覧からユニークな会場名を抽出して選択肢化する
  - 会場未設定の公演がある場合は `未設定` も選べる
- `Theme`
  - `All Themes / Dark / Light`
- `Date Range`
  - `All Dates / Last 30 Days / This Year / Older`

フィルターは即時反映でよく、送信ボタンは不要。`RESET FILTERS` は全文検索入力、Venue、Theme、Date Range をすべて初期値へ戻す。

件数表示は 2 種類を維持する。

- 総数
  - sidebar の `ARCHIVE STATUS`
  - `SYSTEM META > Total Shows`
  - header description
- 現在表示件数
  - フィルター中だけ overview 側に `n件表示 / OF m公演`

### Logout

ログアウトは `DashboardShell` の右上ヘッダーに共通配置する。Theme toggle や PDF ボタンと同じ action 群に入れ、archive と editor の両方で位置を揃える。

挙動はシンプルにする。

- クリックで即ログアウト
- セッション破棄後 `/login` へ遷移
- destructive ではなく secondary 系の落ち着いた見た目

## Architecture

### Filtering

`PerformanceArchivePageContent` に filter state を集約する。

- `searchQuery`
- `selectedVenue`
- `selectedTheme`
- `selectedDateRange`

`filteredEvents` は `useMemo` のまま拡張し、各条件を AND で適用する。

`PerformanceArchiveFilters` は見た目だけの disabled controls をやめ、次を props で受ける dumb component にする。

- `venueOptions`
- `selectedVenue`
- `selectedTheme`
- `selectedDateRange`
- `onVenueChange`
- `onThemeChange`
- `onDateRangeChange`
- `onResetFilters`

### Logout

`authClient.signOut()` を使う client component を新設して、`DashboardShell` の `headerActions` へ渡せるようにする。

共通化のため、archive 専用コンポーネントではなく全画面で再利用できる独立ボタンとして持つ。

## Data Rules

### Venue Options

- 公演一覧の `venue` からユニーク値を抽出
- 空文字や `null` は `未設定` にまとめる
- 表示順は `未設定` を最後、それ以外は日本語ロケールで昇順

### Date Range

基準時刻は `Asia/Tokyo` の「今日」とする。クライアント側の `Date` を使うが、判定は日単位で十分。

- `Last 30 Days`
  - 今日から 30 日以内
- `This Year`
  - 現在の年に属する
- `Older`
  - 上記以外

`eventDate` 未設定は `All Dates` では表示し、それ以外の date range では除外する。

## Testing

### Component Tests

`tests/components/performance-archive-page.test.tsx`

- `Venue` フィルターで対象行だけ残る
- `Theme` フィルターで dark / light が絞れる
- `Date Range` フィルターで recent / this year / older が切り替わる
- 複合フィルター時も総数表示は変わらない
- `RESET FILTERS` で全文検索と全選択が戻る

### Auth UI Tests

ログアウトボタンの client component に対して

- `authClient.signOut()` が呼ばれる
- 完了後に `/login` へ遷移する

### Regression

- 既存の archive route / editor route テストが壊れない
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Risks

- date range の分類基準が曖昧だと直感とズレる
  - 初回は固定プリセットで十分に単純化する
- 会場の表記ゆれで `Venue` が割れる
  - 今回は raw 値ベースで扱い、正規化は別タスクに切り出す
- ログアウトを header 共通化すると、未ログイン画面への誤表示が起きうる
  - app shell 内でのみ描画する

## Implementation Notes

- 最小差分で進めるため、archive filters は URL state に乗せない
- `DashboardShell` の header action 群へ 1 コンポーネント足すだけでログアウトを共通化する
- 既存の dark テーマ spacing を崩さず、filter controls は現在の DOM を活かして実動化する
