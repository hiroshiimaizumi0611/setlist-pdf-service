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
  pendingDeleteEventId?: string | null;
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
  pendingDeleteEventId,
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
                    {duplicateEventAction ? (
                      <form action={duplicateEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="theme" value={currentTheme} />
                        <button
                          type="submit"
                          className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                            isCurrent ? theme.currentEventMeta : theme.mutedText
                          } transition hover:opacity-80`}
                        >
                          この公演を複製
                        </button>
                      </form>
                    ) : null}

                    {deleteEventAction ? (
                      pendingDeleteEventId === event.id ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <form action={deleteEventAction}>
                            <input type="hidden" name="eventId" value={event.id} />
                            <input type="hidden" name="theme" value={currentTheme} />
                            <button
                              type="submit"
                              aria-label={`${event.title} の削除を確定`}
                              className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#d14b4b] transition hover:opacity-80"
                            >
                              削除を確定
                            </button>
                          </form>
                          <Link
                            href={
                              currentEventId
                                ? `/events/${currentEventId}?theme=${currentTheme}`
                                : `/events?theme=${currentTheme}`
                            }
                            className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                              isCurrent ? theme.currentEventMeta : theme.mutedText
                            } transition hover:opacity-80`}
                          >
                            キャンセル
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={
                            currentEventId
                              ? `/events/${currentEventId}?theme=${currentTheme}&deleteEvent=${event.id}`
                              : `/events?theme=${currentTheme}&deleteEvent=${event.id}`
                          }
                          className="mt-2 inline-flex font-mono text-[10px] uppercase tracking-[0.22em] text-[#d14b4b] transition hover:opacity-80"
                        >
                          削除
                        </Link>
                      )
                    ) : null}
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
