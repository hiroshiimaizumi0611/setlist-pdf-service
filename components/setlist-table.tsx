import type { SetlistItemRecord } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type SetlistTableProps = {
  currentTheme: PdfThemeName;
  eventId: string;
  items: SetlistItemRecord[];
  reorderItemsAction?: (input: {
    eventId: string;
    orderedItemIds: string[];
  }) => Promise<unknown>;
  deleteItemAction?: (input: {
    eventId: string;
    itemId: string;
  }) => Promise<unknown>;
};

const ITEM_TYPE_LABELS: Record<SetlistItemRecord["itemType"], string> = {
  song: "曲",
  mc: "MC",
  transition: "転換",
  heading: "見出し",
};

function formatCue(items: SetlistItemRecord[], index: number) {
  const item = items[index];

  if (item.itemType !== "song") {
    return "";
  }

  const songNumber =
    items.slice(0, index + 1).filter((candidate) => candidate.itemType === "song")
      .length;

  return `M${String(songNumber).padStart(2, "0")}`;
}

function formatDuration(value: number | null) {
  if (value === null) {
    return "----";
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function swapIds(items: SetlistItemRecord[], from: number, to: number) {
  const ordered = items.map((item) => item.id);
  const next = [...ordered];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function SetlistTable({
  currentTheme,
  eventId,
  items,
  reorderItemsAction,
  deleteItemAction,
}: SetlistTableProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`border-2 ${theme.border} ${theme.panel} overflow-hidden`}>
      <div
        className={`flex flex-col gap-2 border-b-2 ${theme.border} px-5 py-4 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div>
          <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">セットリスト</h2>
          <p className={`mt-1 text-sm leading-6 ${theme.mutedText}`}>
            並び替えは上下ボタンで確定します。PDFにもこの順番がそのまま反映されます。
          </p>
        </div>
        <span className={`${theme.pill} inline-flex w-fit px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em]`}>
          {items.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className={`${theme.tableHeader}`}>
            <tr className="text-left">
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                Cue
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                種別
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                タイトル
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                尺
              </th>
              <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                メモ
              </th>
              <th className="px-4 py-3 text-right font-mono text-[11px] uppercase tracking-[0.22em]">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const canMoveUp = index > 0;
              const canMoveDown = index < items.length - 1;

              return (
                <tr
                  key={item.id}
                  className={`border-b ${theme.border} align-top ${index % 2 === 0 ? theme.panel : theme.panelMuted}`}
                >
                  <td className="px-4 py-4 font-mono text-lg font-black tracking-[-0.08em]">
                    {formatCue(items, index)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`${theme.pill} inline-flex px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em]`}>
                      {ITEM_TYPE_LABELS[item.itemType]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold">{item.title}</p>
                      {item.artist ? (
                        <p className={`text-sm ${theme.mutedText}`}>{item.artist}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{formatDuration(item.durationSeconds)}</td>
                  <td className={`px-4 py-4 text-sm ${theme.mutedText}`}>
                    {item.notes || "メモなし"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <form
                        action={async () => {
                          "use server";

                          if (!canMoveUp || !reorderItemsAction) {
                            return;
                          }

                          await reorderItemsAction({
                            eventId,
                            orderedItemIds: swapIds(items, index, index - 1),
                          });
                        }}
                      >
                        <button
                          type="submit"
                          disabled={!canMoveUp}
                          aria-label={`${item.title} を上へ移動`}
                          className={`${theme.buttonSecondary} min-h-11 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          上へ
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";

                          if (!canMoveDown || !reorderItemsAction) {
                            return;
                          }

                          await reorderItemsAction({
                            eventId,
                            orderedItemIds: swapIds(items, index, index + 1),
                          });
                        }}
                      >
                        <button
                          type="submit"
                          disabled={!canMoveDown}
                          aria-label={`${item.title} を下へ移動`}
                          className={`${theme.buttonSecondary} min-h-11 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          下へ
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";

                          if (!deleteItemAction) {
                            return;
                          }

                          await deleteItemAction({
                            eventId,
                            itemId: item.id,
                          });
                        }}
                      >
                        <button
                          type="submit"
                          aria-label={`${item.title} を削除`}
                          className={`${theme.destructive} min-h-11 px-3 text-xs font-bold`}
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
