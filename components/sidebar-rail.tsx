"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppGlobalNav, type AppGlobalNavActiveItem } from "./app-global-nav";
import { LogoutButton } from "./logout-button";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

type SidebarRailProps = {
  currentTheme: PdfThemeName;
  activeItem?: AppGlobalNavActiveItem;
  brandLabel?: string;
  brandHref?: string;
  defaultCollapsed?: boolean;
  isAuthenticated?: boolean;
  pageContent?: (collapsed: boolean) => ReactNode;
  authenticatedUtility?: (collapsed: boolean) => ReactNode;
  guestUtility?: (collapsed: boolean) => ReactNode;
  footer?: (collapsed: boolean) => ReactNode;
  className?: string;
};

type SidebarRailTheme = {
  shell: string;
  border: string;
  text: string;
  mutedText: string;
  panel: string;
  panelMuted: string;
  subtleBorder: string;
  railEdge: string;
  toggle: string;
  toggleActive: string;
  toggleInactive: string;
  brandBadge: string;
  brandText: string;
  brandMeta: string;
  footerSurface: string;
  footerBorder: string;
};

const SIDEBAR_RAIL_THEME: Record<PdfThemeName, SidebarRailTheme> = {
  light: {
    shell:
      "bg-[#f3ecdf] text-[#201a14] [background-image:linear-gradient(180deg,#f4ebdd_0%,#efe4cf_100%)]",
    border: "border-[#2b241c]/18",
    text: "text-[#201a14]",
    mutedText: "text-[#62584a]",
    panel: "bg-[#fffdf7]",
    panelMuted: "bg-[#fbf6eb]",
    subtleBorder: "border-[#2b241c]/16",
    railEdge: "border-[#2b241c]/18",
    toggle: "border-[#2b241c]/18 bg-[#fffdf7]",
    toggleActive: "text-[#a87400] hover:bg-[#f5eddc]",
    toggleInactive: "text-[#62584a] hover:bg-[#f5eddc]",
    brandBadge: "bg-[#f5c94a] text-[#201a14]",
    brandText: "text-[#201a14]",
    brandMeta: "text-[#7b6e5e]",
    footerSurface: "bg-[#f8f1e3]",
    footerBorder: "border-[#2b241c]/16",
  },
  dark: {
    shell: "bg-[#161616] text-[#f6f3ee]",
    border: "border-[#fff6df]/10",
    text: "text-[#f6f3ee]",
    mutedText: "text-[#bfb7aa]",
    panel: "bg-[#1a1a1a]",
    panelMuted: "bg-[#202020]",
    subtleBorder: "border-[#38332b]",
    railEdge: "border-[#fff6df]/10",
    toggle: "border-[#38332b] bg-[#1a1a1a]",
    toggleActive: "text-[#f6c453] hover:bg-[#232323]",
    toggleInactive: "text-[#bfb7aa] hover:bg-[#232323]",
    brandBadge: "bg-[#f6c453] text-[#1f1b16]",
    brandText: "text-[#f6f3ee]",
    brandMeta: "text-[#91897c]",
    footerSurface: "bg-[#1c1b1b]",
    footerBorder: "border-[#38332b]",
  },
};

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M14.5 6.75 9.25 12l5.25 5.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="m9.5 6.75 5.25 5.25-5.25 5.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RailBrandMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6c453] text-sm font-black tracking-[-0.08em] text-[#1f1b16] shadow-[0_10px_30px_rgba(246,196,83,0.18)]">
      SP
    </span>
  );
}

export function SidebarRail({
  currentTheme,
  activeItem = null,
  brandLabel = "SETLIST PDF",
  brandHref = "/events",
  defaultCollapsed = false,
  isAuthenticated = true,
  pageContent,
  authenticatedUtility,
  guestUtility,
  footer,
  className,
}: SidebarRailProps) {
  const theme = SIDEBAR_RAIL_THEME[currentTheme];
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const utility = isAuthenticated ? authenticatedUtility : guestUtility;

  return (
    <aside
      className={[
        "flex flex-col gap-4 border-b px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-4 lg:py-4",
        theme.shell,
        theme.railEdge,
        collapsed ? "lg:w-[6rem]" : "lg:w-[19rem]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3">
        <Link
          href={brandHref}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border ${theme.subtleBorder} ${theme.panel} px-3 py-3 transition hover:border-[#f6c453]/60 hover:bg-[#262626]`}
        >
          <RailBrandMark />
          {!collapsed ? (
            <span className="min-w-0">
              <span className={`block truncate text-sm font-black tracking-[0.16em] ${theme.brandText}`}>
                {brandLabel}
              </span>
              <span className={`mt-1 block text-[10px] font-mono uppercase tracking-[0.26em] ${theme.brandMeta}`}>
                Backstage
              </span>
            </span>
          ) : (
            <span className="sr-only">{brandLabel}</span>
          )}
        </Link>

        <button
          type="button"
          aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          aria-pressed={collapsed}
          onClick={() => setCollapsed((current) => !current)}
          className={[
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-[#f6c453] focus:ring-offset-2 focus:ring-offset-transparent",
            theme.toggle,
            collapsed ? theme.toggleActive : theme.toggleInactive,
          ].join(" ")}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <div className="space-y-3">
        <p className={`px-1 text-[10px] font-mono uppercase tracking-[0.3em] ${theme.mutedText}`}>
          Navigation
        </p>
        <AppGlobalNav
          activeItem={activeItem}
          collapsed={collapsed}
          className="space-y-2"
          ariaLabel="アプリ全体ナビゲーション"
        />
      </div>

      {!collapsed && pageContent ? (
        <div className={`space-y-3 border-t ${theme.border} pt-4`}>
          {pageContent(collapsed)}
        </div>
      ) : null}

      {utility ? (
        <div className={`space-y-3 border-t ${theme.border} pt-4`}>
          {utility(collapsed)}
        </div>
      ) : null}

      <div className="mt-auto space-y-3">
        {footer ? (
          <div className={`rounded-3xl border px-3 py-3 ${theme.footerSurface} ${theme.footerBorder}`}>
            {footer(collapsed)}
          </div>
        ) : (
          <div className={`rounded-3xl border px-3 py-3 ${theme.footerSurface} ${theme.footerBorder}`}>
            <LogoutButton collapsed={collapsed} variant="rail" className="w-full" />
          </div>
        )}
      </div>
    </aside>
  );
}
