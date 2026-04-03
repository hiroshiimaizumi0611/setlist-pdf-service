import Link from "next/link";
import type { EventSummary } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";
import { EventDeleteControl } from "./event-delete-control";
import { FormPendingButton } from "./form-pending-button";

type PerformanceArchiveTableProps = {
  events: EventSummary[];
  currentTheme: PdfThemeName;
  duplicateEventAction?: (formData: FormData) => Promise<void>;
  deleteEventAction?: (formData: FormData) => Promise<void>;
};

function formatDateForArchive(value: Date | null) {
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

function formatUpdatedAt(value: Date | null) {
  if (!value) {
    return "更新日未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(value);
}

function formatArchiveTheme(value: string | null | undefined) {
  if (value === "light") {
    return "Light";
  }

  if (value === "dark") {
    return "Dark";
  }

  return "未設定";
}

export function PerformanceArchiveTable({
  events,
  currentTheme,
  duplicateEventAction,
  deleteEventAction,
}: PerformanceArchiveTableProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`overflow-hidden border ${theme.border} ${theme.panel}`}>
      <table aria-label="公演アーカイブ一覧" className="w-full border-collapse text-left text-sm">
        <thead className={theme.tableHeader}>
          <tr>
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              Date
            </th>
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              Venue
            </th>
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              Show Title
            </th>
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              Theme
            </th>
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              Last Update
            </th>
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr
              key={event.id}
              className={`${index % 2 === 0 ? theme.panel : theme.panelAlt} border-t ${theme.border}`}
            >
              <td className={`px-4 py-4 font-mono text-xs ${theme.mutedText}`}>
                {formatDateForArchive(event.eventDate)}
              </td>
              <td className="px-4 py-4 font-mono text-xs uppercase tracking-[0.12em]">
                {event.venue || "会場未設定"}
              </td>
              <td className="px-4 py-4 font-mono text-sm font-bold tracking-[-0.03em]">
                <Link href={`/events/${event.id}?theme=${currentTheme}`}>{event.title}</Link>
                <div className={`mt-1 text-[11px] uppercase tracking-[0.18em] ${theme.mutedText}`}>
                  {event.itemCount}項目
                </div>
              </td>
              <td className={`px-4 py-4 font-mono text-xs ${theme.mutedText}`}>
                <span className={`inline-flex min-h-7 items-center border px-2 py-1 uppercase tracking-[0.18em] ${theme.border}`}>
                  {formatArchiveTheme(event.theme)}
                </span>
              </td>
              <td className={`px-4 py-4 font-mono text-xs ${theme.mutedText}`}>
                {formatUpdatedAt(event.updatedAt)}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/events/${event.id}?theme=${currentTheme}`}
                    className={`${theme.buttonSecondary} inline-flex min-h-9 items-center justify-center px-3 text-[10px] font-black uppercase tracking-[0.2em]`}
                  >
                    編集
                  </Link>
                  {duplicateEventAction ? (
                    <form action={duplicateEventAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="theme" value={currentTheme} />
                      <FormPendingButton
                        idleLabel="複製"
                        pendingLabel="複製中..."
                        className={`${theme.buttonSecondary} min-h-9 px-3 text-[10px] font-black uppercase tracking-[0.2em]`}
                      />
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
