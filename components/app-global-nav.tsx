import Link from "next/link";
import type { HTMLAttributes } from "react";

export type AppGlobalNavActiveItem = "archive" | "templates" | "billing" | null;

type AppGlobalNavItem = {
  key: Exclude<AppGlobalNavActiveItem, null>;
  label: string;
  href: string;
};

type AppGlobalNavProps = {
  activeItem?: AppGlobalNavActiveItem;
  ariaLabel?: string;
} & Pick<HTMLAttributes<HTMLElement>, "className">;

const APP_GLOBAL_NAV_ITEMS: readonly AppGlobalNavItem[] = [
  { key: "archive", label: "アーカイブ", href: "/events" },
  { key: "templates", label: "テンプレート", href: "/templates" },
  { key: "billing", label: "請求", href: "/settings/billing" },
] as const;

const APP_GLOBAL_NAV_CLASSES = {
  base:
    "inline-flex min-h-9 items-center justify-center rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition",
  active:
    "border-[#f6c453] bg-[#f6c453] text-[#1f1b16] shadow-[0_0_0_1px_rgba(246,196,83,0.24)]",
  inactive:
    "border-[#38332b] bg-[#1b1b1b] text-[#bfb7aa] hover:border-[#4a453e] hover:bg-[#232323] hover:text-[#f6f3ee]",
} as const;

function getNavItemClassName(isActive: boolean) {
  return `${APP_GLOBAL_NAV_CLASSES.base} ${
    isActive ? APP_GLOBAL_NAV_CLASSES.active : APP_GLOBAL_NAV_CLASSES.inactive
  }`;
}

export function AppGlobalNav({
  activeItem = null,
  ariaLabel = "アプリ全体ナビゲーション",
  className,
}: AppGlobalNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex flex-wrap items-center gap-2">
        {APP_GLOBAL_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeItem;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={getNavItemClassName(isActive)}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
