# Setlist Reorder Motion Design

## Goal

セットリスト編集画面の `ドラッグで並び替え` を、今の compact な一覧密度を崩さずに、より滑らかで気持ちいい体感へ改善する。

## Product Intent

現在の並び替えは機能上は成立しているが、

- drag 中の持ち上がり感が弱い
- drop 位置が少し読み取りにくい
- 並び替え後の反映が硬く見える

ため、`使える` けれど `気持ちよくない` 状態になっている。

今回の変更では、既存の native DnD と server action を活かしつつ、

- どこを掴んでいるか
- どこに入るか
- 並び替わったこと

が自然に伝わる UI に寄せる。

## UX Summary

### Desktop

- 並び替えは引き続き drag handle から行う
- drag 中の行は少し浮き、境界と影が強くなる
- target row 全体を囲うのではなく、`挿入位置ライン` を主役にする
- drop した瞬間に一覧は先に並び替わって見える
- 保存はバックグラウンドで進み、UI は重く止めない

### Mobile

- 現状どおり drag reorder は前提にしない
- 行の密度や edit/delete 操作は維持する

## Interaction Model

### Drag Handle

- drag は今と同じく handle からのみ開始する
- handle は `grab / grabbing` がわかる見た目にする
- row 全体を draggable 主体に見せず、`操作点はハンドル` を明確に保つ

### Dragging Row

drag 中の行は以下の変化を持つ。

- 少し浮いた影
- 境界色の強調
- 背景のわずかな持ち上がり
- 軽い opacity 変化

ただし、`傾き / 回転 / 派手な scale` は入れない。  
実務ツールとして落ち着いた動きに留める。

### Drop Target

drop target は `この行の前に入る` ことを明確にする。

- row 全体の ring は主役にしない
- row 上端に挿入ラインを表示する
- ラインは current theme に合う高コントラスト色で出す
- drag 中の source row 自身には挿入ラインを出さない

重要なのは、見た目と実際の reorder ロジックを一致させること。  
現在の reorder は `target row の手前に挿入` なので、表示もそれに合わせる。

### Surrounding Rows

drag over で周囲の行が切り替わる時は、

- `transform`
- `border-color`
- `background-color`
- `opacity`

に短い transition を入れて、ガクッと切り替わる印象を減らす。

duration は micro-interaction として短めに保つ。  
`ぬるぬる` は目指すが、遅く感じる animation にはしない。

## Optimistic Reorder

drop 後は server action 完了を待たず、一覧を先に並び替えた状態へ更新する。

### Desired Behavior

- drop した瞬間に row order が入れ替わる
- 右上や section header 付近に小さく `並び順を更新中...` を出す
- 他操作を全面 block しない

### Failure Handling

保存に失敗した場合は、

- props 由来の canonical order へ戻す
- drag 状態を解除する
- editing modal のような他 UI は巻き込まない

今回は大きな toast system を新設しない。  
失敗時の表現は最小限に留め、まずは破綻しないことを優先する。

## State Model

表示順は 2 層で管理する。

- `canonicalItems`
  - server component / props から来る正
- `optimisticItems`
  - table 内で即時に見せる順序

加えて以下を持つ。

- `draggingItemId`
- `dragOverItemId`
- `isSavingOrder`

ルール:

- drag 中は `optimisticItems` を表示する
- drop で `optimisticItems` を即時更新する
- save 成功後は props の再同期に追従する
- save 失敗時は `canonicalItems` に戻す
- 外部要因で props.items が変わった場合、drag 中でなければ local state を同期する

## Visual Language

### Dark Theme

- 持ち上がりは `gold accent + shadow + dark panel separation`
- 挿入ラインは黄系で強く見せる
- 周囲 row は黒の階調差で静かに反応させる

### Light Theme

- 持ち上がりは `ink border + paper tone shift`
- 挿入ラインは濃色または黄アクセントで紙面上でも見えるようにする
- 白背景で浮きすぎないよう shadow は控えめにする

### Density

- row 高さは今の compact layout を維持する
- modal 編集化で得た一覧密度は崩さない
- animation のために padding を増やしすぎない

## Accessibility

- drag handle の `aria-label` は維持する
- icon-only 状態でも focus ring を失わない
- `prefers-reduced-motion` では transform transition を弱めるか無効化する
- keyboard での既存操作を壊さない

今回の spec では keyboard sortable 自体は追加しない。

## Technical Shape

- 新しい DnD ライブラリは導入しない
- 既存の native HTML5 drag/drop を使う
- 実装の中心は `SetlistTable`
- visual state は row class/data attribute で制御する
- reorder API shape は変えない

## Testing

- drop 後、action 完了前でも row order が即時に入れ替わる
- drag source row に lift state がつく
- drag target に insertion indicator state がつく
- action 成功後も表示順が維持される
- action 失敗時は props 順へ戻る
- save 中の軽い status 表示が出る
- mobile / non-reorder path は壊れない

## Non-Goals

- DnD ライブラリ導入
- モバイル sortable の新規実装
- 回転や強いアニメーション演出
- toast / notification system の新設
- row 情報設計の全面見直し
