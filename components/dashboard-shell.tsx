import type { ReactNode } from "react";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { SidebarRail } from "./sidebar-rail";
import type { AppGlobalNavActiveItem } from "./app-global-nav";

type DashboardShellProps = {
  currentTheme: PdfThemeName;
  sidebar: ReactNode;
  activeItem?: AppGlobalNavActiveItem;
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
      "bg-[#fffef8] text-[#201a14] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.14),_transparent_32%),linear-gradient(180deg,#fffef8_0%,#f5ede0_100%)]",
    headerShell: "bg-[#fffdf7]/95 text-[#201a14]",
    rail: "bg-[#f3ecdf]",
    railBorder: "border-[#2b241c]/18",
    panel: "bg-[#fffdf7]",
    panelAlt: "bg-[#f5efe4]",
    panelMuted: "bg-[#fbf6eb]",
    border: "border-[#2b241c]/18",
    text: "text-[#201a14]",
    mutedText: "text-[#62584a]",
    accentBg: "bg-[#f5c94a]",
    accentText: "text-[#201a14]",
    accentBorder: "border-[#d09a1a]",
    currentMutedText: "text-[#4a3c12]",
    panelHover: "hover:bg-[#f6edd7]",
    tableHeader: "bg-[#201a14] text-[#fffdf7]",
    buttonPrimary:
      "border border-[#2b241c]/80 bg-[#f5c94a] text-[#201a14] transition hover:bg-[#ffd86d]",
    buttonSecondary:
      "border border-[#2b241c]/70 bg-[#fffdf7] text-[#201a14] transition hover:bg-[#f6edd7]",
    input:
      "border border-[#2b241c]/70 bg-[#fffdf7] text-[#201a14] placeholder:text-[#7b7162] focus:border-[#c99a23] focus:outline-none",
    inputMuted:
      "border border-[#2b241c]/65 bg-[#fbf6eb] text-[#201a14] placeholder:text-[#7b7162] focus:border-[#c99a23] focus:outline-none",
    pill: "border border-[#2b241c]/65 bg-[#f4ebdd] text-[#201a14]",
    destructive:
      "border border-[#5f1f1a]/55 bg-[#f5e2de] text-[#8d2f27] transition hover:bg-[#efd0cb]",
    headerBrand: "BACKSTAGE PRO",
    headerMeta: "LIVE PRODUCTION",
    headerCurrentShow: "text-[#a87400]",
    currentEventSurface: "bg-[#fff3c9]",
    currentEventText: "text-[#8f6512]",
    currentEventMeta: "text-[#5d4a12]",
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
  activeItem = "archive",
  eyebrow,
  title,
  description,
  headerActions,
  children,
}: DashboardShellProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <main className={`${theme.page} min-h-screen`}>
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
        <SidebarRail
          currentTheme={currentTheme}
          activeItem={activeItem}
          pageContent={sidebar}
        />

        <div className="min-w-0 px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:py-6">
          <header
            className={`sticky top-0 z-20 border-b ${theme.railBorder} ${theme.headerShell} px-4 py-4 backdrop-blur-md sm:px-5`}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    className={`text-xl font-black tracking-tighter ${theme.headerCurrentShow}`}
                  >
                    {theme.headerBrand}
                  </span>
                  <div
                    className={`hidden min-[900px]:block border-l ${theme.railBorder} pl-4 text-[10px] font-mono uppercase tracking-[0.3em] ${theme.mutedText}`}
                  >
                    {theme.headerMeta}
                    <span className={`ml-3 ${theme.headerCurrentShow}`}>
                      CURRENT SHOW: {title}
                    </span>
                  </div>
                </div>
                <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {headerActions ? (
                  <div className="flex flex-wrap items-center gap-3">{headerActions}</div>
                ) : null}
              </div>
            </div>
          </header>

          <section className={`border-l-4 ${theme.border} pl-4`}>
            <p
              className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}
            >
              {eyebrow}
            </p>
            <h1 className="mt-2 font-mono text-3xl font-black tracking-[-0.08em] sm:text-4xl">
              {title}
            </h1>
          </section>

          <div className="mt-5 space-y-5">{children}</div>
        </div>
      </div>
    </main>
  );
}
