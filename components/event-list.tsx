import Link from "next/link";
import type { EventSummary } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";
import { EventDeleteControl } from "./event-delete-control";

type EventListProps = {
  events: EventSummary[];
  currentEventId?: string | null;
  currentTheme: PdfThemeName;
  createEventAction?: (formData: FormData) => Promise<void>;
  duplicateEventAction?: (formData: FormData) => Promise<void>;
  deleteEventAction?: (formData: FormData) => Promise<void>;
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
  deleteEventAction,
}: EventListProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <nav aria-label="公演ナビゲーション" className="flex h-full flex-col gap-2">
      <div className={`px-2 font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
        Upcoming &amp; Recent
      </div>

      <div className="space-y-1">
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
                className={`border-l-4 ${
                  isCurrent
                    ? `${theme.accentBorder} ${theme.currentEventSurface} ${theme.currentEventText}`
                    : `border-transparent ${theme.panel} ${theme.border}`
                } transition ${theme.panelHover}`}
              >
                <Link
                  href={`/events/${event.id}?theme=${currentTheme}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className="block px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-mono text-[13px] font-bold tracking-[-0.03em]">
                        {event.title}
                      </p>
                      <p
                        className={`text-[11px] uppercase tracking-[0.2em] ${
                          isCurrent ? theme.currentEventMeta : theme.mutedText
                        }`}
                      >
                        {[event.venue || "会場未設定", formatEventDate(event.eventDate)].join(" / ")}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                        isCurrent ? "border-[#f6c453]/40 text-[#fff6df]" : theme.pill
                      }`}
                    >
                      {String(event.itemCount).padStart(2, "0")}
                    </span>
                  </div>
                </Link>

                {duplicateEventAction || deleteEventAction ? (
                  <div className="px-3 pb-3">
                    <div className="flex flex-wrap gap-2">
                    {duplicateEventAction ? (
                      <form action={duplicateEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="theme" value={currentTheme} />
                        <button
                          type="submit"
                          className={`${theme.buttonSecondary} min-h-9 px-3 text-[10px] font-black uppercase tracking-[0.2em]`}
                        >
                          複製
                        </button>
                      </form>
                    ) : null}

                    {deleteEventAction ? (
                      <EventDeleteControl
                        currentTheme={currentTheme}
                        eventId={event.id}
                        eventTitle={event.title}
                        triggerLabel="削除"
                        triggerClassName={`${theme.destructive} min-h-9 px-3 text-[10px] font-black uppercase tracking-[0.2em]`}
                        deleteEventAction={deleteEventAction}
                      />
                    ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </nav>
  );
}
