import Link from "next/link";
import type { SetlistItemRecord } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type SetlistTableProps = {
  currentTheme: PdfThemeName;
  eventId: string;
  items: SetlistItemRecord[];
  pendingDeleteItemId?: string | null;
  updateItemAction?: (input: {
    eventId: string;
    itemId: string;
    itemType?: SetlistItemRecord["itemType"];
    title?: string;
    artist?: string | null;
    durationSeconds?: number | null;
    notes?: string | null;
  }) => Promise<unknown>;
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

const ITEM_TYPE_OPTIONS = Object.entries(ITEM_TYPE_LABELS).map(([value, label]) => ({
  value: value as SetlistItemRecord["itemType"],
  label,
}));

function formatCue(items: SetlistItemRecord[], index: number) {
  const item = items[index];

  if (item.itemType !== "song") {
    return "--";
  }

  const songNumber =
    items.slice(0, index + 1).filter((candidate) => candidate.itemType === "song").length;

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

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function swapIds(items: SetlistItemRecord[], from: number, to: number) {
  const ordered = items.map((item) => item.id);
  const next = [...ordered];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

function getRowLabel(itemType: SetlistItemRecord["itemType"]) {
  if (itemType === "mc") {
    return "MC / TALK";
  }

  if (itemType === "transition") {
    return "CHANGEOVER";
  }

  if (itemType === "heading") {
    return "見出し";
  }

  return "SONG";
}

export function SetlistTable({
  currentTheme,
  eventId,
  items,
  pendingDeleteItemId,
  updateItemAction,
  reorderItemsAction,
  deleteItemAction,
}: SetlistTableProps) {
  const theme = getDashboardThemeStyles(currentTheme);
  const itemTone =
    currentTheme === "dark"
      ? {
          row: {
            song: "bg-[#181818] hover:bg-[#202020]",
            mc: "bg-[#202020] hover:bg-[#2a2a2a]",
            transition: "bg-[#111111] hover:bg-[#171717] border-y border-[#4d4732]/20",
            heading: "bg-[#141414]",
          },
          strip: {
            song: "bg-[#00dbe8]",
            mc: "bg-[#e9c400]",
            transition: "bg-[#4d4732]",
            heading: "bg-transparent",
          },
          cue: "text-[#f6c453]",
          subtitle: "text-[#bfb7aa]",
          muted: "text-[#bfb7aa]",
          headingBorder: "border-[#f6c453]/30",
          duration: "text-[#d0c6ab]",
        }
      : {
          row: {
            song: "bg-[#ffffff] hover:bg-[#fcfcfc]",
            mc: "bg-[#f0f0f0] hover:bg-[#fafafa]",
            transition: "bg-[#f7f1e3] hover:bg-[#fffdf8] border-y border-[#1f1b16]",
            heading: "bg-[#ffffff]",
          },
          strip: {
            song: "bg-[#1f1b16]",
            mc: "bg-[#c99a23]",
            transition: "bg-[#5f5649]",
            heading: "bg-transparent",
          },
          cue: "text-[#1f1b16]",
          subtitle: "text-[#5f5649]",
          muted: "text-[#5f5649]",
          headingBorder: "border-[#1f1b16]/20",
          duration: "text-[#5f5649]",
        };

  return (
    <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
      <div
        className={`flex flex-col gap-2 border-b-2 ${theme.border} px-5 py-4 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div>
          <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">セットリスト</h2>
          <p className={`mt-1 text-sm leading-6 ${theme.mutedText}`}>
            上下ボタンで並び替えし、編集・削除は各行から操作します。
          </p>
        </div>
        <span
          className={`${theme.pill} inline-flex w-fit px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em]`}
        >
          {items.length}項目
        </span>
      </div>

      <div className="space-y-0">
        {items.map((item, index) => {
          const canMoveUp = index > 0;
          const canMoveDown = index < items.length - 1;
          const rowLabel = getRowLabel(item.itemType);

          if (item.itemType === "heading") {
            return (
              <article
                key={item.id}
                data-row-variant="heading"
                data-row-rhythm="setlist"
                className={`group border-b ${theme.border} ${itemTone.row.heading} px-4 py-4`}
              >
                <div className="flex items-center gap-4">
                  <div
                    data-row-cue="heading"
                    className={`flex h-9 w-14 items-center justify-center border ${itemTone.headingBorder} font-mono text-sm font-black tracking-[0.24em] ${itemTone.cue}`}
                  >
                    {item.title}
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span
                      className={`${theme.buttonPrimary} inline-flex min-h-11 items-center px-4 text-xs font-black tracking-[0.22em] uppercase`}
                    >
                      {rowLabel}
                    </span>
                    <div className={`hidden h-px flex-1 bg-current/20 sm:block ${itemTone.muted}`} />
                    <span
                      data-row-label="heading"
                      className={`font-mono text-[10px] uppercase tracking-[0.28em] ${itemTone.subtitle}`}
                    >
                      SECTION BREAK
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
                    <details className="w-full max-w-md">
                      <summary
                        className={`${theme.buttonSecondary} inline-flex min-h-11 cursor-pointer items-center justify-center px-3 text-xs font-bold`}
                      >
                        編集
                      </summary>
                      <div className={`mt-3 border-2 ${theme.border} ${theme.panelMuted} p-4`}>
                        <form
                          action={async (formData: FormData) => {
                            "use server";

                            if (!updateItemAction) {
                              return;
                            }

                            await updateItemAction({
                              eventId,
                              itemId: item.id,
                              itemType: String(formData.get("itemType") ?? item.itemType) as SetlistItemRecord["itemType"],
                              title: String(formData.get("title") ?? ""),
                              artist: String(formData.get("artist") ?? "") || null,
                              durationSeconds: parseOptionalNumber(formData.get("durationSeconds")),
                              notes: String(formData.get("notes") ?? "") || null,
                            });
                          }}
                          aria-label={`${item.title} の編集フォーム`}
                          className="grid gap-3"
                        >
                          <label className="grid gap-2 text-sm font-medium">
                            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                              項目種別
                            </span>
                            <select
                              name="itemType"
                              defaultValue={item.itemType}
                              className={`${theme.input} min-h-11 px-4 py-3`}
                            >
                              {ITEM_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                              タイトル
                            </span>
                            <input
                              type="text"
                              name="title"
                              defaultValue={item.title}
                              required
                              className={`${theme.input} min-h-11 px-4 py-3`}
                            />
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                              アーティスト
                            </span>
                            <input
                              type="text"
                              name="artist"
                              defaultValue={item.artist ?? ""}
                              placeholder="任意"
                              className={`${theme.inputMuted} min-h-11 px-4 py-3`}
                            />
                          </label>
                          <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                            <label className="grid gap-2 text-sm font-medium">
                              <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                                尺(秒)
                              </span>
                              <input
                                type="number"
                                min="0"
                                name="durationSeconds"
                                defaultValue={item.durationSeconds ?? ""}
                                placeholder="任意"
                                className={`${theme.inputMuted} min-h-11 px-4 py-3`}
                              />
                            </label>

                            <label className="grid gap-2 text-sm font-medium">
                              <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                                メモ
                              </span>
                              <input
                                type="text"
                                name="notes"
                                defaultValue={item.notes ?? ""}
                                placeholder="任意"
                                className={`${theme.inputMuted} min-h-11 px-4 py-3`}
                              />
                            </label>
                          </div>
                          <button
                            type="submit"
                            className={`${theme.buttonPrimary} min-h-11 px-4 text-xs font-bold`}
                          >
                            変更を保存
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                </div>
              </article>
            );
          }

          return (
            <article
              key={item.id}
              data-row-variant={item.itemType}
              data-row-rhythm="setlist"
              className={`group border-b ${theme.border} ${itemTone.row[item.itemType]} transition-colors`}
            >
              <div className="grid md:grid-cols-[4px_60px_minmax(0,1fr)_120px_180px]">
                <div
                  aria-hidden="true"
                  className={`${itemTone.strip[item.itemType]} min-h-full`}
                />

                <div
                  data-row-cue={item.itemType}
                  className={`flex items-center justify-center border-b border-inherit px-3 py-4 font-mono text-base font-black tracking-[0.16em] md:border-b-0 md:border-r ${itemTone.cue}`}
                >
                  {formatCue(items, index)}
                </div>

                <div className="min-w-0 px-4 py-4 md:px-5">
                  <p
                    data-row-label={item.itemType}
                    className={`font-mono text-[10px] uppercase tracking-[0.28em] ${itemTone.subtitle}`}
                  >
                    {rowLabel}
                  </p>
                  <div className="mt-1 min-w-0">
                    <p
                      data-row-title={item.itemType}
                      className={`truncate ${
                        item.itemType === "transition"
                          ? "font-bold text-base uppercase tracking-[0.08em] opacity-60"
                          : item.itemType === "mc"
                            ? "font-bold text-lg tracking-[0.03em]"
                          : "font-bold text-lg"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.artist ? (
                      <p className={`mt-1 text-sm ${itemTone.muted}`}>{item.artist}</p>
                    ) : null}
                    {item.notes ? (
                      <p className={`mt-1 text-sm ${itemTone.muted}`}>{item.notes}</p>
                    ) : null}
                  </div>
                </div>

                <div
                  className={`flex items-center px-4 py-4 font-mono text-sm md:justify-center ${itemTone.duration}`}
                >
                  {formatDuration(item.durationSeconds)}
                </div>

                <div className="px-4 py-4">
                  <div className="flex flex-wrap justify-end gap-1 opacity-100 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:opacity-0">
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

                    <details className="w-full max-w-md">
                      <summary
                        className={`${theme.buttonSecondary} inline-flex min-h-11 cursor-pointer items-center justify-center px-3 text-xs font-bold`}
                      >
                        編集
                      </summary>
                      <div className={`mt-3 border-2 ${theme.border} ${theme.panelMuted} p-4`}>
                        <form
                          action={async (formData: FormData) => {
                            "use server";

                            if (!updateItemAction) {
                              return;
                            }

                            await updateItemAction({
                              eventId,
                              itemId: item.id,
                              itemType: String(formData.get("itemType") ?? item.itemType) as SetlistItemRecord["itemType"],
                              title: String(formData.get("title") ?? ""),
                              artist: String(formData.get("artist") ?? "") || null,
                              durationSeconds: parseOptionalNumber(formData.get("durationSeconds")),
                              notes: String(formData.get("notes") ?? "") || null,
                            });
                          }}
                          aria-label={`${item.title} の編集フォーム`}
                          className="grid gap-3"
                        >
                          <label className="grid gap-2 text-sm font-medium">
                            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                              項目種別
                            </span>
                            <select
                              name="itemType"
                              defaultValue={item.itemType}
                              className={`${theme.input} min-h-11 px-4 py-3`}
                            >
                              {ITEM_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                              タイトル
                            </span>
                            <input
                              type="text"
                              name="title"
                              defaultValue={item.title}
                              required
                              className={`${theme.input} min-h-11 px-4 py-3`}
                            />
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                              アーティスト
                            </span>
                            <input
                              type="text"
                              name="artist"
                              defaultValue={item.artist ?? ""}
                              placeholder="任意"
                              className={`${theme.inputMuted} min-h-11 px-4 py-3`}
                            />
                          </label>
                          <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                            <label className="grid gap-2 text-sm font-medium">
                              <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                                尺(秒)
                              </span>
                              <input
                                type="number"
                                min="0"
                                name="durationSeconds"
                                defaultValue={item.durationSeconds ?? ""}
                                placeholder="任意"
                                className={`${theme.inputMuted} min-h-11 px-4 py-3`}
                              />
                            </label>

                            <label className="grid gap-2 text-sm font-medium">
                              <span className="font-mono text-[11px] uppercase tracking-[0.26em]">
                                メモ
                              </span>
                              <input
                                type="text"
                                name="notes"
                                defaultValue={item.notes ?? ""}
                                placeholder="任意"
                                className={`${theme.inputMuted} min-h-11 px-4 py-3`}
                              />
                            </label>
                          </div>
                          <button
                            type="submit"
                            className={`${theme.buttonPrimary} min-h-11 px-4 text-xs font-bold`}
                          >
                            変更を保存
                          </button>
                        </form>
                      </div>
                    </details>

                    {pendingDeleteItemId === item.id ? (
                      <>
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
                            aria-label={`${item.title} の削除を確定`}
                            className={`${theme.destructive} min-h-11 px-3 text-xs font-bold`}
                          >
                            削除を確定
                          </button>
                        </form>
                        <Link
                          href={`/events/${eventId}?theme=${currentTheme}`}
                          className={`${theme.buttonSecondary} inline-flex min-h-11 items-center justify-center px-3 text-xs font-bold`}
                        >
                          キャンセル
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/events/${eventId}?theme=${currentTheme}&deleteItem=${item.id}`}
                        aria-label={`${item.title} を削除`}
                        className={`${theme.destructive} inline-flex min-h-11 items-center justify-center px-3 text-xs font-bold`}
                      >
                        削除
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
