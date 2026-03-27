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
  const themeLabel = currentTheme === "light" ? "Light" : "Dark";

  return (
    <section className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}>
      <div
        className={`flex flex-col gap-3 border-b-2 ${theme.border} px-4 py-3 md:flex-row md:items-center md:justify-between`}
      >
        <div className="space-y-1">
          <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            Show Info
          </p>
          <p className={`text-sm leading-6 ${theme.mutedText}`}>
            Compact metadata strip for the printed show sheet.
          </p>
        </div>

        {headerActions ? <div className="flex flex-wrap gap-3">{headerActions}</div> : null}
      </div>

      <form action={updateMetadataAction} className="grid gap-px bg-black/10 md:grid-cols-4">
        <label className={`grid gap-2 px-4 py-3 ${theme.panel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Date
          </span>
          <input
            type="date"
            name="eventDate"
            defaultValue={formatDateInput(event.eventDate)}
            aria-label="Date"
            className={`${theme.input} min-h-11 px-3 py-2`}
          />
        </label>

        <label className={`grid gap-2 px-4 py-3 ${theme.panel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Venue
          </span>
          <input
            type="text"
            name="venue"
            defaultValue={event.venue ?? ""}
            aria-label="Venue"
            className={`${theme.input} min-h-11 px-3 py-2`}
          />
        </label>

        <label className={`grid gap-2 px-4 py-3 ${theme.panel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Show Title
          </span>
          <input
            type="text"
            name="title"
            defaultValue={event.title}
            required
            aria-label="Show Title"
            className={`${theme.input} min-h-11 px-3 py-2`}
          />
        </label>

        <div
          role="status"
          aria-label="Sheet Theme"
          className={`grid gap-2 px-4 py-3 ${theme.panelMuted}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Sheet Theme
          </span>
          <div className={`flex min-h-11 items-center border ${theme.border} px-3 font-mono text-sm font-black uppercase tracking-[0.18em] ${theme.panel}`}>
            {themeLabel}
          </div>
        </div>

        <label className={`grid gap-2 px-4 py-3 md:col-span-4 ${theme.panel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Notes
          </span>
          <textarea
            name="notes"
            defaultValue={event.notes ?? ""}
            rows={3}
            className={`${theme.inputMuted} resize-y px-3 py-2`}
          />
        </label>

        <div className={`flex items-center justify-between gap-3 border-t-2 ${theme.border} bg-transparent px-4 py-3 md:col-span-4`}>
          <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
            Updated for print output and live edits
          </p>
          <button
            type="submit"
            className={`${theme.buttonSecondary} min-h-11 px-5 text-sm font-black tracking-[0.14em] uppercase`}
          >
            Save Metadata
          </button>
        </div>
      </form>
    </section>
  );
}
