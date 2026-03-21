import type { ReactNode } from "react";
import type { EventWithItems } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type EventMetadataFormProps = {
  event: EventWithItems;
  currentTheme: PdfThemeName;
  updateMetadataAction?: (formData: FormData) => Promise<void>;
  headerActions?: ReactNode;
};

function formatDateInput(value: Date | null) {
  if (!value) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });

  return formatter.format(value);
}

export function EventMetadataForm({
  event,
  currentTheme,
  updateMetadataAction,
  headerActions,
}: EventMetadataFormProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`border-2 ${theme.border} ${theme.panel}`}>
      <div
        className={`flex flex-col gap-4 border-b-2 ${theme.border} px-5 py-4 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div>
          <h2 className="font-mono text-2xl font-black tracking-[-0.06em]">公演情報</h2>
          <p className={`mt-1 text-sm leading-6 ${theme.mutedText}`}>
            出力されるPDFの見出しと共通メモをここで整えます。
          </p>
        </div>
        {headerActions ? <div className="flex flex-wrap gap-3">{headerActions}</div> : null}
      </div>

      <form action={updateMetadataAction} className="grid gap-4 p-5 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">公演名</span>
          <input
            type="text"
            name="title"
            defaultValue={event.title}
            className={`${theme.input} min-h-11 px-4 py-3`}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">会場</span>
          <input
            type="text"
            name="venue"
            defaultValue={event.venue ?? ""}
            className={`${theme.input} min-h-11 px-4 py-3`}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">公演日</span>
          <input
            type="date"
            name="eventDate"
            defaultValue={formatDateInput(event.eventDate)}
            className={`${theme.input} min-h-11 px-4 py-3`}
          />
        </label>

        <div className={`border ${theme.border} ${theme.panelMuted} px-4 py-3`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.26em]">出力テーマ</p>
          <p className={`mt-2 text-sm leading-6 ${theme.mutedText}`}>
            画面テーマとPDFテーマは連動しています。現在は
            <span className="ml-1 font-bold">
              {currentTheme === "light" ? "ライト" : "ダーク"}
            </span>
            です。
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium lg:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.26em]">備考</span>
          <textarea
            name="notes"
            defaultValue={event.notes ?? ""}
            rows={4}
            className={`${theme.inputMuted} resize-y px-4 py-3`}
          />
        </label>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className={`${theme.buttonSecondary} min-h-11 px-5 text-sm font-bold tracking-[0.14em] uppercase`}
          >
            公演情報を保存
          </button>
        </div>
      </form>
    </section>
  );
}
