"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SetlistItemRecord } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";
import { SetlistItemEditModal } from "./setlist-item-edit-modal";

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

function getItemsSignature(items: SetlistItemRecord[]) {
  return items
    .map(
      (item) =>
        [
          item.id,
          item.updatedAt instanceof Date ? item.updatedAt.getTime() : item.updatedAt,
          item.position,
          item.itemType,
          item.title,
          item.artist ?? "",
          item.durationSeconds ?? "",
          item.notes ?? "",
        ].join(":"),
    )
    .join("|");
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [optimisticItems, setOptimisticItems] = useState(items);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const lastCanonicalItemsSignatureRef = useRef(getItemsSignature(items));
  const theme = getDashboardThemeStyles(currentTheme);
  const editingItem = optimisticItems.find((item) => item.id === editingItemId) ?? null;
  const canDragReorder = Boolean(reorderItemsAction) && !isSavingOrder;
  const itemsSignature = getItemsSignature(items);

  useEffect(() => {
    if (draggingItemId || isSavingOrder || itemsSignature === lastCanonicalItemsSignatureRef.current) {
      return;
    }

    lastCanonicalItemsSignatureRef.current = itemsSignature;
    setOptimisticItems(items);
  }, [draggingItemId, isSavingOrder, items, itemsSignature]);

  const reorderItems = async (targetItemId: string) => {
    if (!reorderItemsAction || isSavingOrder || !draggingItemId || draggingItemId === targetItemId) {
      setDraggingItemId(null);
      setDragOverItemId(null);
      return;
    }

    const nextItems = [...optimisticItems];
    const draggedIndex = nextItems.findIndex((candidate) => candidate.id === draggingItemId);
    const targetIndex = nextItems.findIndex((candidate) => candidate.id === targetItemId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggingItemId(null);
      setDragOverItemId(null);
      return;
    }

    const [draggedItem] = nextItems.splice(draggedIndex, 1);
    const insertionIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    nextItems.splice(insertionIndex, 0, draggedItem);

    setOptimisticItems(nextItems);
    setIsSavingOrder(true);

    try {
      await reorderItemsAction({
        eventId,
        orderedItemIds: nextItems.map((candidate) => candidate.id),
      });
    } catch {
      setOptimisticItems(items);
    } finally {
      setIsSavingOrder(false);
      setDraggingItemId(null);
      setDragOverItemId(null);
    }
  };
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
            song: "bg-[#fffdf8] hover:bg-[#fffaf0]",
            mc: "bg-[#f7f1e8] hover:bg-[#fbf4ea]",
            transition: "bg-[#fcf8ef] hover:bg-[#fffdf8] border-y border-[#2b241c]/12",
            heading: "bg-[#faf4e8] border-y border-[#2b241c]/12",
          },
          strip: {
            song: "bg-[#2b241c]",
            mc: "bg-[#d29a1c]",
            transition: "bg-[#796d5b]",
            heading: "bg-transparent",
          },
          cue: "text-[#1f1b16]",
          subtitle: "text-[#615547]",
          muted: "text-[#6c6051]",
          headingBorder: "border-[#2b241c]/16",
          duration: "text-[#615547]",
        };

  return (
    <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
      <div
        className={`flex flex-col gap-2 border-b-2 ${theme.border} px-5 py-3 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div>
          <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">セットリスト</h2>
          <p className={`mt-1 text-sm leading-6 ${theme.mutedText}`}>
            ドラッグで並び替えし、編集・削除は各行から操作します。
          </p>
        </div>
        <span
          className={`${theme.pill} inline-flex w-fit px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em]`}
        >
          {items.length}項目
        </span>
        {isSavingOrder ? (
          <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${theme.mutedText}`}>
            並び順を更新中...
          </span>
        ) : null}
      </div>

      <div className="space-y-0">
        {optimisticItems.map((item, index) => {
          const rowLabel = getRowLabel(item.itemType);
          const dragHandleLabel = `${item.title} をドラッグして並び替え`;
          const isReorderEnabled = canDragReorder;
          const isDragTarget = dragOverItemId === item.id && draggingItemId !== item.id;

          if (item.itemType === "heading") {
            return (
              <article
                key={item.id}
                onDragStart={(event) => {
                  if (!isReorderEnabled) {
                    return;
                  }

                  setDraggingItemId(item.id);
                  setDragOverItemId(item.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.id);
                }}
                onDragOver={(event) => {
                  if (!draggingItemId || draggingItemId === item.id) {
                    return;
                  }

                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOverItemId(item.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  reorderItems(item.id);
                }}
                onDragEnd={() => {
                  setDraggingItemId(null);
                  setDragOverItemId(null);
                }}
                data-row-variant="heading"
                data-row-rhythm="setlist"
                data-row-reorder-ready={reorderItemsAction ? "true" : "false"}
                data-row-edit-ready={updateItemAction ? "true" : "false"}
                data-row-drop-target={isDragTarget ? "true" : "false"}
                className={`group border-b ${theme.border} ${itemTone.row.heading} px-4 py-3 ${
                  isDragTarget ? "ring-2 ring-inset ring-[#f6c453]/70" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    data-row-drag-handle
                    aria-label={dragHandleLabel}
                    draggable={isReorderEnabled}
                    className={`hidden h-8 w-8 items-center justify-center border md:flex ${itemTone.headingBorder} font-mono text-[11px] font-black tracking-[0.28em] ${itemTone.cue}`}
                  >
                    ⋮⋮
                  </div>
                  <div
                    data-row-cue="heading"
                    className={`flex h-8 w-12 items-center justify-center border ${itemTone.headingBorder} font-mono text-sm font-black tracking-[0.24em] ${itemTone.cue}`}
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
                  <div
                    data-row-actions="desktop"
                    className="flex items-center gap-1 opacity-100 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <button
                      type="button"
                      onClick={() => setEditingItemId(item.id)}
                      disabled={!updateItemAction}
                      className={`${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center px-3 text-xs font-bold`}
                    >
                      編集
                    </button>
                    {pendingDeleteItemId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (!deleteItemAction) {
                              return;
                            }

                            void deleteItemAction({
                              eventId,
                              itemId: item.id,
                            });
                          }}
                          aria-label={`${item.title} の削除を確定`}
                          className={`${theme.destructive} min-h-10 px-3 text-xs font-bold`}
                        >
                          削除を確定
                        </button>
                        <Link
                          href={`/events/${eventId}?theme=${currentTheme}`}
                          className={`${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center px-3 text-xs font-bold`}
                        >
                          キャンセル
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/events/${eventId}?theme=${currentTheme}&deleteItem=${item.id}`}
                        aria-label={`${item.title} を削除`}
                        className={`${theme.destructive} inline-flex min-h-10 items-center justify-center px-3 text-xs font-bold`}
                      >
                        削除
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          }

          return (
            <article
              key={item.id}
              onDragStart={(event) => {
                if (!isReorderEnabled) {
                  return;
                }

                setDraggingItemId(item.id);
                setDragOverItemId(item.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", item.id);
              }}
              onDragOver={(event) => {
                if (!draggingItemId || draggingItemId === item.id) {
                  return;
                }

                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOverItemId(item.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                reorderItems(item.id);
              }}
              onDragEnd={() => {
                setDraggingItemId(null);
                setDragOverItemId(null);
              }}
              data-row-variant={item.itemType}
              data-row-rhythm="setlist"
              data-row-reorder-ready={reorderItemsAction ? "true" : "false"}
              data-row-edit-ready={updateItemAction ? "true" : "false"}
              data-row-drop-target={isDragTarget ? "true" : "false"}
              className={`group border-b ${theme.border} ${itemTone.row[item.itemType]} transition-colors ${
                isDragTarget ? "ring-2 ring-inset ring-[#f6c453]/70" : ""
              }`}
            >
              <div className="grid md:grid-cols-[24px_4px_56px_minmax(0,1fr)_88px_160px]">
                <div
                  data-row-drag-handle
                  aria-label={dragHandleLabel}
                  draggable={isReorderEnabled}
                  className={`hidden items-center justify-center border-b border-inherit px-2 py-3 font-mono text-[11px] font-black tracking-[0.28em] md:flex md:border-b-0 md:border-r ${itemTone.cue}`}
                >
                  ⋮⋮
                </div>

                <div
                  aria-hidden="true"
                  className={`${itemTone.strip[item.itemType]} min-h-full`}
                />

                <div
                  data-row-cue={item.itemType}
                  className={`flex items-center justify-center border-b border-inherit px-2.5 py-3 font-mono text-sm font-black tracking-[0.16em] md:border-b-0 md:border-r ${itemTone.cue}`}
                >
                  {formatCue(optimisticItems, index)}
                </div>

                <div data-row-content="primary" className="min-w-0 px-4 py-3 md:px-4">
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
                      <p className={`mt-1 truncate text-xs ${itemTone.muted}`}>{item.artist}</p>
                    ) : null}
                    {item.notes ? (
                      <p className={`mt-1 truncate text-xs ${itemTone.muted}`}>{item.notes}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center px-3 py-3 font-mono text-sm md:justify-center">
                  <span className={itemTone.duration}>{formatDuration(item.durationSeconds)}</span>
                </div>

                <div
                  data-row-actions="desktop"
                  className="flex items-center gap-2 px-3 py-3 md:flex-nowrap md:justify-end"
                >
                  <button
                    type="button"
                    onClick={() => setEditingItemId(item.id)}
                    disabled={!updateItemAction}
                    className={`${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center px-3 text-xs font-bold`}
                  >
                    編集
                  </button>
                  {pendingDeleteItemId === item.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (!deleteItemAction) {
                            return;
                          }

                          void deleteItemAction({
                            eventId,
                            itemId: item.id,
                          });
                        }}
                        aria-label={`${item.title} の削除を確定`}
                        className={`${theme.destructive} min-h-10 px-3 text-xs font-bold`}
                      >
                        削除を確定
                      </button>
                      <Link
                        href={`/events/${eventId}?theme=${currentTheme}`}
                        className={`${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center px-3 text-xs font-bold`}
                      >
                        キャンセル
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/events/${eventId}?theme=${currentTheme}&deleteItem=${item.id}`}
                      aria-label={`${item.title} を削除`}
                      className={`${theme.destructive} inline-flex min-h-10 items-center justify-center px-3 text-xs font-bold`}
                    >
                      削除
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editingItem ? (
        <SetlistItemEditModal
          currentTheme={currentTheme}
          eventId={eventId}
          item={editingItem}
          updateItemAction={updateItemAction}
          onClose={() => setEditingItemId(null)}
        />
      ) : null}
    </section>
  );
}
