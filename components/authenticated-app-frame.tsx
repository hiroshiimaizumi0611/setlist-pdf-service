import type { ReactNode } from "react";
import { SidebarRail } from "./sidebar-rail";
import type { AppGlobalNavActiveItem } from "./app-global-nav";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

type AuthenticatedAppFrameProps = {
  currentTheme: PdfThemeName;
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  userMenu?: ReactNode;
  activeItem?: AppGlobalNavActiveItem;
  pageSidebar?: (collapsed: boolean) => ReactNode;
  authenticatedUtility?: (collapsed: boolean) => ReactNode;
  guestUtility?: (collapsed: boolean) => ReactNode;
  footer?: (collapsed: boolean) => ReactNode;
  isAuthenticated?: boolean;
  children: ReactNode;
  className?: string;
};

type FrameTheme = {
  page: string;
  border: string;
  panel: string;
  railBorder: string;
  mutedText: string;
};

const FRAME_THEME: Record<PdfThemeName, FrameTheme> = {
  light: {
    page:
      "bg-[#fffef8] text-[#201a14] [background-image:radial-gradient(circle_at_top,_rgba(246,196,83,0.14),_transparent_32%),linear-gradient(180deg,#fffef8_0%,#f5ede0_100%)]",
    border: "border-[#2b241c]/18",
    panel: "bg-[#fffdf7]",
    railBorder: "border-[#2b241c]/18",
    mutedText: "text-[#62584a]",
  },
  dark: {
    page:
      "bg-[#0f0f10] text-[#f6f3ee] [background-image:linear-gradient(180deg,#0f0f10_0%,#151515_100%)]",
    border: "border-[#353534]",
    panel: "bg-[#181818]",
    railBorder: "border-[#fff6df]/10",
    mutedText: "text-[#bfb7aa]",
  },
};

export function AuthenticatedAppFrame({
  currentTheme,
  title,
  description,
  eyebrow,
  actions,
  userMenu,
  activeItem,
  pageSidebar,
  authenticatedUtility,
  guestUtility,
  footer,
  isAuthenticated = true,
  children,
  className,
}: AuthenticatedAppFrameProps) {
  const theme = FRAME_THEME[currentTheme];

  return (
    <main className={`${theme.page} min-h-screen ${className ?? ""}`.trim()}>
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
        <SidebarRail
          currentTheme={currentTheme}
          activeItem={activeItem}
          isAuthenticated={isAuthenticated}
          pageContent={pageSidebar}
          authenticatedUtility={authenticatedUtility}
          guestUtility={guestUtility}
          footer={footer}
          className={theme.railBorder}
        />

        <div className="min-w-0 px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:py-6">
          <header
            className={`sticky top-0 z-20 border-b ${theme.railBorder} ${theme.panel} px-4 py-4 backdrop-blur-md sm:px-5`}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                {eyebrow ? (
                  <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
                    {eyebrow}
                  </p>
                ) : null}
                <div className="space-y-2">
                  <h1 className="font-mono text-3xl font-black tracking-[-0.08em] sm:text-4xl">
                    {title}
                  </h1>
                  {description ? (
                    <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>{description}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
                {userMenu}
              </div>
            </div>
          </header>

          <div className="mt-5 space-y-5">{children}</div>
        </div>
      </div>
    </main>
  );
}
