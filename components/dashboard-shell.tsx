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
  headerShell: string;
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
  headerBrand: string;
  headerMeta: string;
  headerCurrentShow: string;
  currentEventSurface: string;
  currentEventText: string;
  currentEventMeta: string;
};

const DASHBOARD_THEME_STYLES: Record<PdfThemeName, DashboardThemeStyles> = {
  light: {
    page:
      "bg-[#fffdf8] text-[#1f1b16] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.18),_transparent_30%),linear-gradient(180deg,#fffdf8_0%,#f4efe4_100%)]",
    headerShell: "bg-[#fffdf8]/95 text-[#1f1b16]",
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
    headerBrand: "BACKSTAGE PRO",
    headerMeta: "LIVE PRODUCTION",
    headerCurrentShow: "text-[#1f1b16]",
    currentEventSurface: "bg-[#f6c453]",
    currentEventText: "text-[#1f1b16]",
    currentEventMeta: "text-[#3f3310]",
  },
  dark: {
    page:
      "bg-[#0f0f10] text-[#f6f3ee] [background-image:linear-gradient(180deg,#0f0f10_0%,#151515_100%)]",
    headerShell: "bg-[#131313]/92 text-[#f6f3ee]",
    rail: "bg-[#161616]",
    railBorder: "border-[#fff6df]/10",
    panel: "bg-[#181818]",
    panelAlt: "bg-[#232323]",
    panelMuted: "bg-[#1b1b1b]",
    border: "border-[#353534]",
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
    headerBrand: "SHOWRUNNER",
    headerMeta: "LIVE VIEW",
    headerCurrentShow: "text-[#f6c453]",
    currentEventSurface: "bg-[#3a3a3a]",
    currentEventText: "text-[#f6c453]",
    currentEventMeta: "text-[#fff6df]",
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
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b ${theme.railBorder} ${theme.headerShell} px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8`}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`text-xl font-black tracking-tighter ${theme.headerCurrentShow}`}
            >
              {theme.headerBrand}
            </span>
            <div
              className={`hidden min-[900px]:block border-l ${theme.railBorder} pl-4 text-[10px] font-mono uppercase tracking-[0.3em] ${theme.mutedText}`}
            >
              {theme.headerMeta}
              <span className={`ml-3 ${theme.headerCurrentShow}`}>CURRENT SHOW: {title}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {headerActions ? (
              <div className="flex flex-wrap items-center gap-3">{headerActions}</div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col lg:block">
        <aside
          className={`${theme.rail} ${theme.railBorder} border-b px-4 pb-5 pt-18 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-full lg:w-60 lg:border-b-0 lg:border-r lg:px-5 lg:pb-4 lg:pt-16`}
        >
          {sidebar}
        </aside>

        <div className="min-w-0 px-4 pb-8 pt-22 sm:px-6 lg:pl-[17.5rem] lg:pr-8 lg:pt-20">
          <section className={`border-l-4 ${theme.border} pl-4`}>
            <p
              className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}
            >
              {eyebrow}
            </p>
            <h1 className="mt-2 font-mono text-3xl font-black tracking-[-0.08em] sm:text-4xl">
              {title}
            </h1>
            <p className={`mt-3 max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
              {description}
            </p>
          </section>

          <div className="mt-5 space-y-5">{children}</div>
        </div>
      </div>
    </main>
  );
}
