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
  const stripFrame =
    currentTheme === "dark"
      ? "bg-[#141414] shadow-[inset_0_1px_0_rgba(255,246,223,0.04)]"
      : "bg-[#f7f1e3]";
  const stripDivider = currentTheme === "dark" ? "bg-[#2b2a28]" : "bg-[#d7cfbe]";
  const fieldPanel = currentTheme === "dark" ? "bg-[#161616]" : theme.panel;
  const footerText = currentTheme === "dark" ? "text-[#91897c]" : theme.mutedText;

  return (
    <section
      data-editor-strip="metadata"
      className={`overflow-hidden border-2 ${theme.border} ${stripFrame}`}
    >
      <div
        className={`flex flex-col gap-3 border-b ${theme.border} px-4 py-3 md:flex-row md:items-center md:justify-between`}
      >
        <div className="space-y-1">
          <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            Show Info
          </p>
          <p
            data-strip-description="supporting"
            className={`text-sm leading-5 ${theme.mutedText}`}
          >
            Compact metadata strip for the printed show sheet.
          </p>
        </div>

        {headerActions ? <div className="flex flex-wrap gap-3">{headerActions}</div> : null}
      </div>

      <form action={updateMetadataAction} className={`grid gap-px ${stripDivider} md:grid-cols-4`}>
        <input type="hidden" name="theme" value={currentTheme} />
        <label className={`grid gap-2 px-4 py-3 ${fieldPanel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Date
          </span>
          <input
            type="date"
            name="eventDate"
            defaultValue={formatDateInput(event.eventDate)}
            aria-label="Date"
            className={`${theme.input} min-h-10 px-3 py-2`}
          />
        </label>

        <label className={`grid gap-2 px-4 py-3 ${fieldPanel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Venue
          </span>
          <input
            type="text"
            name="venue"
            defaultValue={event.venue ?? ""}
            aria-label="Venue"
            className={`${theme.input} min-h-10 px-3 py-2`}
          />
        </label>

        <label className={`grid gap-2 px-4 py-3 ${fieldPanel}`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Show Title
          </span>
          <input
            type="text"
            name="title"
            defaultValue={event.title}
            required
            aria-label="Show Title"
            className={`${theme.input} min-h-10 px-3 py-2`}
          />
        </label>

        <div
          role="status"
          aria-label="Sheet Theme"
          data-strip-field-tone="muted"
          className={`grid gap-2 px-4 py-3 ${theme.panelMuted}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfb7aa]">
            Sheet Theme
          </span>
          <div
            className={`flex min-h-10 items-center border ${theme.border} px-3 font-mono text-sm font-black uppercase tracking-[0.18em] ${fieldPanel}`}
          >
            {themeLabel}
          </div>
        </div>

        <label className={`grid gap-2 px-4 py-3 md:col-span-4 ${fieldPanel}`}>
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

        <div
          className={`flex items-center justify-between gap-3 border-t ${theme.border} bg-transparent px-4 py-3 md:col-span-4`}
        >
          <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${footerText}`}>
            Updated for print output and live edits
          </p>
          <button
            type="submit"
            data-strip-action="metadata-save"
            className={`${theme.buttonSecondary} min-h-10 px-5 text-sm font-black tracking-[0.14em] uppercase`}
          >
            Save Metadata
          </button>
        </div>
      </form>
    </section>
  );
}
