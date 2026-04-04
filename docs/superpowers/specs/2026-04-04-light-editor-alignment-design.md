# Light Editor Alignment Design

## Goal

`/events/[eventId]?theme=light` の編集画面を、dark theme の単純反転ではなく、Stitch の light editor に近い「印刷前の進行表」らしい雰囲気へ寄せる。

## Scope

- 対象は editor shell と editor 内の主要 UI
  - top header
  - left rail
  - metadata strip
  - add-item strip
  - setlist rows
  - modal editor
- 機能変更はしない
  - 既存の編集、削除、ドラッグ並び替え、PDF プレビュー導線はそのまま維持
- dark theme の見た目は壊さない

## Design Direction

light theme は「backstage の dark UI を明るくしたもの」ではなく、「制作机の上の整理された進行表」を目指す。

- 背景は真っ白ではなく、少し温かみのある紙色
- 面よりも罫線とタイポグラフィで構造を見せる
- yellow accent は残すが、面塗りは dark より控えめに使う
- 読みやすさを優先し、黒ベタの多用は避ける
- 全体の骨格は dark と同じにして、theme toggle で大きく構造が変わらないようにする

## Shell Treatment

### Header

- background は薄い paper tone にして、dark header のような heavy bar にはしない
- brand text は濃い charcoal
- current show text は yellow accent で目立たせるが、背景ハイライトは使わない
- border は black ではなく charcoal/ink 系に落とす

### Left Rail

- rail は light panel より少し濃い紙色にする
- section blocks は塗り面よりも罫線で区切る
- current event card は yellow accent を使って目立たせる
- archive list row は white / pale paper / active yellow の 3 層で差を出す

## Content Panels

### Metadata Strip

- 現在の card 感を弱め、`フォーム付きの記入欄` に見えるトーンへ寄せる
- 各 field は `薄い paper fill + しっかりした線` で構成する
- section label は mono uppercase のまま維持

### Add Item Strip

- add item area は yellow action を主役にしつつ、その他の control は white/paper tone で整理する
- item type tabs は light でも視認性が落ちないように、selected と idle の差を明確にする

## Setlist Rows

### Shared Rhythm

- compact height は維持する
- song / mc / transition / heading で高さ差を増やさない
- 1 行ずつを `印刷前の明細行` として見せる

### Song Rows

- row background は白寄り
- cue column と title のコントラストを上げる
- drag handle / action buttons は `薄い枠 + hover` で見せる

### MC Rows

- song row と同じ骨格のまま、わずかにトーン違いの panel を使う
- 「特殊項目」感は label で出し、背景では出しすぎない

### Transition Rows

- 中心の視線がずれないよう、text と divider の位置を再調整する
- dark のような重い帯ではなく、light では線と余白で区切る

### Heading Rows

- section break は paper layout の「見出しラベル」っぽく見せる
- heading chip は残しつつ、周辺の line treatment を light に合わせる

## Modal Treatment

- modal は dark 版より軽く、紙面上の overlay panel に見えるようにする
- 背景は warm white
- border は charcoal
- destructive action は red accent を維持するが、通常 action との距離を明確にする

## Architecture Notes

- 基本は `getDashboardThemeStyles("light")` の token 調整で表現する
- ただし setlist row のように item-type ごとの tone が必要な部分は、component 内の light-specific tone map を調整してよい
- dark/light で DOM 構造は分岐しない
- conditional は style token と class composition に留める

## Affected Files

- `components/dashboard-shell.tsx`
- `components/event-editor-page-content.tsx`
- `components/event-list.tsx`
- `components/event-metadata-form.tsx`
- `components/setlist-item-form.tsx`
- `components/setlist-table.tsx`
- `components/setlist-item-edit-modal.tsx`
- 必要なら corresponding component tests

## Testing

- existing editor component tests を維持
- light theme rendering assertions を追加
- `theme=light` でも
  - header actions
  - compact row rhythm
  - modal open
  - archive link
  が壊れないことを確認する
