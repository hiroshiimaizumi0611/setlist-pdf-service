"use client";

import Link from "next/link";
import type { HTMLAttributes, ReactElement, SVGProps } from "react";

export type AppGlobalNavActiveItem = "archive" | "templates" | "billing" | "account" | null;

type AppGlobalNavItem = {
  key: Exclude<AppGlobalNavActiveItem, null>;
  label: string;
  href: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

type AppGlobalNavProps = {
  activeItem?: AppGlobalNavActiveItem;
  ariaLabel?: string;
  collapsed?: boolean;
} & Pick<HTMLAttributes<HTMLElement>, "className">;

function ArchiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 7.5h16M7.5 7.5V6.25A1.25 1.25 0 0 1 8.75 5h6.5A1.25 1.25 0 0 1 16.5 6.25V7.5m-8.75 0v11.25A1.25 1.25 0 0 0 9 20h6a1.25 1.25 0 0 0 1.25-1.25V7.5m-8.75 0h8.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TemplateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 5.75A1.75 1.75 0 0 1 7.75 4h8.5A1.75 1.75 0 0 1 18 5.75v12.5A1.75 1.75 0 0 1 16.25 20h-8.5A1.75 1.75 0 0 1 6 18.25V5.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.5h6M9 12h6M9 15.5h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BillingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.5 8.25A2.25 2.25 0 0 1 6.75 6h10.5A2.25 2.25 0 0 1 19.5 8.25v7.5A2.25 2.25 0 0 1 17.25 18H6.75A2.25 2.25 0 0 1 4.5 15.75v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M5.5 10.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 14.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 12.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm-6.25 6.5a6.25 6.25 0 0 1 12.5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const APP_GLOBAL_NAV_ITEMS: readonly AppGlobalNavItem[] = [
  { key: "archive", label: "アーカイブ", href: "/events", icon: ArchiveIcon },
  { key: "templates", label: "テンプレート", href: "/templates", icon: TemplateIcon },
  { key: "billing", label: "請求", href: "/settings/billing", icon: BillingIcon },
  { key: "account", label: "マイページ", href: "/account", icon: AccountIcon },
] as const;

const APP_GLOBAL_NAV_CLASSES = {
  base:
    "group flex min-h-10 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-[13px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#f6c453] focus:ring-offset-2 focus:ring-offset-transparent",
  active:
    "border-[#f6c453] bg-[#f6c453] text-[#1f1b16] shadow-[0_0_0_1px_rgba(246,196,83,0.24)]",
  inactive:
    "border-[#38332b] bg-[#1b1b1b] text-[#d5ccbe] hover:border-[#4a453e] hover:bg-[#232323] hover:text-[#f6f3ee]",
} as const;

function getNavItemClassName(isActive: boolean, collapsed: boolean) {
  return `${APP_GLOBAL_NAV_CLASSES.base} ${
    isActive ? APP_GLOBAL_NAV_CLASSES.active : APP_GLOBAL_NAV_CLASSES.inactive
  } ${collapsed ? "justify-center px-0" : ""}`;
}

export function AppGlobalNav({
  activeItem = null,
  ariaLabel = "アプリ全体ナビゲーション",
  collapsed = false,
  className,
}: AppGlobalNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="grid gap-2">
        {APP_GLOBAL_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeItem;
          const Icon = item.icon;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={item.label}
                className={getNavItemClassName(isActive, collapsed)}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {collapsed ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  <span className="min-w-0 truncate">{item.label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
