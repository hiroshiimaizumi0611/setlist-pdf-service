import type { ReactNode } from "react";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

type DashboardShellProps = {
  currentTheme: PdfThemeName;
  sidebar: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export type DashboardThemeStyles = {
  page: string;
  rail: string;
  railBorder: string;
  panel: string;
  panelAlt: string;
  panelMuted: string;
  border: string;
  text: string;
  mutedText: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  currentMutedText: string;
  panelHover: string;
  tableHeader: string;
  buttonPrimary: string;
  buttonSecondary: string;
  input: string;
  inputMuted: string;
  pill: string;
  destructive: string;
};

const DASHBOARD_THEME_STYLES: Record<PdfThemeName, DashboardThemeStyles> = {
  light: {
    page:
      "bg-[#fffdf8] text-[#1f1b16] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.18),_transparent_30%),linear-gradient(180deg,#fffdf8_0%,#f4efe4_100%)]",
    rail: "bg-[#f4efe4]",
    railBorder: "border-[#1f1b16]",
    panel: "bg-[#fffaf0]",
    panelAlt: "bg-[#efe3c6]",
    panelMuted: "bg-[#f7f1e3]",
    border: "border-[#1f1b16]",
    text: "text-[#1f1b16]",
    mutedText: "text-[#5f5649]",
    accentBg: "bg-[#f6c453]",
    accentText: "text-[#1f1b16]",
    accentBorder: "border-[#c99a23]",
    currentMutedText: "text-[#3f3310]",
    panelHover: "hover:bg-[#efe3c6]",
    tableHeader: "bg-[#1f1b16] text-[#fffdf8]",
    buttonPrimary:
      "border border-[#1f1b16] bg-[#f6c453] text-[#1f1b16] transition hover:bg-[#ffda78]",
    buttonSecondary:
      "border border-[#1f1b16] bg-[#fffdf8] text-[#1f1b16] transition hover:bg-[#efe3c6]",
    input:
      "border border-[#1f1b16] bg-[#fffdf8] text-[#1f1b16] placeholder:text-[#7b7162] focus:border-[#c99a23] focus:outline-none",
    inputMuted:
      "border border-[#1f1b16] bg-[#f7f1e3] text-[#1f1b16] placeholder:text-[#7b7162] focus:border-[#c99a23] focus:outline-none",
    pill: "border border-[#1f1b16] bg-[#efe3c6] text-[#1f1b16]",
    destructive:
      "border border-[#1f1b16] bg-[#2b2520] text-[#fffdf8] transition hover:bg-[#000000]",
  },
  dark: {
    page:
      "bg-[#111111] text-[#f6f3ee] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.14),_transparent_28%),linear-gradient(180deg,#111111_0%,#171717_100%)]",
    rail: "bg-[#191919]",
    railBorder: "border-[#38332b]",
    panel: "bg-[#171717]",
    panelAlt: "bg-[#222222]",
    panelMuted: "bg-[#1c1c1c]",
    border: "border-[#38332b]",
    text: "text-[#f6f3ee]",
    mutedText: "text-[#bfb7aa]",
    accentBg: "bg-[#f6c453]",
    accentText: "text-[#1f1b16]",
    accentBorder: "border-[#f6c453]",
    currentMutedText: "text-[#3f3310]",
    panelHover: "hover:bg-[#222222]",
    tableHeader: "bg-[#f6c453] text-[#1f1b16]",
    buttonPrimary:
      "border border-[#f6c453] bg-[#f6c453] text-[#1f1b16] transition hover:bg-[#ffe08a]",
    buttonSecondary:
      "border border-[#38332b] bg-[#171717] text-[#f6f3ee] transition hover:bg-[#222222]",
    input:
      "border border-[#38332b] bg-[#111111] text-[#f6f3ee] placeholder:text-[#91897c] focus:border-[#f6c453] focus:outline-none",
    inputMuted:
      "border border-[#38332b] bg-[#1c1c1c] text-[#f6f3ee] placeholder:text-[#91897c] focus:border-[#f6c453] focus:outline-none",
    pill: "border border-[#38332b] bg-[#222222] text-[#f6f3ee]",
    destructive:
      "border border-[#9f3a31] bg-[#3a1612] text-[#ffcdc7] transition hover:bg-[#571b15]",
  },
};

export function getDashboardThemeStyles(theme: PdfThemeName) {
  return DASHBOARD_THEME_STYLES[theme];
}

export function DashboardShell({
  currentTheme,
  sidebar,
  eyebrow,
  title,
  description,
  headerActions,
  children,
}: DashboardShellProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <main className={`${theme.page} min-h-screen`}>
      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          className={`${theme.rail} ${theme.railBorder} border-b-4 px-4 py-5 lg:min-h-screen lg:border-r-4 lg:border-b-0 lg:px-5 lg:py-6`}
        >
          {sidebar}
        </aside>

        <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className={`border-b-4 ${theme.border} pb-6`}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}
                >
                  {eyebrow}
                </p>
                <h1 className="font-mono text-3xl font-black tracking-[-0.08em] sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
                  {description}
                </p>
              </div>

              {headerActions ? (
                <div className="flex flex-wrap items-center gap-3">{headerActions}</div>
              ) : null}
            </div>
          </header>

          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
