"use client";

import type { SetlistItemRecord } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { SetlistItemType } from "@/lib/services/events-service";
import { getDashboardThemeStyles } from "./dashboard-shell";

type SetlistItemEditModalProps = {
  currentTheme: PdfThemeName;
  eventId: string;
  item: SetlistItemRecord;
  onClose: () => void;
  updateItemAction?: (input: {
    eventId: string;
    itemId: string;
    itemType?: SetlistItemType;
    title?: string;
    artist?: string | null;
    durationSeconds?: number | null;
    notes?: string | null;
  }) => Promise<unknown>;
};

const ITEM_TYPE_OPTIONS: Array<{ value: SetlistItemType; label: string }> = [
  { value: "song", label: "曲" },
  { value: "mc", label: "MC" },
  { value: "transition", label: "転換" },
  { value: "heading", label: "見出し" },
];

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function SetlistItemEditModal({
  currentTheme,
  eventId,
  item,
  onClose,
  updateItemAction,
}: SetlistItemEditModalProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  const handleSubmit = async (formData: FormData) => {
    if (!updateItemAction) {
      return;
    }

    await updateItemAction({
      eventId,
      itemId: item.id,
      itemType: String(formData.get("itemType") ?? item.itemType) as SetlistItemType,
      title: String(formData.get("title") ?? ""),
      artist: String(formData.get("artist") ?? "") || null,
      durationSeconds: parseOptionalNumber(formData.get("durationSeconds")),
      notes: String(formData.get("notes") ?? "") || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="setlist-item-edit-modal-title"
        className={`max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto border-2 ${theme.border} ${theme.panel}`}
      >
        <div className={`flex items-center justify-between gap-4 border-b-2 ${theme.border} px-5 py-4`}>
          <div>
            <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
              Edit Item
            </p>
            <h2
              id="setlist-item-edit-modal-title"
              className="mt-1 font-mono text-xl font-black tracking-[-0.05em]"
            >
              セットリスト項目を編集
            </h2>
          </div>
        </div>

        <form
          action={handleSubmit}
          aria-label={`${item.title} の編集フォーム`}
          className="grid gap-4 px-5 py-5"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
            <label className="grid gap-2 text-sm font-medium">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em]">項目種別</span>
              <select
                name="itemType"
                defaultValue={item.itemType}
                className={`${theme.input} min-h-10 px-4 py-2.5`}
              >
                {ITEM_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em]">タイトル</span>
              <input
                type="text"
                name="title"
                defaultValue={item.title}
                required
                className={`${theme.input} min-h-10 px-4 py-2.5`}
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em]">アーティスト</span>
              <input
                type="text"
                name="artist"
                defaultValue={item.artist ?? ""}
                placeholder="任意"
                className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em]">尺(秒)</span>
              <input
                type="number"
                min="0"
                name="durationSeconds"
                defaultValue={item.durationSeconds ?? ""}
                placeholder="任意"
                className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em]">メモ</span>
              <input
                type="text"
                name="notes"
                defaultValue={item.notes ?? ""}
                placeholder="任意"
                className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`${theme.buttonSecondary} min-h-10 px-5 text-sm font-black tracking-[0.14em] uppercase`}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`${theme.buttonPrimary} min-h-10 px-5 text-sm font-black tracking-[0.14em] uppercase`}
            >
              変更を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
