import Link from "next/link";
import type { EventSummary } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type EventListProps = {
  events: EventSummary[];
  currentEventId?: string | null;
  currentTheme: PdfThemeName;
  createEventAction?: (formData: FormData) => Promise<void>;
  duplicateEventAction?: (formData: FormData) => Promise<void>;
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
  duplicateEventAction,
}: EventListProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <nav aria-label="公演ナビゲーション" className="flex h-full flex-col gap-3">
      <div className={`px-2 font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
        Upcoming &amp; Recent
      </div>

      <div className="space-y-2">
        {events.length === 0 ? (
          <div
            className={`border-2 ${theme.border} ${theme.panelMuted} px-3 py-4 text-sm leading-6 ${theme.mutedText}`}
          >
            まだ公演がありません。最初の公演を作成すると、ここに本番候補が並びます。
          </div>
        ) : (
          events.map((event) => {
            const isCurrent = event.id === currentEventId;

            return (
              <article
                key={event.id}
                className={`border-l-4 ${isCurrent ? theme.accentBorder : theme.railBorder} ${
                  isCurrent ? `${theme.accentBg} ${theme.accentText}` : `${theme.panel} ${theme.border}`
                } transition ${theme.panelHover}`}
              >
                <Link
                  href={`/events/${event.id}?theme=${currentTheme}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className="block px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-mono text-[13px] font-bold tracking-[-0.03em]">
                        {event.title}
                      </p>
                      <p
                        className={`text-[11px] uppercase tracking-[0.2em] ${
                          isCurrent ? theme.currentMutedText : theme.mutedText
                        }`}
                      >
                        {[event.venue || "会場未設定", formatEventDate(event.eventDate)].join(" / ")}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                        isCurrent ? "border-[#3f3310] text-[#3f3310]" : theme.pill
                      }`}
                    >
                      {String(event.itemCount).padStart(2, "0")}
                    </span>
                  </div>
                </Link>

                {duplicateEventAction ? (
                  <form action={duplicateEventAction} className="px-3 pb-3">
                    <input type="hidden" name="eventId" value={event.id} />
                    <input type="hidden" name="theme" value={currentTheme} />
                    <button
                      type="submit"
                      className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                        isCurrent ? "text-[#3f3310]" : theme.mutedText
                      } transition hover:opacity-80`}
                    >
                      この公演を複製
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </nav>
  );
}
