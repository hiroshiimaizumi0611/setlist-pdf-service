import Link from "next/link";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type ThemeToggleProps = {
  currentTheme: PdfThemeName;
  lightHref: string;
  darkHref: string;
};

export function ThemeToggle({
  currentTheme,
  lightHref,
  darkHref,
}: ThemeToggleProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  function getLinkClass(isActive: boolean) {
    return isActive
      ? `${theme.buttonPrimary} inline-flex min-h-10 items-center justify-center whitespace-nowrap px-3 text-[11px] font-black tracking-[0.14em] uppercase`
      : `${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center whitespace-nowrap px-3 text-[11px] font-black tracking-[0.14em] uppercase`;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={lightHref}
        aria-current={currentTheme === "light" ? "page" : undefined}
        className={getLinkClass(currentTheme === "light")}
      >
        ライトテーマ
      </Link>
      <Link
        href={darkHref}
        aria-current={currentTheme === "dark" ? "page" : undefined}
        className={getLinkClass(currentTheme === "dark")}
      >
        ダークテーマ
      </Link>
    </div>
  );
}
