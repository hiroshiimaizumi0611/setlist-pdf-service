import Link from "next/link";
import type { EventSummary } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type EventListProps = {
  events: EventSummary[];
  currentEventId?: string | null;
  currentTheme: PdfThemeName;
  createEventAction?: (formData: FormData) => Promise<void>;
};

function formatEventDate(value: Date | null) {
  if (!value) {
    return "日付未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(value);
}

export function EventList({
  events,
  currentEventId,
  currentTheme,
  createEventAction,
}: EventListProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <div className="flex h-full flex-col gap-5">
      <div className={`border-2 ${theme.border} ${theme.panel} p-4`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
          Backstage Rail
        </p>
        <h2 className="mt-3 font-mono text-2xl font-black tracking-[-0.08em]">
          公演一覧
        </h2>
        <p className={`mt-2 text-sm leading-6 ${theme.mutedText}`}>
          左レールから公演を切り替え、PDF用の進行表を即座に整えます。
        </p>
      </div>

      <form action={createEventAction} className="contents">
        <input type="hidden" name="theme" value={currentTheme} />
        <button
          type="submit"
          className={`${theme.buttonPrimary} min-h-11 w-full px-4 py-3 text-sm font-bold tracking-[0.14em] uppercase`}
        >
          新規公演を作成
        </button>
      </form>

      <nav aria-label="公演ナビゲーション" className="flex-1 space-y-3">
        {events.length === 0 ? (
          <div className={`border-2 ${theme.border} ${theme.panelMuted} p-4 text-sm leading-6 ${theme.mutedText}`}>
            まだ公演がありません。最初の公演を作成すると、ここに本番候補が並びます。
          </div>
        ) : (
          events.map((event) => {
            const isCurrent = event.id === currentEventId;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}?theme=${currentTheme}`}
                className={`block border-2 p-4 transition ${
                  isCurrent
                    ? `${theme.accentBg} ${theme.accentText} ${theme.accentBorder}`
                    : `${theme.panel} ${theme.border} ${theme.panelHover}`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em]">
                      Set {String(event.itemCount).padStart(2, "0")}
                    </p>
                    <p className="truncate font-mono text-sm font-bold tracking-[-0.03em]">
                      {event.title}
                    </p>
                    <p
                      className={`text-xs ${isCurrent ? theme.currentMutedText : theme.mutedText}`}
                    >
                      {[event.venue || "会場未設定", formatEventDate(event.eventDate)].join(
                        " / ",
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      isCurrent ? "border-[#3f3310] text-[#3f3310]" : theme.pill
                    }`}
                  >
                    {event.itemCount}曲
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
