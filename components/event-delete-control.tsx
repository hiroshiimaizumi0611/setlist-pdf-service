"use client";

import { useState } from "react";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type EventDeleteControlProps = {
  currentTheme: PdfThemeName;
  eventId: string;
  eventTitle: string;
  triggerLabel: string;
  triggerClassName: string;
  deleteEventAction?: (formData: FormData) => Promise<void>;
};

export function EventDeleteControl({
  currentTheme,
  eventId,
  eventTitle,
  triggerLabel,
  triggerClassName,
  deleteEventAction,
}: EventDeleteControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = getDashboardThemeStyles(currentTheme);

  if (!deleteEventAction) {
    return null;
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-delete-modal-title"
            className={`w-full max-w-lg border-2 ${theme.border} ${theme.panel} shadow-2xl`}
          >
            <div className={`border-b ${theme.border} px-5 py-4`}>
              <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
                Delete Show
              </p>
              <h2
                id="event-delete-modal-title"
                className="mt-1 font-mono text-xl font-black tracking-[-0.05em]"
              >
                このセットリストを削除しますか？
              </h2>
            </div>

            <div className="space-y-3 px-5 py-5">
              <p className="text-sm leading-7">
                <span className="font-bold">{eventTitle}</span>
                {" "}
                を削除すると、曲順とメモも元に戻せません。
              </p>
              <p className={`text-xs leading-6 ${theme.mutedText}`}>
                続行する場合は削除、やめる場合はキャンセルを選んでください。
              </p>
            </div>

            <form action={deleteEventAction} className={`flex flex-wrap justify-end gap-2 border-t ${theme.border} px-5 py-4`}>
              <input type="hidden" name="eventId" value={eventId} />
              <input type="hidden" name="theme" value={currentTheme} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`${theme.buttonSecondary} min-h-10 px-5 text-sm font-black tracking-[0.14em] uppercase`}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={`${theme.destructive} min-h-10 px-5 text-sm font-black tracking-[0.14em] uppercase`}
              >
                削除
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
