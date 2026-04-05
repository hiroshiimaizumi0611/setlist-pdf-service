import type { ReactNode } from "react";
import type { DashboardThemeStyles } from "./dashboard-shell";

type StatusPanelProps = {
  theme: DashboardThemeStyles;
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function StatusPanel({
  theme,
  label,
  title,
  description,
  actions,
}: StatusPanelProps) {
  return (
    <section className={`border ${theme.border} ${theme.panelMuted} px-5 py-5 sm:px-6`}>
      <div className="space-y-4">
        <div className="space-y-3">
          <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            {label}
          </p>
          <div className={`w-16 border-t border-dashed ${theme.accentBorder}`} />
          <div className="space-y-2">
            <h2 className="font-mono text-2xl font-black tracking-[-0.06em] sm:text-3xl">
              {title}
            </h2>
            <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>{description}</p>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
