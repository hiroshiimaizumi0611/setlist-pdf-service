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
      ? `${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-4 text-xs font-black tracking-[0.18em] uppercase`
      : `${theme.buttonSecondary} inline-flex min-h-11 items-center justify-center px-4 text-xs font-black tracking-[0.18em] uppercase`;
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
